const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAsRead
} = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');

// Announcements - Students can create personal reminders/announcements
router.route('/')
  .get(protect, getAllAnnouncements)
  .post(protect, createAnnouncement);

router.route('/:id')
  .get(protect, getAnnouncementById)
  .put(protect, updateAnnouncement)
  .delete(protect, deleteAnnouncement);

router.post('/:id/read', protect, markAsRead);

module.exports = router;
