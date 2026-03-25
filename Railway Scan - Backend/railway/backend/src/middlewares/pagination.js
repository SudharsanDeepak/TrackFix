const config = require('../config');

const paginate = (req, _res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(
    parseInt(req.query.limit, 10) || config.pagination.defaultPageSize,
    config.pagination.maxPageSize
  );
  const skip = (page - 1) * limit;
  
  req.pagination = {
    page,
    limit,
    skip,
  };
  
  next();
};

const buildPaginationResponse = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { paginate, buildPaginationResponse };
