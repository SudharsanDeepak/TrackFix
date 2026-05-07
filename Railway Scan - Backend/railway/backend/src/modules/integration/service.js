const axios = require('axios');
const config = require('../../config');
const logger = require('../../utils/logger');
const { ExternalServiceError } = require('../../utils/errors');

class IntegrationService {
  constructor() {
    this.udmClient = axios.create({
      baseURL: config.integration.udmApiUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.integration.apiToken}`,
      },
    });

    this.tmsClient = axios.create({
      baseURL: config.integration.tmsApiUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.integration.apiToken}`,
      },
    });
  }

  async exportToUDM(data) {
    try {
      const payload = this.formatUDMPayload(data);
      const response = await this.udmClient.post('/import', payload);
      
      logger.info('Data exported to UDM:', { recordCount: data.length });
      return response.data;
    } catch (error) {
      logger.error('UDM export failed:', error);
      throw new ExternalServiceError('Failed to export data to UDM');
    }
  }

  async exportToTMS(data) {
    try {
      const payload = this.formatTMSPayload(data);
      const response = await this.tmsClient.post('/import', payload);
      
      logger.info('Data exported to TMS:', { recordCount: data.length });
      return response.data;
    } catch (error) {
      logger.error('TMS export failed:', error);
      throw new ExternalServiceError('Failed to export data to TMS');
    }
  }

  formatUDMPayload(data) {
    return {
      source: 'RailTrack-FIX',
      timestamp: new Date().toISOString(),
      records: data.map((item) => ({
        qrId: item.uniqueQRId,
        itemType: item.itemType,
        vendorCode: item.vendorCode,
        status: item.status,
        location: item.location,
        riskScore: item.riskScore,
      })),
    };
  }

  formatTMSPayload(data) {
    return {
      source: 'RailTrack-FIX',
      timestamp: new Date().toISOString(),
      trackFittings: data.map((item) => ({
        identifier: item.uniqueQRId,
        type: item.itemType,
        supplier: item.vendorCode,
        installationDate: item.installationDate,
        location: {
          zone: item.location?.zone,
          depot: item.location?.depot,
          coordinates: item.location?.coordinates,
        },
        healthStatus: item.status,
        riskLevel: item.riskScore,
      })),
    };
  }

  async syncFittingData(fittings) {
    const results = {
      udm: null,
      tms: null,
      errors: [],
    };

    try {
      results.udm = await this.exportToUDM(fittings);
    } catch (error) {
      results.errors.push({ service: 'UDM', error: error.message });
    }

    try {
      results.tms = await this.exportToTMS(fittings);
    } catch (error) {
      results.errors.push({ service: 'TMS', error: error.message });
    }

    return results;
  }
}

module.exports = new IntegrationService();
