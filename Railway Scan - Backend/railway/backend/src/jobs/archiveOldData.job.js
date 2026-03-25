const Inspection = require('../modules/inspection/model');
const InspectionArchive = require('../models/InspectionArchive.model');
const AIReport = require('../modules/ai/model');
const AIReportArchive = require('../models/AIReportArchive.model');
const PerformanceLog = require('../modules/performance/model');
const PerformanceLogArchive = require('../models/PerformanceLogArchive.model');
const logger = require('../utils/logger');

const archiveOldDataJob = async () => {
  const inspectionThresholdDays = parseInt(process.env.INSPECTION_ARCHIVE_DAYS, 10) || 365;
  const aiReportThresholdDays = parseInt(process.env.AI_REPORT_ARCHIVE_DAYS, 10) || 730;
  const performanceLogThresholdDays = parseInt(process.env.PERFORMANCE_LOG_ARCHIVE_DAYS, 10) || 730;
  
  const results = {
    inspections: 0,
    aiReports: 0,
    performanceLogs: 0,
  };

  // Archive old inspections
  const inspectionCutoff = new Date();
  inspectionCutoff.setDate(inspectionCutoff.getDate() - inspectionThresholdDays);
  
  const oldInspections = await Inspection.find({
    inspectionDate: { $lt: inspectionCutoff },
  }).limit(1000).lean();
  
  if (oldInspections.length > 0) {
    const archiveData = oldInspections.map(inspection => ({
      zoneCode: inspection.zoneCode,
      inspectionYear: inspection.inspectionYear,
      originalId: inspection._id,
      fitting: inspection.fitting,
      inspector: inspection.inspector,
      inspectionDate: inspection.inspectionDate,
      status: inspection.status,
      findings: inspection.findings,
      defectsFound: inspection.defectsFound,
      overallResult: inspection.overallResult,
      recommendations: inspection.recommendations,
    }));
    
    await InspectionArchive.insertMany(archiveData);
    await Inspection.deleteMany({
      _id: { $in: oldInspections.map(i => i._id) },
    });
    
    results.inspections = oldInspections.length;
  }

  // Archive old AI reports
  const aiReportCutoff = new Date();
  aiReportCutoff.setDate(aiReportCutoff.getDate() - aiReportThresholdDays);
  
  const oldAIReports = await AIReport.find({
    createdAt: { $lt: aiReportCutoff },
  }).limit(1000).lean();
  
  if (oldAIReports.length > 0) {
    const archiveData = oldAIReports.map(report => ({
      zoneCode: report.zoneCode,
      predictionYear: report.predictionYear,
      originalId: report._id,
      fitting: report.fitting,
      vendor: report.vendor,
      predictionData: report.predictionData,
      predictionResult: report.predictionResult,
      riskScore: report.riskScore,
      riskLevel: report.riskLevel,
    }));
    
    await AIReportArchive.insertMany(archiveData);
    await AIReport.deleteMany({
      _id: { $in: oldAIReports.map(r => r._id) },
    });
    
    results.aiReports = oldAIReports.length;
  }

  // Archive old performance logs
  const performanceLogCutoff = new Date();
  performanceLogCutoff.setDate(performanceLogCutoff.getDate() - performanceLogThresholdDays);
  
  const oldPerformanceLogs = await PerformanceLog.find({
    recordedDate: { $lt: performanceLogCutoff },
  }).limit(1000).lean();
  
  if (oldPerformanceLogs.length > 0) {
    const archiveData = oldPerformanceLogs.map(log => ({
      zoneCode: log.zoneCode,
      logYear: log.logYear,
      originalId: log._id,
      fitting: log.fitting,
      vendor: log.vendor,
      recordedDate: log.recordedDate,
      metrics: log.metrics,
      performanceScore: log.performanceScore,
    }));
    
    await PerformanceLogArchive.insertMany(archiveData);
    await PerformanceLog.deleteMany({
      _id: { $in: oldPerformanceLogs.map(l => l._id) },
    });
    
    results.performanceLogs = oldPerformanceLogs.length;
  }

  logger.info('Old data archiving completed', results);
  return results;
};

module.exports = archiveOldDataJob;
