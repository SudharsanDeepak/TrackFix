const { HTTP_STATUS } = require('../shared/constants');

class ResponseFormatter {
  static success(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      error: null,
    });
  }

  static error(res, message = 'Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorDetails = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      error: errorDetails,
    });
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data,
      pagination,
      error: null,
    });
  }
}

module.exports = ResponseFormatter;
