const cron = require('node-cron');
const logger = require('../utils/logger');
const warrantyExpiryJob = require('./warrantyExpiry.job');
const vendorMetricsJob = require('./vendorMetrics.job');
const auditCleanupJob = require('./auditCleanup.job');
const cacheCleanupJob = require('./cacheCleanup.job');
const archiveInspectionsJob = require('./archiveInspections.job');
const archiveOldDataJob = require('./archiveOldData.job');

class JobScheduler {
  constructor() {
    this.jobs = [];
  }

  start() {
    // Silently start background job scheduler

    this.jobs.push(
      cron.schedule('0 2 * * *', async () => {
        await this.runJob('Warranty Expiry Scan', warrantyExpiryJob);
      })
    );

    this.jobs.push(
      cron.schedule('0 3 * * *', async () => {
        await this.runJob('Vendor Metrics Recalculation', vendorMetricsJob);
      })
    );

    this.jobs.push(
      cron.schedule('0 4 * * *', async () => {
        await this.runJob('Audit Log Cleanup', auditCleanupJob);
      })
    );

    this.jobs.push(
      cron.schedule('0 */6 * * *', async () => {
        await this.runJob('Cache Cleanup', cacheCleanupJob);
      })
    );

    this.jobs.push(
      cron.schedule('0 1 * * 0', async () => {
        await this.runJob('Archive Old Inspections', archiveInspectionsJob);
      })
    );

    this.jobs.push(
      cron.schedule('0 5 * * *', async () => {
        await this.runJob('Archive Old Data (Hot to Cold)', archiveOldDataJob);
      })
    );

    console.log(`✓ Background jobs scheduled (${this.jobs.length})`);
  }

  async runJob(jobName, jobFunction) {
    const startTime = Date.now();
    logger.info(`Starting job: ${jobName}`);

    try {
      const result = await jobFunction();
      const duration = Date.now() - startTime;
      
      logger.info(`Job completed: ${jobName}`, {
        duration: `${duration}ms`,
        result,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Job failed: ${jobName}`, {
        duration: `${duration}ms`,
        error: error.message,
        stack: error.stack,
      });
    }
  }

  stop() {
    logger.info('Stopping background job scheduler');
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
  }
}

module.exports = new JobScheduler();
