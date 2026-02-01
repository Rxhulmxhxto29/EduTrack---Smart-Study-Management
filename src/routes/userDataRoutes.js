const express = require('express');
const router = express.Router();
const {
  getAllUserData,
  getUserData,
  saveUserData,
  updateUserData,
  deleteUserData,
  bulkSaveUserData
} = require('../controllers/userDataController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all user data
router.get('/', getAllUserData);

// Bulk save
router.post('/bulk', bulkSaveUserData);

// Get, save, update, delete by key
router.route('/:key')
  .get(getUserData)
  .post(saveUserData)
  .put(updateUserData)
  .delete(deleteUserData);

module.exports = router;
