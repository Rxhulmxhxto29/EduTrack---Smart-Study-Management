const ApiError = require('../utils/ApiError');
const { isValidFileType } = require('../utils/helpers');

/**
 * Validate uploaded file
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {Number} maxSize - Max file size in bytes
 */
const validateFile = (allowedTypes = [], maxSize = null) => {
  return (req, res, next) => {
    // Check if file exists
    if (!req.files || Object.keys(req.files).length === 0) {
      throw ApiError.badRequest('No file uploaded');
    }

    const file = req.files.file || Object.values(req.files)[0];

    // Validate file type
    if (!isValidFileType(file.mimetype, allowedTypes)) {
      throw ApiError.badRequest(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      );
    }

    // Validate file size
    const maxFileSize = maxSize || parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw ApiError.badRequest(
        `File size exceeds limit. Maximum allowed: ${(maxFileSize / (1024 * 1024)).toFixed(2)}MB`
      );
    }

    // Attach file to request
    req.uploadedFile = file;
    next();
  };
};

/**
 * Optional file upload validation (doesn't throw error if no file)
 */
const optionalFileValidation = (allowedTypes = [], maxSize = null) => {
  return (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }

    const file = req.files.file || Object.values(req.files)[0];

    // Validate file type
    if (!isValidFileType(file.mimetype, allowedTypes)) {
      throw ApiError.badRequest(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      );
    }

    // Validate file size
    const maxFileSize = maxSize || parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw ApiError.badRequest(
        `File size exceeds limit. Maximum allowed: ${(maxFileSize / (1024 * 1024)).toFixed(2)}MB`
      );
    }

    req.uploadedFile = file;
    next();
  };
};

/**
 * Validate multiple files
 */
const validateMultipleFiles = (fieldName, allowedTypes = [], maxFiles = 5, maxSize = null) => {
  return (req, res, next) => {
    if (!req.files || !req.files[fieldName]) {
      throw ApiError.badRequest(`No files uploaded for field: ${fieldName}`);
    }

    const files = Array.isArray(req.files[fieldName]) 
      ? req.files[fieldName] 
      : [req.files[fieldName]];

    // Check file count
    if (files.length > maxFiles) {
      throw ApiError.badRequest(`Maximum ${maxFiles} files allowed`);
    }

    // Validate each file
    const maxFileSize = maxSize || parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
    
    for (const file of files) {
      if (!isValidFileType(file.mimetype, allowedTypes)) {
        throw ApiError.badRequest(
          `Invalid file type for ${file.name}. Allowed types: ${allowedTypes.join(', ')}`
        );
      }

      if (file.size > maxFileSize) {
        throw ApiError.badRequest(
          `File ${file.name} exceeds size limit. Maximum: ${(maxFileSize / (1024 * 1024)).toFixed(2)}MB`
        );
      }
    }

    req.uploadedFiles = files;
    next();
  };
};

module.exports = {
  validateFile,
  optionalFileValidation,
  validateMultipleFiles
};
