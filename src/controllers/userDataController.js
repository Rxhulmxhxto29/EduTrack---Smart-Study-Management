const UserData = require('../models/UserData');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/helpers');

// Valid keys for user data
const VALID_KEYS = [
  'progress_data',
  'timetable_data',
  'custom_subjects',
  'study_streak',
  'exam_mode_data',
  'favorites',
  'preferences',
  'dashboard_data'
];

/**
 * @desc    Get all user data
 * @route   GET /api/user-data
 * @access  Private
 */
exports.getAllUserData = asyncHandler(async (req, res) => {
  const data = await UserData.getAllUserData(req.user._id);
  
  const response = ApiResponse.success(
    { data },
    'User data retrieved successfully'
  );
  
  response.send(res);
});

/**
 * @desc    Get specific user data by key
 * @route   GET /api/user-data/:key
 * @access  Private
 */
exports.getUserData = asyncHandler(async (req, res) => {
  const { key } = req.params;
  
  if (!VALID_KEYS.includes(key)) {
    throw ApiError.badRequest(`Invalid key. Valid keys are: ${VALID_KEYS.join(', ')}`);
  }
  
  const data = await UserData.getData(req.user._id, key, null);
  
  const response = ApiResponse.success(
    { key, data },
    data ? 'Data retrieved successfully' : 'No data found for this key'
  );
  
  response.send(res);
});

/**
 * @desc    Save user data
 * @route   POST /api/user-data/:key
 * @access  Private
 */
exports.saveUserData = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { data } = req.body;
  
  if (!VALID_KEYS.includes(key)) {
    throw ApiError.badRequest(`Invalid key. Valid keys are: ${VALID_KEYS.join(', ')}`);
  }
  
  if (data === undefined) {
    throw ApiError.badRequest('Data field is required');
  }
  
  const record = await UserData.setData(req.user._id, key, data);
  
  const response = ApiResponse.success(
    { key, data: record.data, lastUpdated: record.lastUpdated },
    'Data saved successfully'
  );
  
  response.send(res);
});

/**
 * @desc    Update user data (merge with existing)
 * @route   PUT /api/user-data/:key
 * @access  Private
 */
exports.updateUserData = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { data } = req.body;
  
  if (!VALID_KEYS.includes(key)) {
    throw ApiError.badRequest(`Invalid key. Valid keys are: ${VALID_KEYS.join(', ')}`);
  }
  
  if (data === undefined) {
    throw ApiError.badRequest('Data field is required');
  }
  
  // Get existing data
  const existing = await UserData.getData(req.user._id, key, {});
  
  // Merge data (shallow merge for objects, replace for arrays/primitives)
  let mergedData;
  if (typeof existing === 'object' && !Array.isArray(existing) && 
      typeof data === 'object' && !Array.isArray(data)) {
    mergedData = { ...existing, ...data };
  } else {
    mergedData = data;
  }
  
  const record = await UserData.setData(req.user._id, key, mergedData);
  
  const response = ApiResponse.success(
    { key, data: record.data, lastUpdated: record.lastUpdated },
    'Data updated successfully'
  );
  
  response.send(res);
});

/**
 * @desc    Delete user data
 * @route   DELETE /api/user-data/:key
 * @access  Private
 */
exports.deleteUserData = asyncHandler(async (req, res) => {
  const { key } = req.params;
  
  if (!VALID_KEYS.includes(key)) {
    throw ApiError.badRequest(`Invalid key. Valid keys are: ${VALID_KEYS.join(', ')}`);
  }
  
  await UserData.findOneAndDelete({ user: req.user._id, key });
  
  const response = ApiResponse.success(
    { key },
    'Data deleted successfully'
  );
  
  response.send(res);
});

/**
 * @desc    Bulk save user data
 * @route   POST /api/user-data/bulk
 * @access  Private
 */
exports.bulkSaveUserData = asyncHandler(async (req, res) => {
  const { items } = req.body;
  
  if (!Array.isArray(items)) {
    throw ApiError.badRequest('Items must be an array');
  }
  
  const results = [];
  const errors = [];
  
  for (const item of items) {
    const { key, data } = item;
    
    if (!VALID_KEYS.includes(key)) {
      errors.push({ key, error: 'Invalid key' });
      continue;
    }
    
    try {
      const record = await UserData.setData(req.user._id, key, data);
      results.push({ key, success: true, lastUpdated: record.lastUpdated });
    } catch (err) {
      errors.push({ key, error: err.message });
    }
  }
  
  const response = ApiResponse.success(
    { saved: results, errors },
    `Saved ${results.length} items${errors.length > 0 ? `, ${errors.length} errors` : ''}`
  );
  
  response.send(res);
});
