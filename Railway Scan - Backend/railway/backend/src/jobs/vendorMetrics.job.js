const Vendor = require('../modules/vendor/model');
const TrackFitting = require('../modules/qr/model');
const logger = require('../utils/logger');

const vendorMetricsJob = async () => {
  const vendors = await Vendor.find({ isActive: true }).select('_id').lean();

  let updated = 0;

  for (const vendor of vendors) {
    const metrics = await TrackFitting.aggregate([
      { $match: { vendor: vendor._id } },
      {
        $group: {
          _id: null,
          totalSupplied: { $sum: 1 },
          defectiveCount: {
            $sum: { $cond: [{ $eq: ['$status', 'DEFECTIVE'] }, 1, 0] },
          },
          recalledCount: {
            $sum: { $cond: ['$isRecalled', 1, 0] },
          },
          avgRiskScore: { $avg: '$riskScore' },
        },
      },
    ]);

    if (metrics.length > 0) {
      const data = metrics[0];
      const defectRate = data.totalSupplied > 0 
        ? (data.defectiveCount / data.totalSupplied) * 100 
        : 0;
      
      const performanceScore = Math.max(0, 100 - defectRate * 2);

      await Vendor.findByIdAndUpdate(vendor._id, {
        totalFittingsSupplied: data.totalSupplied,
        defectiveCount: data.defectiveCount,
        recallCount: data.recalledCount,
        performanceScore: Math.round(performanceScore),
        riskScore: Math.round(data.avgRiskScore || 0),
      });

      updated++;
    }
  }

  logger.info('Vendor metrics recalculation completed', { updated });
  return { updated };
};

module.exports = vendorMetricsJob;
