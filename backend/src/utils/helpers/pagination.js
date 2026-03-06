/**
 * Calculate pagination parameters
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} - Object with skip, limit, and pagination metadata
 */
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  return {
    skip,
    limit: limitNum,
    page: pageNum
  };
};

/**
 * Generate pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
export const getPaginationMeta = (total, page = 1, limit = 10) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  return {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
    hasNext: pageNum * limitNum < total,
    hasPrev: pageNum > 1
  };
};

/**
 * Format paginated response
 * @param {Array} data - Array of data items
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} - Formatted paginated response
 */
export const formatPaginatedResponse = (data, total, page = 1, limit = 10) => {
  return {
    data,
    pagination: getPaginationMeta(total, page, limit)
  };
};
