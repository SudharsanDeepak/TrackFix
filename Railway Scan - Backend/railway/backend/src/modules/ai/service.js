const axios = require('axios');
const config = require('../../config');
const logger = require('../../utils/logger');
const { ExternalServiceError } = require('../../utils/errors');
const aiReportRepository = require('./repository');
const qrRepository = require('../qr/repository');
const vendorRepository = require('../vendor/repository');
const { extractYearFromDate } = require('../../utils/shardingHelper');

class AIService {
  constructor() {
    this.client = axios.create({
      baseURL: config.ai.serviceUrl,
      timeout: config.ai.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('AI Service Error:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  async predict(fittingId) {
    try {
      const fitting = await qrRepository.findById(fittingId);
      if (!fitting) {
        throw new Error('Fitting not found');
      }

      const payload = this.buildPredictionPayload(fitting);

      const response = await this.client.post('/predict', payload);

      // Extract predictionYear from current date
      const predictionYear = extractYearFromDate(new Date());

      const aiReport = await aiReportRepository.create({
        fitting: fittingId,
        vendor: fitting.vendor,
        zoneCode: fitting.zoneCode,
        predictionYear,
        predictionData: payload,
        predictionResult: response.data,
        riskScore: response.data.riskScore || 0,
        predictedFailureDate: response.data.predictedFailureDate,
        recommendations: response.data.recommendations || [],
        confidence: response.data.confidence || 0,
        modelVersion: response.data.modelVersion || 'v1.0',
      });

      await qrRepository.updateRiskScore(fittingId, response.data.riskScore);

      if (response.data.riskScore >= 70) {
        await vendorRepository.updateRiskScore(fitting.vendor, response.data.riskScore);
      }

      logger.info('AI prediction completed:', {
        fittingId,
        zoneCode: fitting.zoneCode,
        riskScore: response.data.riskScore,
      });

      return aiReport;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        logger.error('AI service timeout:', { fittingId });
        throw new ExternalServiceError('AI service timeout');
      }

      if (error.response) {
        throw new ExternalServiceError(`AI service error: ${error.response.data.message || 'Unknown error'}`);
      }

      throw new ExternalServiceError('AI service unavailable');
    }
  }

  buildPredictionPayload(fitting) {
    return {
      fittingId: fitting._id,
      uniqueQRId: fitting.uniqueQRId,
      itemType: fitting.itemType,
      vendorCode: fitting.vendorCode,
      zoneCode: fitting.zoneCode,
      manufacturingDate: fitting.manufacturingDate,
      installationDate: fitting.installationDate,
      warrantyExpiry: fitting.warrantyExpiry,
      inspectionCount: fitting.inspectionCount,
      defectCount: fitting.defectCount,
      currentRiskScore: fitting.riskScore,
      location: fitting.location,
      specifications: fitting.specifications,
      ageInDays: Math.floor((new Date() - new Date(fitting.manufacturingDate)) / (1000 * 60 * 60 * 24)),
    };
  }

  async getReportsByFitting(fittingId, pagination) {
    // Get fitting to extract zoneCode
    const fitting = await qrRepository.findById(fittingId);
    if (!fitting) {
      throw new Error('Fitting not found');
    }

    const reports = await aiReportRepository.findByFitting(fitting.zoneCode, fittingId, {
      skip: pagination.skip,
      limit: pagination.limit,
    });
    const total = await aiReportRepository.count({ zoneCode: fitting.zoneCode, fitting: fittingId });
    return { reports, total };
  }

  async getHighRiskPredictions(zoneCode, threshold = 70) {
    return await aiReportRepository.findHighRisk(zoneCode, threshold);
  }
}

module.exports = new AIService();
