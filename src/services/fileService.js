const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { generateFileHash, getFileExtension } = require('../utils/helpers');
const fs = require('fs').promises;

/**
 * Upload file to Cloudinary
 * @param {Object} file - Uploaded file object
 * @param {String} folder - Cloudinary folder
 * @returns {Object} Upload result
 */
exports.uploadFile = async (file, folder = 'edutrack') => {
  try {
    // Determine resource type based on file type
    const ext = getFileExtension(file.name);
    let resourceType = 'auto';
    
    if (ext === 'pdf' || ext === 'doc' || ext === 'docx') {
      resourceType = 'raw';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      resourceType = 'image';
    }

    // Generate file hash for duplicate detection
    const fileBuffer = await fs.readFile(file.tempFilePath);
    const contentHash = generateFileHash(fileBuffer);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.tempFilePath, folder, resourceType);

    // Clean up temp file
    try {
      await fs.unlink(file.tempFilePath);
    } catch (error) {
      console.error('Error deleting temp file:', error);
    }

    return {
      url: result.url,
      publicId: result.publicId,
      format: result.format || ext,
      size: file.size,
      contentHash,
      resourceType: result.resourceType
    };
  } catch (error) {
    // Clean up temp file on error
    try {
      if (file.tempFilePath) {
        await fs.unlink(file.tempFilePath);
      }
    } catch (unlinkError) {
      console.error('Error deleting temp file:', unlinkError);
    }
    
    throw error;
  }
};

/**
 * Upload multiple files
 * @param {Array} files - Array of file objects
 * @param {String} folder - Cloudinary folder
 * @returns {Array} Array of upload results
 */
exports.uploadMultipleFiles = async (files, folder = 'edutrack') => {
  const uploadPromises = files.map(file => this.uploadFile(file, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - Resource type
 * @returns {Boolean}
 */
exports.deleteFile = async (publicId, resourceType = 'image') => {
  try {
    return await deleteFromCloudinary(publicId, resourceType);
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Delete multiple files
 * @param {Array} files - Array of {publicId, resourceType} objects
 * @returns {Array}
 */
exports.deleteMultipleFiles = async (files) => {
  const deletePromises = files.map(file => 
    this.deleteFile(file.publicId, file.resourceType)
  );
  return Promise.all(deletePromises);
};

/**
 * Replace file (delete old and upload new)
 * @param {String} oldPublicId - Old file public ID
 * @param {Object} newFile - New file object
 * @param {String} folder - Cloudinary folder
 * @param {String} resourceType - Resource type for deletion
 * @returns {Object} New file upload result
 */
exports.replaceFile = async (oldPublicId, newFile, folder = 'edutrack', resourceType = 'image') => {
  try {
    // Upload new file first
    const uploadResult = await this.uploadFile(newFile, folder);
    
    // Delete old file (don't throw error if deletion fails)
    await this.deleteFile(oldPublicId, resourceType);
    
    return uploadResult;
  } catch (error) {
    throw error;
  }
};

/**
 * Check for duplicate file by hash
 * @param {String} contentHash - File content hash
 * @param {Object} Model - Mongoose model to search
 * @param {String} hashField - Field name containing hash
 * @returns {Object|null} Duplicate document or null
 */
exports.checkDuplicate = async (contentHash, Model, hashField = 'contentHash') => {
  try {
    const filter = {};
    filter[hashField] = contentHash;
    
    const duplicate = await Model.findOne(filter);
    return duplicate;
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return null;
  }
};

/**
 * Get file info without uploading
 * @param {Object} file - File object
 * @returns {Object} File info
 */
exports.getFileInfo = async (file) => {
  const fileBuffer = await fs.readFile(file.tempFilePath);
  const contentHash = generateFileHash(fileBuffer);
  const ext = getFileExtension(file.name);
  
  return {
    name: file.name,
    size: file.size,
    mimetype: file.mimetype,
    extension: ext,
    contentHash
  };
};

module.exports = exports;
