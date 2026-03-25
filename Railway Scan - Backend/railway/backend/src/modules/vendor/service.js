const vendorRepository = require('./repository');
const { NotFoundError, DuplicateError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const AuditService = require('../audit/service');

class VendorService {
  async create(vendorData, userId) {
    const existing = await vendorRepository.findByCode(vendorData.vendorCode);
    if (existing) {
      throw new DuplicateError('Vendor code already exists');
    }

    const vendor = await vendorRepository.create(vendorData);

    await AuditService.log({
      action: 'VENDOR_CREATED',
      userId,
      resourceId: vendor._id,
      details: { vendorCode: vendor.vendorCode, name: vendor.name },
    });

    logger.info('Vendor created:', { vendorId: vendor._id, vendorCode: vendor.vendorCode });
    return vendor;
  }

  async getById(id) {
    const vendor = await vendorRepository.findById(id);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    return vendor;
  }

  async list(filters, pagination) {
    const query = {};
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.isBlacklisted !== undefined) query.isBlacklisted = filters.isBlacklisted;

    const vendors = await vendorRepository.findAll(query, {
      skip: pagination.skip,
      limit: pagination.limit,
    });

    const total = await vendorRepository.count(query);
    return { vendors, total };
  }

  async update(id, updateData, userId) {
    const vendor = await this.getById(id);
    const updated = await vendorRepository.update(id, updateData);

    await AuditService.log({
      action: 'VENDOR_UPDATED',
      userId,
      resourceId: id,
      details: { updates: Object.keys(updateData) },
    });

    return updated;
  }

  async blacklist(id, reason, userId) {
    const vendor = await this.getById(id);
    const updated = await vendorRepository.blacklist(id, reason);

    await AuditService.log({
      action: 'VENDOR_BLACKLISTED',
      userId,
      resourceId: id,
      details: { vendorCode: vendor.vendorCode, reason },
    });

    logger.warn('Vendor blacklisted:', { vendorId: id, reason });
    return updated;
  }

  async getTopPerformers(limit = 10) {
    return await vendorRepository.getTopPerformers(limit);
  }

  async getHighRiskVendors() {
    return await vendorRepository.getHighRiskVendors();
  }
}

module.exports = new VendorService();
