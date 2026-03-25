const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const validateConfig = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

validateConfig();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',
  
  database: {
    uri: process.env.MONGO_URI,
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    },
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  redis: {
    url: process.env.REDIS_URL,
    cacheTTL: parseInt(process.env.REDIS_CACHE_TTL, 10) || 300,
  },
  
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL,
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT, 10) || 3000,
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },
  
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100,
  },
  
  performance: {
    slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD, 10) || 200,
    queryTimeout: parseInt(process.env.QUERY_TIMEOUT, 10) || 5000,
  },
  
  qr: {
    batchMaxSize: parseInt(process.env.QR_BATCH_MAX_SIZE, 10) || 10000,
  },
  
  integration: {
    udmApiUrl: process.env.UDM_API_URL,
    tmsApiUrl: process.env.TMS_API_URL,
    apiToken: process.env.INTEGRATION_API_TOKEN,
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'default-session-secret',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

module.exports = config;
