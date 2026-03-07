/**
 * Build MongoDB query from request parameters
 * @param {Object} queryParams - Query parameters from request
 * @param {Object} options - Options for query building
 * @returns {Object} - MongoDB query object
 */
export const buildQuery = (queryParams, options = {}) => {
  const {
    searchFields = [],
    dateFields = [],
    numberFields = [],
    booleanFields = [],
    enumFields = {},
    exactFields = []
  } = options;

  const query = {};

  // Handle search across multiple fields
  if (queryParams.search && searchFields.length > 0) {
    query.$or = searchFields.map(field => ({
      [field]: { $regex: queryParams.search, $options: 'i' }
    }));
  }

  // Handle date range queries
  dateFields.forEach(field => {
    if (queryParams[`${field}From`]) {
      query[field] = { ...query[field], $gte: new Date(queryParams[`${field}From`]) };
    }
    if (queryParams[`${field}To`]) {
      query[field] = { ...query[field], $lte: new Date(queryParams[`${field}To`]) };
    }
  });

  // Handle number range queries
  numberFields.forEach(field => {
    if (queryParams[`${field}Min`]) {
      query[field] = { ...query[field], $gte: Number(queryParams[`${field}Min`]) };
    }
    if (queryParams[`${field}Max`]) {
      query[field] = { ...query[field], $lte: Number(queryParams[`${field}Max`]) };
    }
  });

  // Handle boolean fields
  booleanFields.forEach(field => {
    if (queryParams[field] !== undefined) {
      query[field] = queryParams[field] === 'true';
    }
  });

  // Handle enum fields
  Object.keys(enumFields).forEach(field => {
    if (queryParams[field]) {
      const allowedValues = enumFields[field];
      if (allowedValues.includes(queryParams[field])) {
        query[field] = queryParams[field];
      }
    }
  });

  // Handle exact match fields
  exactFields.forEach(field => {
    if (queryParams[field] !== undefined) {
      query[field] = queryParams[field];
    }
  });

  return query;
};

/**
 * Build sort object from sort string
 * @param {string} sortString - Sort string (e.g., "-createdAt" or "name")
 * @returns {Object} - MongoDB sort object
 */
export const buildSort = (sortString = '-createdAt') => {
  if (!sortString) return { createdAt: -1 };

  const sort = {};
  const parts = sortString.split(',');

  parts.forEach(part => {
    const trimmed = part.trim();
    if (trimmed.startsWith('-')) {
      sort[trimmed.substring(1)] = -1;
    } else {
      sort[trimmed] = 1;
    }
  });

  return sort;
};

/**
 * Build select fields object
 * @param {string} fields - Comma-separated field names
 * @returns {string} - Space-separated field names for select
 */
export const buildSelect = (fields) => {
  if (!fields) return '';
  return fields.split(',').map(f => f.trim()).join(' ');
};

/**
 * Build populate options
 * @param {string|Array} populateString - Populate string or array
 * @returns {Array|string} - Populate options
 */
export const buildPopulate = (populateString) => {
  if (!populateString) return [];
  
  if (typeof populateString === 'string') {
    return populateString.split(',').map(p => {
      const parts = p.trim().split(' ');
      if (parts.length > 1) {
        return {
          path: parts[0],
          select: parts.slice(1).join(' ')
        };
      }
      return parts[0];
    });
  }
  
  return populateString;
};
