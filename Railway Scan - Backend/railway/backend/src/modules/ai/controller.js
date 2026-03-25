const aiService = require('./service');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');
const { buildPaginationResponse } = require('../../middlewares/pagination');

class AIController {
  predict = asyncHandler(async (req, res) => {
    const { fittingId } = req.body;
    const report = await aiService.predict(fittingId);
    ResponseFormatter.success(res, report, 'AI prediction completed successfully');
  });

  getReportsByFitting = asyncHandler(async (req, res) => {
    const { reports, total } = await aiService.getReportsByFitting(req.params.fittingId, req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, reports, pagination, 'AI reports retrieved successfully');
  });

  getHighRiskPredictions = asyncHandler(async (req, res) => {
    const threshold = parseInt(req.query.threshold, 10) || 70;
    const reports = await aiService.getHighRiskPredictions(threshold);
    ResponseFormatter.success(res, reports, 'High risk predictions retrieved successfully');
  });
}

module.exports = new AIController();
