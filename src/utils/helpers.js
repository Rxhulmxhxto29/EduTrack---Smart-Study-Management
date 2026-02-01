const crypto = require('crypto');

/**
 * Generate a hash for file content to detect duplicates
 * @param {Buffer} buffer - File buffer
 * @returns {String} Hash string
 */
const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Format file size to human readable format
 * @param {Number} bytes - File size in bytes
 * @returns {String} Formatted size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate file type
 * @param {String} mimetype - File mimetype
 * @param {Array} allowedTypes - Allowed mimetypes
 * @returns {Boolean}
 */
const isValidFileType = (mimetype, allowedTypes = []) => {
  if (allowedTypes.length === 0) {
    // Default allowed types for educational content
    allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  }
  
  return allowedTypes.includes(mimetype);
};

/**
 * Extract file extension from filename
 * @param {String} filename
 * @returns {String}
 */
const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

/**
 * Paginate results
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} Skip and limit values
 */
const paginate = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  
  const skip = (parsedPage - 1) * parsedLimit;
  
  return {
    skip,
    limit: parsedLimit,
    page: parsedPage
  };
};

/**
 * Build pagination metadata
 * @param {Number} total - Total items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Sanitize search query
 * @param {String} query - Search query
 * @returns {String} Sanitized query
 */
const sanitizeSearchQuery = (query) => {
  if (!query) return '';
  
  // Remove special regex characters
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
};

/**
 * Build filter object from query parameters
 * @param {Object} query - Request query object
 * @param {Array} allowedFilters - Allowed filter fields
 * @returns {Object} Filter object
 */
const buildFilterObject = (query, allowedFilters = []) => {
  const filter = {};
  
  allowedFilters.forEach(field => {
    if (query[field] !== undefined && query[field] !== '') {
      filter[field] = query[field];
    }
  });
  
  return filter;
};

/**
 * Calculate days until deadline
 * @param {Date} deadline
 * @returns {Number} Days remaining (negative if overdue)
 */
const getDaysUntilDeadline = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if date is in past
 * @param {Date} date
 * @returns {Boolean}
 */
const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Async handler wrapper to catch errors
 * @param {Function} fn - Async function
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Generate slug from text
 * @param {String} text
 * @returns {String} Slug
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * Remove undefined/null properties from object
 * @param {Object} obj
 * @returns {Object} Cleaned object
 */
const removeEmptyFields = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null && value !== '')
  );
};

module.exports = {
  generateFileHash,
  formatFileSize,
  isValidFileType,
  getFileExtension,
  paginate,
  buildPaginationMeta,
  sanitizeSearchQuery,
  buildFilterObject,
  getDaysUntilDeadline,
  isPastDate,
  asyncHandler,
  generateSlug,
  removeEmptyFields
};
