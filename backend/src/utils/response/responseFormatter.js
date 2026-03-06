/**
 * Format success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
export const sendSuccessResponse = (res, statusCode = 200, message, data = null, meta = {}) => {
  const response = {
    success: true,
    message: message || 'Operation successful'
  };

  if (data !== null) {
    response.data = data;
  }

  if (Object.keys(meta).length > 0) {
    Object.assign(response, meta);
  }

  return res.status(statusCode).json(response);
};

/**
 * Format error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} errors - Array of error details
 */
export const sendErrorResponse = (res, statusCode = 400, message, errors = null) => {
  const response = {
    success: false,
    message: message || 'An error occurred'
  };

  if (errors) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }

  return res.status(statusCode).json(response);
};

/**
 * Format validation error response
 * @param {Object} res - Express response object
 * @param {Array|Object} errors - Validation errors
 */
export const sendValidationError = (res, errors) => {
  const errorMessages = Array.isArray(errors)
    ? errors
    : Object.values(errors).map(err => err.message || err);

  return sendErrorResponse(res, 400, 'Validation error', errorMessages);
};

/**
 * Format not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 */
export const sendNotFoundResponse = (res, resource = 'Resource') => {
  return sendErrorResponse(res, 404, `${resource} not found`);
};

/**
 * Format unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
export const sendUnauthorizedResponse = (res, message = 'Unauthorized access') => {
  return sendErrorResponse(res, 401, message);
};

/**
 * Format forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
export const sendForbiddenResponse = (res, message = 'Access denied') => {
  return sendErrorResponse(res, 403, message);
};
