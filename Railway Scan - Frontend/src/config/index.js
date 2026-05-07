/**
 * Application Configuration
 * Loads and validates environment variables
 */

const requiredEnvVars = ['VITE_API_BASE_URL', 'VITE_GOOGLE_CLIENT_ID']

// Validate required environment variables
const validateConfig = () => {
  const missing = requiredEnvVars.filter(varName => !import.meta.env[varName])

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Validate on load
validateConfig()

export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',

  // Google OAuth
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,

  // Application Environment
  env: import.meta.env.VITE_APP_ENV || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // App Info
  appName: import.meta.env.VITE_APP_NAME || 'RailTrack-FIX',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Feature Flags
  enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',

  // API Settings
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000, // 10 seconds
  retryAttempts: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS) || 3,
  retryDelay: parseInt(import.meta.env.VITE_RETRY_DELAY) || 1000, // 1 second

  // Cache Settings
  cacheTTL: parseInt(import.meta.env.VITE_CACHE_TTL) || 300000, // 5 minutes

  // Pagination
  defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20,
  maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,

  // File Upload
  maxImageSize: parseInt(import.meta.env.VITE_MAX_IMAGE_SIZE) || 5 * 1024 * 1024, // 5MB
  maxImagesPerInspection: parseInt(import.meta.env.VITE_MAX_IMAGES_PER_INSPECTION) || 10,
  allowedImageFormats: ['image/jpeg', 'image/png', 'image/webp'],

  // Session
  sessionTimeoutWarning: parseInt(import.meta.env.VITE_SESSION_TIMEOUT_WARNING) || 5 * 60 * 1000, // 5 minutes
  tokenRefreshInterval: parseInt(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 14 * 60 * 1000, // 14 minutes

  // Auto-save
  autoSaveInterval: parseInt(import.meta.env.VITE_AUTO_SAVE_INTERVAL) || 30000, // 30 seconds
  autoSaveExpiry: parseInt(import.meta.env.VITE_AUTO_SAVE_EXPIRY) || 24 * 60 * 60 * 1000, // 24 hours

  // Development
  enableReactDevTools: import.meta.env.VITE_ENABLE_REACT_DEVTOOLS === 'true',
  enableHMR: import.meta.env.VITE_ENABLE_HMR === 'true',

  // Production
  enableSourceMaps: import.meta.env.VITE_ENABLE_SOURCE_MAPS === 'true',
  enableBundleAnalysis: import.meta.env.VITE_ENABLE_BUNDLE_ANALYSIS === 'true',

  // Security
  enableHTTPS: import.meta.env.VITE_ENABLE_HTTPS === 'true',
  corsOrigins: import.meta.env.VITE_CORS_ORIGINS?.split(',') || ['http://localhost:5173'],

  // External Services (Optional)
  sentryDSN: import.meta.env.VITE_SENTRY_DSN,
  googleAnalyticsId: import.meta.env.VITE_GA_ID,
  logRocketId: import.meta.env.VITE_LOGROCKET_ID,
  mapApiKey: import.meta.env.VITE_MAP_API_KEY,
}

// Log configuration in development
if (config.isDevelopment && config.enableDebug) {
  console.log('🔧 App Configuration:', {
    env: config.env,
    apiBaseUrl: config.apiBaseUrl,
    appName: config.appName,
    appVersion: config.appVersion,
    features: {
      offlineMode: config.enableOfflineMode,
      analytics: config.enableAnalytics,
      debug: config.enableDebug,
    },
  })
}

export default config
