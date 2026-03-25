const inspectionService = require('./service');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');
const { buildPaginationResponse } = require('../../middlewares/pagination');

class InspectionController {
  create = asyncHandler(async (req, res) => {
    const inspection = await inspectionService.create(req.body, req.user.id);
    ResponseFormatter.created(res, inspection, 'Inspection created successfully');
  });

  getById = asyncHandler(async (req, res) => {
    const inspection = await inspectionService.getById(req.params.id);
    ResponseFormatter.success(res, inspection, 'Inspection retrieved successfully');
  });

  getByFitting = asyncHandler(async (req, res) => {
    const { inspections, total } = await inspectionService.getByFitting(
      req.params.fittingId,
      req.pagination
    );
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, inspections, pagination, 'Inspections retrieved successfully');
  });

  getByInspector = asyncHandler(async (req, res) => {
    const { inspections, total } = await inspectionService.getByInspector(
      req.user.id,
      req.pagination
    );
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, inspections, pagination, 'Inspections retrieved successfully');
  });

  update = asyncHandler(async (req, res) => {
    const inspection = await inspectionService.update(req.params.id, req.body, req.user.id);
    ResponseFormatter.success(res, inspection, 'Inspection updated successfully');
  });

  getFailedInspections = asyncHandler(async (req, res) => {
    const { inspections, total } = await inspectionService.getFailedInspections(req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, inspections, pagination, 'Failed inspections retrieved successfully');
  });
}

module.exports = new InspectionController();
