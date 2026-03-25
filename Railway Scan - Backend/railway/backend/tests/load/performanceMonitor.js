/**
 * Performance Monitor
 * 
 * Real-time performance monitoring during load tests
 */

const os = require('os');
const v8 = require('v8');

class PerformanceMonitor {
  constructor(config = {}) {
    this.config = {
      interval: config.interval || 1000,  // Monitoring interval in ms
      verbose: config.verbose !== false,
    };
    
    this.metrics = {
      memory: [],
      cpu: [],
      eventLoop: [],
      gc: [],
    };
    
    this.monitoring = false;
    this.intervalId = null;
    this.lastCpuUsage = process.cpuUsage();
    this.lastCheck = Date.now();
  }

  start() {
    if (this.monitoring) return;
    
    this.monitoring = true;
    this.lastCheck = Date.now();
    this.lastCpuUsage = process.cpuUsage();
    
    this.intervalId = setInterval(() => {
      this.captureMetrics();
    }, this.config.interval);
    
    if (this.config.verbose) {
      console.log('[Monitor] Performance monitoring started');
    }
  }

  stop() {
    if (!this.monitoring) return;
    
    this.monitoring = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.config.verbose) {
      console.log('[Monitor] Performance monitoring stopped');
    }
  }

  captureMetrics() {
    const now = Date.now();
    
    // Memory metrics
    const memUsage = process.memoryUsage();
    this.metrics.memory.push({
      timestamp: now,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
    });
    
    // CPU metrics
    const currentCpuUsage = process.cpuUsage(this.lastCpuUsage);
    const elapsedTime = now - this.lastCheck;
    
    // Calculate CPU percentage
    const userCpuPercent = (currentCpuUsage.user / 1000 / elapsedTime) * 100;
    const systemCpuPercent = (currentCpuUsage.system / 1000 / elapsedTime) * 100;
    
    this.metrics.cpu.push({
      timestamp: now,
      user: userCpuPercent,
      system: systemCpuPercent,
      total: userCpuPercent + systemCpuPercent,
    });
    
    this.lastCpuUsage = process.cpuUsage();
    this.lastCheck = now;
    
    // Event loop lag
    const start = Date.now();
    setImmediate(() => {
      const lag = Date.now() - start;
      this.metrics.eventLoop.push({
        timestamp: now,
        lag,
      });
    });
    
    // GC statistics (if available)
    try {
      const heapStats = v8.getHeapStatistics();
      this.metrics.gc.push({
        timestamp: now,
        totalHeapSize: heapStats.total_heap_size,
        usedHeapSize: heapStats.used_heap_size,
        heapSizeLimit: heapStats.heap_size_limit,
        mallocedMemory: heapStats.malloced_memory,
      });
    } catch (error) {
      // V8 stats not available
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getAverages() {
    const avgMemory = this.metrics.memory.reduce((sum, m) => sum + m.heapUsed, 0) / this.metrics.memory.length;
    const maxMemory = Math.max(...this.metrics.memory.map(m => m.heapUsed));
    const minMemory = Math.min(...this.metrics.memory.map(m => m.heapUsed));
    
    const avgCpu = this.metrics.cpu.reduce((sum, c) => sum + c.total, 0) / this.metrics.cpu.length;
    const maxCpu = Math.max(...this.metrics.cpu.map(c => c.total));
    
    const avgEventLoopLag = this.metrics.eventLoop.reduce((sum, e) => sum + e.lag, 0) / this.metrics.eventLoop.length;
    const maxEventLoopLag = Math.max(...this.metrics.eventLoop.map(e => e.lag));
    
    return {
      memory: {
        avg: avgMemory,
        max: maxMemory,
        min: minMemory,
        avgMB: (avgMemory / 1024 / 1024).toFixed(2),
        maxMB: (maxMemory / 1024 / 1024).toFixed(2),
      },
      cpu: {
        avg: avgCpu.toFixed(2),
        max: maxCpu.toFixed(2),
      },
      eventLoop: {
        avgLag: avgEventLoopLag.toFixed(2),
        maxLag: maxEventLoopLag.toFixed(2),
      },
    };
  }

  detectAnomalies() {
    const anomalies = [];
    const averages = this.getAverages();
    
    // Memory leak detection
    if (this.metrics.memory.length > 10) {
      const recent = this.metrics.memory.slice(-10);
      const trend = recent.map((m, i) => m.heapUsed - (recent[i - 1]?.heapUsed || m.heapUsed));
      const avgTrend = trend.reduce((a, b) => a + b, 0) / trend.length;
      
      if (avgTrend > 1024 * 1024) { // Growing by 1MB per interval
        anomalies.push({
          type: 'MEMORY_LEAK',
          severity: 'HIGH',
          message: `Memory growing at ${(avgTrend / 1024 / 1024).toFixed(2)}MB per interval`,
        });
      }
    }
    
    // High CPU usage
    if (parseFloat(averages.cpu.max) > 90) {
      anomalies.push({
        type: 'HIGH_CPU',
        severity: 'MEDIUM',
        message: `CPU usage peaked at ${averages.cpu.max}%`,
      });
    }
    
    // Event loop lag
    if (parseFloat(averages.eventLoop.maxLag) > 100) {
      anomalies.push({
        type: 'EVENT_LOOP_LAG',
        severity: 'HIGH',
        message: `Event loop lag peaked at ${averages.eventLoop.maxLag}ms`,
      });
    }
    
    // High memory usage
    if (parseFloat(averages.memory.maxMB) > 1024) {
      anomalies.push({
        type: 'HIGH_MEMORY',
        severity: 'MEDIUM',
        message: `Memory usage peaked at ${averages.memory.maxMB}MB`,
      });
    }
    
    return anomalies;
  }

  generateReport() {
    const averages = this.getAverages();
    const anomalies = this.detectAnomalies();
    
    return {
      duration: this.metrics.memory.length * this.config.interval,
      samples: this.metrics.memory.length,
      averages,
      anomalies,
      healthy: anomalies.length === 0,
    };
  }
}

module.exports = PerformanceMonitor;
