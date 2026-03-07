import mongoose from 'mongoose';

/**
 * Check if ID is valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Convert string to ObjectId
 * @param {string} id - ID string
 * @returns {mongoose.Types.ObjectId|null} - ObjectId or null
 */
export const toObjectId = (id) => {
  if (!isValidObjectId(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

/**
 * Convert array of strings to ObjectIds
 * @param {Array<string>} ids - Array of ID strings
 * @returns {Array<mongoose.Types.ObjectId>} - Array of ObjectIds
 */
export const toObjectIds = (ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.filter(id => isValidObjectId(id)).map(id => toObjectId(id));
};

/**
 * Build aggregation pipeline for pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Array} - Aggregation pipeline stages
 */
export const buildPaginationPipeline = (page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  return [
    { $skip: skip },
    { $limit: limitNum }
  ];
};

/**
 * Build aggregation pipeline for counting
 * @returns {Array} - Aggregation pipeline stages for counting
 */
export const buildCountPipeline = () => {
  return [
    { $count: 'total' }
  ];
};

/**
 * Execute paginated aggregation
 * @param {mongoose.Model} Model - Mongoose model
 * @param {Array} pipeline - Aggregation pipeline
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} - Paginated results
 */
export const paginatedAggregate = async (Model, pipeline, page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  const [results, countResult] = await Promise.all([
    Model.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limitNum }
    ]),
    Model.aggregate([
      ...pipeline,
      { $count: 'total' }
    ])
  ]);

  const total = countResult[0]?.total || 0;

  return {
    data: results,
    pagination: {
      page: parseInt(page),
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  };
};
