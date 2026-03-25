const TrackFitting = require('../qr/model');
const Vendor = require('../vendor/model');
const AIReport = require('../ai/model');
const CacheService = require('../../utils/cache');
const { CACHE_KEYS } = require('../../shared/constants');
const logger = require('../../utils/logger');

class DashboardService {
  async getOverviewStats() {
    const cacheKey = `${CACHE_KEYS.DASHBOARD_STATS}:overview`;
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const [
      totalFittings,
      activeFittings,
      defectiveFittings,
      recalledFittings,
      totalVendors,
      activeVendors,
      blacklistedVendors,
      highRiskFittings,
    ] = await Promise.all([
      TrackFitting.countDocuments(),
      TrackFitting.countDocuments({ status: 'OPERATIONAL' }),
      TrackFitting.countDocuments({ status: 'DEFECTIVE' }),
      TrackFitting.countDocuments({ isRecalled: true }),
      Vendor.countDocuments(),
      Vendor.countDocuments({ isActive: true }),
      Vendor.countDocuments({ isBlacklisted: true }),
      TrackFitting.countDocuments({ riskScore: { $gte: 70 } }),
    ]);

    const stats = {
      fittings: {
        total: totalFittings,
        active: activeFittings,
        defective: defectiveFittings,
        recalled: recalledFittings,
        highRisk: highRiskFittings,
      },
      vendors: {
        total: totalVendors,
        active: activeVendors,
        blacklisted: blacklistedVendors,
      },
    };

    await CacheService.set(cacheKey, stats, 300);
    return stats;
  }

  async getVendorRanking(limit = 10) {
    const cacheKey = `${CACHE_KEYS.VENDOR_RANKING}:${limit}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const ranking = await Vendor.aggregate([
      { $match: { isActive: true, isBlacklisted: false } },
      {
        $project: {
          vendorCode: 1,
          name: 1,
          performanceScore: 1,
          riskScore: 1,
          totalFittingsSupplied: 1,
          defectiveCount: 1,
          defectRate: {
            $cond: [
              { $eq: ['$totalFittingsSupplied', 0] },
              0,
              { $multiply: [{ $divide: ['$defectiveCount', '$totalFittingsSupplied'] }, 100] },
            ],
          },
        },
      },
      { $sort: { performanceScore: -1, defectRate: 1 } },
      { $limit: limit },
    ]);

    await CacheService.set(cacheKey, ranking, 300);
    return ranking;
  }

  async getFailureRateByRegion() {
    const cacheKey = CACHE_KEYS.FAILURE_RATE;
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const failureRate = await TrackFitting.aggregate([
      { $match: { status: { $in: ['DEFECTIVE', 'RECALLED'] } } },
      {
        $group: {
          _id: '$location.zone',
          totalDefective: { $sum: 1 },
          avgRiskScore: { $avg: '$riskScore' },
        },
      },
      { $sort: { totalDefective: -1 } },
    ]);

    await CacheService.set(cacheKey, failureRate, 300);
    return failureRate;
  }

  async getWarrantyAlerts(days = 30) {
    const cacheKey = `${CACHE_KEYS.WARRANTY_ALERTS}:${days}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const alerts = await TrackFitting.aggregate([
      {
        $match: {
          warrantyExpiry: { $lte: futureDate, $gte: new Date() },
          status: { $nin: ['DECOMMISSIONED', 'RECALLED'] },
        },
      },
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendor',
          foreignField: '_id',
          as: 'vendorInfo',
        },
      },
      { $unwind: '$vendorInfo' },
      {
        $group: {
          _id: '$vendorCode',
          vendorName: { $first: '$vendorInfo.name' },
          count: { $sum: 1 },
          fittings: {
            $push: {
              uniqueQRId: '$uniqueQRId',
              warrantyExpiry: '$warrantyExpiry',
              itemType: '$itemType',
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    await CacheService.set(cacheKey, alerts, 300);
    return alerts;
  }

  async getBatchRecallDetection() {
    const recallCandidates = await TrackFitting.aggregate([
      { $match: { defectCount: { $gte: 1 } } },
      {
        $group: {
          _id: '$lotNumber',
          totalFittings: { $sum: 1 },
          defectiveFittings: { $sum: { $cond: [{ $eq: ['$status', 'DEFECTIVE'] }, 1, 0] } },
          avgRiskScore: { $avg: '$riskScore' },
          vendorCode: { $first: '$vendorCode' },
          itemType: { $first: '$itemType' },
        },
      },
      {
        $project: {
          lotNumber: '$_id',
          totalFittings: 1,
          defectiveFittings: 1,
          avgRiskScore: 1,
          vendorCode: 1,
          itemType: 1,
          defectRate: {
            $multiply: [{ $divide: ['$defectiveFittings', '$totalFittings'] }, 100],
          },
        },
      },
      { $match: { defectRate: { $gte: 10 } } },
      { $sort: { defectRate: -1 } },
      { $limit: 20 },
    ]);

    return recallCandidates;
  }

  async getInventoryDistribution() {
    const distribution = await TrackFitting.aggregate([
      {
        $group: {
          _id: {
            zone: '$location.zone',
            depot: '$location.depot',
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { zone: '$_id.zone', depot: '$_id.depot' },
          statusBreakdown: {
            $push: {
              status: '$_id.status',
              count: '$count',
            },
          },
          totalCount: { $sum: '$count' },
        },
      },
      { $sort: { totalCount: -1 } },
    ]);

    return distribution;
  }

  async getAIPredictionSummary() {
    const summary = await AIReport.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return summary;
  }
}

module.exports = new DashboardService();
