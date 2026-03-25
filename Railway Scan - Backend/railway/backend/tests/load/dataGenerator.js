/**
 * Enhanced Test Data Generator
 * 
 * Generates realistic national-scale test data with configurable distribution
 */

require('dotenv').config();
const mongoose = require('mongoose');
const TrackFitting = require('../../src/modules/qr/model');
const Inspection = require('../../src/modules/inspection/model');
const AIReport = require('../../src/modules/ai/model');
const PerformanceLog = require('../../src/modules/performance/model');
const Vendor = require('../../src/modules/vendor/model');
const User = require('../../src/modules/auth/model');
const {
  RAILWAY_ZONES,
  ZONE_DISTRIBUTION_MODES,
  INSPECTION_DENSITY,
  AI_REPORT_FREQUENCY,
} = require('./config');

class DataGenerator {
  constructor(config = {}) {
    this.config = {
      fittingCount: config.fittingCount || 10000,
      zoneDistribution: config.zoneDistribution || ZONE_DISTRIBUTION_MODES.EVEN,
      inspectionDensity: config.inspectionDensity || 'MEDIUM',
      aiReportFrequency: config.aiReportFrequency || 'MEDIUM',
      batchSize: config.batchSize || 1000,
      concurrency: config.concurrency || 5,
      verbose: config.verbose !== false,
    };
    
    this.vendors = [];
    this.inspectors = [];
    this.stats = {
      fittings: 0,
      inspections: 0,
      aiReports: 0,
      performanceLogs: 0,
      startTime: null,
      endTime: null,
    };
  }

  log(message, data = {}) {
    if (this.config.verbose) {
      console.log(`[DataGen] ${message}`, data);
    }
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      this.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    this.log('✅ Disconnected from MongoDB');
  }

  getZoneDistribution() {
    const { zoneDistribution } = this.config;
    
    if (zoneDistribution === ZONE_DISTRIBUTION_MODES.EVEN) {
      // Equal distribution
      const perZone = Math.floor(this.config.fittingCount / RAILWAY_ZONES.length);
      return RAILWAY_ZONES.map(zone => ({ zone, count: perZone }));
    }
    
    if (zoneDistribution === ZONE_DISTRIBUTION_MODES.HOT_ZONE) {
      // 60% in NR, 20% in SR, 20% across rest
      const total = this.config.fittingCount;
      const hotZone = Math.floor(total * 0.6);
      const warmZone = Math.floor(total * 0.2);
      const remaining = total - hotZone - warmZone;
      const perColdZone = Math.floor(remaining / (RAILWAY_ZONES.length - 2));
      
      return RAILWAY_ZONES.map((zone, idx) => {
        if (idx === 0) return { zone, count: hotZone };
        if (idx === 1) return { zone, count: warmZone };
        return { zone, count: perColdZone };
      });
    }
    
    if (zoneDistribution === ZONE_DISTRIBUTION_MODES.RANDOM) {
      // Random distribution
      const distribution = [];
      let remaining = this.config.fittingCount;
      
      for (let i = 0; i < RAILWAY_ZONES.length - 1; i++) {
        const count = Math.floor(Math.random() * (remaining / (RAILWAY_ZONES.length - i)));
        distribution.push({ zone: RAILWAY_ZONES[i], count });
        remaining -= count;
      }
      
      distribution.push({ zone: RAILWAY_ZONES[RAILWAY_ZONES.length - 1], count: remaining });
      return distribution;
    }
    
    throw new Error(`Invalid zone distribution mode: ${zoneDistribution}`);
  }

  async setupVendorsAndUsers() {
    this.log('Setting up vendors and users...');
    
    // Create vendors (one per zone)
    const vendorPromises = RAILWAY_ZONES.map(async (zone, idx) => {
      const vendor = await Vendor.create({
        vendorCode: `VEN${String(idx + 1).padStart(3, '0')}`,
        name: `${zone} Railway Vendor`,
        email: `vendor.${zone.toLowerCase()}@railway.in`,
        phone: `+91${String(9000000000 + idx)}`,
        address: {
          street: `${zone} Railway Complex`,
          city: `${zone} City`,
          state: 'India',
          pincode: `${110000 + idx}`,
        },
        gstNumber: `GST${zone}${String(idx).padStart(10, '0')}`,
        panNumber: `PAN${zone}${String(idx).padStart(7, '0')}`,
        performanceScore: 75 + Math.random() * 20,
        riskScore: Math.random() * 30,
        isActive: true,
      });
      return vendor;
    });
    
    this.vendors = await Promise.all(vendorPromises);
    
    // Create inspectors (2 per zone)
    const inspectorPromises = RAILWAY_ZONES.flatMap((zone, idx) => {
      return [0, 1].map(async (subIdx) => {
        const inspector = await User.create({
          name: `Inspector ${zone}-${subIdx + 1}`,
          email: `inspector.${zone.toLowerCase()}.${subIdx + 1}@railway.in`,
          password: 'hashedpassword',
          role: 'INSPECTOR',
          isActive: true,
        });
        return inspector;
      });
    });
    
    this.inspectors = await Promise.all(inspectorPromises);
    
    this.log(`✅ Created ${this.vendors.length} vendors and ${this.inspectors.length} inspectors`);
  }

