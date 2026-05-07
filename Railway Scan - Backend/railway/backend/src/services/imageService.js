const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const sharp = require('sharp');
const logger = require('../utils/logger');

/**
 * Image Storage Service
 * Handles optimized image storage using GridFS for large files and Buffer for small files
 */
class ImageService {
  constructor() {
    this.bucket = null;
    this.initialized = false;
  }

  /**
   * Initialize GridFS bucket
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      const db = mongoose.connection.db;
      this.bucket = new GridFSBucket(db, {
        bucketName: 'inspectionImages',
        chunkSizeBytes: 1024 * 1024, // 1MB chunks
      });
      this.initialized = true;
      logger.info('ImageService initialized with GridFS bucket');
    } catch (error) {
      logger.error('Failed to initialize ImageService:', error);
      throw error;
    }
  }

  /**
   * Process and store images with optimization
   * @param {Array} base64Images - Array of base64 image strings
   * @param {Object} options - Processing options
   * @returns {Promise<Array>} Array of stored image references
   */
  async processAndStoreImages(base64Images, options = {}) {
    await this.initialize();
    
    const {
      maxSize = 1024 * 1024, // 1MB threshold for GridFS
      quality = 80,
      format = 'jpeg',
      resize = { width: 1024, height: 1024 }
    } = options;

    const storedImages = [];

    for (const base64Image of base64Images) {
      try {
        const imageRef = await this.processSingleImage(base64Image, {
          maxSize,
          quality,
          format,
          resize
        });
        storedImages.push(imageRef);
      } catch (error) {
        logger.error('Failed to process image:', error);
        // Continue with other images
      }
    }

    return storedImages;
  }

  /**
   * Process a single image
   * @param {string} base64Image - Base64 image string
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Image reference object
   */
  async processSingleImage(base64Image, options) {
    const { maxSize, quality, format, resize } = options;

    // Extract content type and base64 data
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image format');
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Process image with Sharp
    const processedBuffer = await sharp(buffer)
      .resize(resize.width, resize.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality })
      .toBuffer();

    // Determine storage method based on size
    if (processedBuffer.length <= maxSize) {
      // Store as Buffer for small images
      return {
        type: 'buffer',
        data: processedBuffer,
        contentType: `image/${format}`,
        size: processedBuffer.length,
        originalSize: buffer.length,
        compressionRatio: ((buffer.length - processedBuffer.length) / buffer.length * 100).toFixed(2)
      };
    } else {
      // Store in GridFS for large images
      const fileId = await this.storeInGridFS(processedBuffer, `image/${format}`);
      return {
        type: 'gridfs',
        fileId,
        contentType: `image/${format}`,
        size: processedBuffer.length,
        originalSize: buffer.length,
        compressionRatio: ((buffer.length - processedBuffer.length) / buffer.length * 100).toFixed(2)
      };
    }
  }

  /**
   * Store image in GridFS
   * @param {Buffer} buffer - Image buffer
   * @param {string} contentType - Content type
   * @returns {Promise<ObjectId>} GridFS file ID
   */
  async storeInGridFS(buffer, contentType) {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream({
        contentType,
        metadata: {
          uploadedAt: new Date(),
          fileSize: buffer.length
        }
      });

      uploadStream.on('error', reject);
      uploadStream.on('finish', () => resolve(uploadStream.id));

      uploadStream.end(buffer);
    });
  }

  /**
   * Retrieve image from storage
   * @param {Object} imageRef - Image reference object
   * @returns {Promise<string>} Base64 image string
   */
  async retrieveImage(imageRef) {
    if (imageRef.type === 'buffer') {
      // Return buffer as base64
      return `data:${imageRef.contentType};base64,${imageRef.data.toString('base64')}`;
    } else if (imageRef.type === 'gridfs') {
      await this.initialize();
      const buffer = await this.retrieveFromGridFS(imageRef.fileId);
      return `data:${imageRef.contentType};base64,${buffer.toString('base64')}`;
    } else {
      throw new Error('Invalid image reference type');
    }
  }

  /**
   * Retrieve image from GridFS
   * @param {ObjectId} fileId - GridFS file ID
   * @returns {Promise<Buffer>} Image buffer
   */
  async retrieveFromGridFS(fileId) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      
      const downloadStream = this.bucket.openDownloadStream(fileId);
      
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      downloadStream.on('error', reject);
      
      downloadStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  /**
   * Delete image from storage
   * @param {Object} imageRef - Image reference object
   * @returns {Promise<void>}
   */
  async deleteImage(imageRef) {
    if (imageRef.type === 'gridfs') {
      await this.initialize();
      await this.bucket.delete(imageRef.fileId);
    }
    // Buffer images are cleaned up automatically when document is deleted
  }

  /**
   * Delete multiple images
   * @param {Array} imageRefs - Array of image reference objects
   * @returns {Promise<void>}
   */
  async deleteImages(imageRefs) {
    const deletePromises = imageRefs
      .filter(ref => ref.type === 'gridfs')
      .map(ref => this.deleteImage(ref));
    
    await Promise.all(deletePromises);
  }

  /**
   * Get image metadata
   * @param {Object} imageRef - Image reference object
   * @returns {Promise<Object>} Image metadata
   */
  async getImageMetadata(imageRef) {
    if (imageRef.type === 'buffer') {
      return {
        type: 'buffer',
        size: imageRef.size,
        contentType: imageRef.contentType,
        compressionRatio: imageRef.compressionRatio
      };
    } else if (imageRef.type === 'gridfs') {
      await this.initialize();
      const file = await this.bucket.find({ _id: imageRef.fileId }).next();
      return {
        type: 'gridfs',
        size: file.length,
        contentType: file.contentType,
        uploadDate: file.uploadDate,
        metadata: file.metadata
      };
    }
  }

  /**
   * Convert legacy Buffer images to optimized format
   * @param {Array} legacyImages - Array of legacy image objects with Buffer data
   * @returns {Promise<Array>} Array of optimized image references
   */
  async convertLegacyImages(legacyImages) {
    const convertedImages = [];

    for (const legacyImage of legacyImages) {
      if (legacyImage.data && legacyImage.data.buffer) {
        // Convert Buffer to base64 for processing
        const base64Image = `data:${legacyImage.contentType || 'image/jpeg'};base64,${legacyImage.data.buffer.toString('base64')}`;
        
        try {
          const optimizedImage = await this.processSingleImage(base64Image, {
            maxSize: 512 * 1024, // 512KB threshold for legacy conversion
            quality: 75,
            format: 'jpeg',
            resize: { width: 800, height: 800 }
          });
          convertedImages.push(optimizedImage);
        } catch (error) {
          logger.error('Failed to convert legacy image:', error);
          // Keep original if conversion fails
          convertedImages.push({
            type: 'buffer',
            data: legacyImage.data.buffer,
            contentType: legacyImage.contentType || 'image/jpeg',
            size: legacyImage.data.buffer.length,
            originalSize: legacyImage.data.buffer.length,
            compressionRatio: '0'
          });
        }
      }
    }

    return convertedImages;
  }
}

module.exports = new ImageService();
