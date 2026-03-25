const logger = require('./logger');

const RAILWAY_ZONES = {
  NR: 'Northern Railway',
  SR: 'Southern Railway',
  ER: 'Eastern Railway',
  WR: 'Western Railway',
  CR: 'Central Railway',
  NER: 'North Eastern Railway',
  ECR: 'East Central Railway',
  ECoR: 'East Coast Railway',
  NCR: 'North Central Railway',
  NWR: 'North Western Railway',
  SCR: 'South Central Railway',
  SER: 'South Eastern Railway',
  SWR: 'South Western Railway',
  WCR: 'West Central Railway',
  NF: 'Northeast Frontier Railway',
  Metro: 'Metro Railways',
};

const validateZoneCode = (zoneCode) => {
  if (!zoneCode) {
    throw new Error('Zone code is required for sharded collections');
  }
  
  const upperZone = zoneCode.toUpperCase();
  if (!RAILWAY_ZONES[upperZone]) {
    throw new Error(`Invalid zone code: ${zoneCode}. Must be one of: ${Object.keys(RAILWAY_ZONES).join(', ')}`);
  }
  
  return upperZone;
};

const extractYearFromDate = (date) => {
  return new Date(date).getFullYear();
};

const buildShardQuery = (zoneCode, additionalFilters = {}) => {
  const validatedZone = validateZoneCode(zoneCode);
  
  return {
    zoneCode: validatedZone,
    ...additionalFilters,
  };
};

const logScatterQuery = (collectionName, query) => {
  if (!query.zoneCode) {
    logger.warn('Scatter-gather query detected', {
      collection: collectionName,
      query: JSON.stringify(query),
      warning: 'Query does not include shard key prefix (zoneCode)',
    });
  }
};

const isShardedCollection = (collectionName) => {
  const shardedCollections = [
    'trackfittings',
    'inspections',
    'aireports',
    'performancelogs',
    'inspectionarchives',
    'aireportarchives',
    'performancelogarchives',
  ];
  
  return shardedCollections.includes(collectionName.toLowerCase());
};

const getShardKeyForCollection = (collectionName) => {
  const shardKeys = {
    trackfittings: { zoneCode: 1, manufactureYear: 1, uniqueQRId: 1 },
    inspections: { zoneCode: 1, inspectionYear: 1, fitting: 1 },
    aireports: { zoneCode: 1, predictionYear: 1, fitting: 1 },
    performancelogs: { zoneCode: 1, logYear: 1, fitting: 1 },
    inspectionarchives: { zoneCode: 1, inspectionYear: 1, originalId: 1 },
    aireportarchives: { zoneCode: 1, predictionYear: 1, originalId: 1 },
    performancelogarchives: { zoneCode: 1, logYear: 1, originalId: 1 },
  };
  
  return shardKeys[collectionName.toLowerCase()] || null;
};

module.exports = {
  RAILWAY_ZONES,
  validateZoneCode,
  extractYearFromDate,
  buildShardQuery,
  logScatterQuery,
  isShardedCollection,
  getShardKeyForCollection,
};