  generateFittingData(zone, serialNumber, vendor) {
    const year = 2020 + Math.floor(Math.random() * 5);
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    const manufacturingDate = new Date(year, month, day);
    
    const itemTypes = ['RAIL', 'SLEEPER', 'FASTENER', 'BOLT', 'CLIP', 'PLATE'];
    const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    
    const lotNumber = `LOT${zone}${year}${String(Math.floor(serialNumber / 1000)).padStart(4, '0')}`;
    const uniqueQRId = `IR-${itemType}-${year}-${lotNumber}-${String(serialNumber).padStart(6, '0')}`;
    
    const warrantyPeriod = 24 + Math.floor(Math.random() * 36);
    const warrantyExpiry = new Date(manufacturingDate);
    warrantyExpiry.setMonth(warrantyExpiry.getMonth() + warrantyPeriod);
    
    return {
      uniqueQRId,
      itemType,
      lotNumber,
      serialNumber: String(serialNumber).padStart(6, '0'),
      vendor: vendor._id,
      vendorCode: vendor.vendorCode,
      zoneCode: zone,
      manufacturingDate,
      manufactureYear: year,
      warrantyPeriod,
      warrantyExpiry,
      specifications: {
        material: 'High Carbon Steel',
        grade: `Grade ${Math.floor(Math.random() * 5) + 1}`,
        weight: `${50 + Math.random() * 50}kg`,
      },
      status: 'MANUFACTURED',
      riskScore: Math.random() * 100,
      inspectionCount: 0,
      defectCount: 0,
    };
  }

  async generateFittings() {
    this.log('Generating fittings...');
    const distribution = this.getZoneDistribution();
    
    let totalGenerated = 0;
    
    for (const { zone, count } of distribution) {
      const vendor = this.vendors.find(v => v.vendorCode.includes(RAILWAY_ZONES.indexOf(zone) + 1));
      const batches = Math.ceil(count / this.config.batchSize);
      
      for (let batch = 0; batch < batches; batch++) {
        const batchSize = Math.min(this.config.batchSize, count - (batch * this.config.batchSize));
        const fittings = [];
        
        for (let i = 0; i < batchSize; i++) {
          const serialNumber = (batch * this.config.batchSize) + i + 1;
          fittings.push(this.generateFittingData(zone, serialNumber, vendor));
        }
        
        await TrackFitting.insertMany(fittings, { ordered: false });
        totalGenerated += fittings.length;
        
        this.log(`Progress: ${totalGenerated}/${this.config.fittingCount} fittings (${zone})`);
      }
    }
    
    this.stats.fittings = totalGenerated;
    this.log(`✅ Generated ${totalGenerated} fittings`);
  }

  generateInspectionData(fitting, inspector) {
    const inspectionDate = new Date(fitting.manufacturingDate);
    inspectionDate.setDate(inspectionDate.getDate() + Math.floor(Math.random() * 365));
    
    const passed = Math.random() > 0.15; // 85% pass rate
    
    return {
      fitting: fitting._id,
      inspector: inspector._id,
      zoneCode: fitting.zoneCode,
      inspectionDate,
      inspectionYear: inspectionDate.getFullYear(),
      status: 'COMPLETED',
      findings: {
        visualInspection: { passed, notes: 'Visual check completed' },
        dimensionalCheck: { passed, notes: 'Dimensions verified' },
        functionalTest: { passed, notes: 'Functional test passed' },
      },
      defectsFound: passed ? [] : [{
        type: 'WEAR',
        description: 'Minor wear detected',
        severity: 'LOW',
      }],
      overallResult: passed ? 'PASS' : 'FAIL',
      recommendations: passed ? [] : ['Schedule replacement'],
    };
  }

