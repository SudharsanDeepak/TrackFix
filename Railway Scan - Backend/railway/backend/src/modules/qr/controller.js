const qrService = require('./service');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');
const { buildPaginationResponse } = require('../../middlewares/pagination');

class QRController {
  generateBatch = asyncHandler(async (req, res) => {
    const result = await qrService.generateBatch(req.body, req.user.id);
    ResponseFormatter.created(res, result, 'QR batch generated successfully');
  });

  getByQRId = asyncHandler(async (req, res) => {
    const fitting = await qrService.getByQRId(req.params.qrId);
    ResponseFormatter.success(res, fitting, 'Fitting retrieved successfully');
  });

  updateFitting = asyncHandler(async (req, res) => {
    const fitting = await qrService.updateFitting(req.params.id, req.body, req.user.id);
    ResponseFormatter.success(res, fitting, 'Fitting updated successfully');
  });

  listFittings = asyncHandler(async (req, res) => {
    const { fittings, total } = await qrService.listFittings(req.query, req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, fittings, pagination, 'Fittings retrieved successfully');
  });

  recallLot = asyncHandler(async (req, res) => {
    const { lotNumber, reason } = req.body;
    const result = await qrService.recallLot(lotNumber, reason, req.user.id);
    ResponseFormatter.success(res, result, 'Lot recalled successfully');
  });

  getExpiringWarranties = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days, 10) || 30;
    const fittings = await qrService.getExpiringWarranties(days);
    ResponseFormatter.success(res, fittings, 'Expiring warranties retrieved successfully');
  });
}

module.exports = new QRController();
