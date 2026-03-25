const vendorService = require('./service');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');
const { buildPaginationResponse } = require('../../middlewares/pagination');

class VendorController {
  create = asyncHandler(async (req, res) => {
    const vendor = await vendorService.create(req.body, req.user.id);
    ResponseFormatter.created(res, vendor, 'Vendor created successfully');
  });

  getById = asyncHandler(async (req, res) => {
    const vendor = await vendorService.getById(req.params.id);
    ResponseFormatter.success(res, vendor, 'Vendor retrieved successfully');
  });

  list = asyncHandler(async (req, res) => {
    const { vendors, total } = await vendorService.list(req.query, req.pagination);
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, vendors, pagination, 'Vendors retrieved successfully');
  });

  update = asyncHandler(async (req, res) => {
    const vendor = await vendorService.update(req.params.id, req.body, req.user.id);
    ResponseFormatter.success(res, vendor, 'Vendor updated successfully');
  });

  blacklist = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const vendor = await vendorService.blacklist(req.params.id, reason, req.user.id);
    ResponseFormatter.success(res, vendor, 'Vendor blacklisted successfully');
  });

  getTopPerformers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const vendors = await vendorService.getTopPerformers(limit);
    ResponseFormatter.success(res, vendors, 'Top performers retrieved successfully');
  });

  getHighRiskVendors = asyncHandler(async (req, res) => {
    const vendors = await vendorService.getHighRiskVendors();
    ResponseFormatter.success(res, vendors, 'High risk vendors retrieved successfully');
  });
}

module.exports = new VendorController();
