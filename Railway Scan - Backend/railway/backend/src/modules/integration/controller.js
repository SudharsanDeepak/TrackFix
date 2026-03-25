const integrationService = require('./service');
const qrRepository = require('../qr/repository');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');
const { NotFoundError } = require('../../utils/errors');

class IntegrationController {
  exportToUDM = asyncHandler(async (req, res) => {
    const { fittingIds } = req.body;
    
    const fittings = await Promise.all(
      fittingIds.map((id) => qrRepository.findById(id))
    );
    
    const validFittings = fittings.filter((f) => f !== null);
    
    if (validFittings.length === 0) {
      throw new NotFoundError('No valid fittings found');
    }
    
    const result = await integrationService.exportToUDM(validFittings);
    ResponseFormatter.success(res, result, 'Data exported to UDM successfully');
  });

  exportToTMS = asyncHandler(async (req, res) => {
    const { fittingIds } = req.body;
    
    const fittings = await Promise.all(
      fittingIds.map((id) => qrRepository.findById(id))
    );
    
    const validFittings = fittings.filter((f) => f !== null);
    
    if (validFittings.length === 0) {
      throw new NotFoundError('No valid fittings found');
    }
    
    const result = await integrationService.exportToTMS(validFittings);
    ResponseFormatter.success(res, result, 'Data exported to TMS successfully');
  });

  syncData = asyncHandler(async (req, res) => {
    const { fittingIds } = req.body;
    
    const fittings = await Promise.all(
      fittingIds.map((id) => qrRepository.findById(id))
    );
    
    const validFittings = fittings.filter((f) => f !== null);
    
    if (validFittings.length === 0) {
      throw new NotFoundError('No valid fittings found');
    }
    
    const result = await integrationService.syncFittingData(validFittings);
    ResponseFormatter.success(res, result, 'Data synchronized successfully');
  });
}

module.exports = new IntegrationController();