  async generateInspections() {
    this.log('Generating inspections...');
    
    const densityConfig = INSPECTION_DENSITY[this.config.inspectionDensity];
    const fittings = await TrackFitting.find().select('_id zoneCode manufacturingDate').lean();
    
    let totalInspections = 0;
    const batchSize = 1000;
    let inspectionBatch = [];
    
    for (const fitting of fittings) {
      const inspectionCount = densityConfig.min + Math.floor(Math.random() * (densityConfig.max - densityConfig.min));
      const zoneInspectors = this.inspectors.filter(i => i.email.includes(fitting.zoneCode.toLowerCase()));
      
      for (let i = 0; i < inspectionCount; i++) {
        const inspector = zoneInspectors[Math.floor(Math.random() * zoneInspectors.length)];
        inspectionBatch.push(this.generateInspectionData(fitting, inspector));
        
        if (inspectionBatch.length >= batchSize) {
          await Inspection.insertMany(inspectionBatch, { ordered: false });
          totalInspections += inspectionBatch.length;
          inspectionBatch = [];
          
          if (totalInspections % 10000 === 0) {
            this.log(`Progress: ${totalInspections} inspections generated`);
          }
        }
      }
    }
    
    if (inspectionBatch.length > 0) {
      await Inspection.insertMany(inspectionBatch, { ordered: false });
      totalInspections += inspectionBatch.length;
    }
    
    this.stats.inspections = totalInspections;
    this.log(`✅ Generated ${totalInspections} inspections`);
  }

  generateAIReportData(fitting, inspection) {
    const riskScore = 20 + Math.random() * 80;
    
    return {
      fitting: fitting._id,
      vendor: fitting.vendor,
      zoneCode: fitting.zoneCode,
      predictionYear: new Date().getFullYear(),
      predictionData: {
        inspectionHistory: inspection ? [inspection._id] : [],
        ageInDays: Math.floor((new Date() - new Date(fitting.manufacturingDate)) / (1000 * 60 * 60 * 24)),
      },
      predictionResult: {
        riskScore,
        failureProbability: riskScore / 100,
      },
      riskScore,
      riskLevel: riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH_RISK' : riskScore >= 30 ? 'MEDIUM_RISK' : 'LOW_RISK',
      recommendations: riskScore >= 70 ? ['Immediate inspection required'] : ['Continue monitoring'],
      confidence: 70 + Math.random() * 25,
      modelVersion: 'v1.0',
      processingTime: 100 + Math.random() * 400,
    };
  }

  async generateAIReports() {
    this.log('Generating AI reports...');
    
    const frequency = AI_REPORT_FREQUENCY[this.config.aiReportFrequency];
    const inspections = await Inspection.find()
      .populate('fitting', 'vendor zoneCode manufacturingDate')
      .select('_id fitting')
      .lean();
    
    let totalReports = 0;
    const batchSize = 1000;
    let reportBatch = [];
    
    for (const inspection of inspections) {
      if (Math.random() < frequency && inspection.fitting) {
        reportBatch.push(this.generateAIReportData(inspection.fitting, inspection));
        
        if (reportBatch.length >= batchSize) {
          await AIReport.insertMany(reportBatch, { ordered: false });
          totalReports += reportBatch.length;
          reportBatch = [];
          
          if (totalReports % 5000 === 0) {
            this.log(`Progress: ${totalReports} AI reports generated`);
          }
        }
      }
    }
    
    if (reportBatch.length > 0) {
      await AIReport.insertMany(reportBatch, { ordered: false });
      totalReports += reportBatch.length;
    }
    
    this.stats.aiReports = totalReports;
    this.log(`✅ Generated ${totalReports} AI reports`);
  }

  async generate() {
    this.stats.startTime = Date.now();
    
    try {
      await this.connect();
      await this.setupVendorsAndUsers();
      await this.generateFittings();
      await this.generateInspections();
      await this.generateAIReports();
      
      this.stats.endTime = Date.now();
      const duration = (this.stats.endTime - this.stats.startTime) / 1000;
      
      this.log('\n✅ Data generation complete!');
      this.log('Statistics:', {
        fittings: this.stats.fittings,
        inspections: this.stats.inspections,
        aiReports: this.stats.aiReports,
        duration: `${duration.toFixed(2)}s`,
        throughput: `${(this.stats.fittings / duration).toFixed(2)} fittings/s`,
      });
      
      await this.disconnect();
      
      return this.stats;
    } catch (error) {
      console.error('❌ Data generation failed:', error);
      await this.disconnect();
      throw error;
    }
  }
}

module.exports = DataGenerator;

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const config = {};
  
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key === '--count') config.fittingCount = parseInt(value);
    if (key === '--distribution') config.zoneDistribution = value;
    if (key === '--density') config.inspectionDensity = value;
    if (key === '--ai-frequency') config.aiReportFrequency = value;
    if (key === '--batch-size') config.batchSize = parseInt(value);
  });
  
  const generator = new DataGenerator(config);
  generator.generate().catch(console.error);
}
