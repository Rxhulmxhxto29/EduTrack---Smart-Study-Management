const express = require('express');
const router = express.Router();
const {
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry
} = require('../controllers/timetableController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getTimetable)
  .post(protect, createTimetableEntry);

router.route('/:id')
  .put(protect, updateTimetableEntry)
  .delete(protect, deleteTimetableEntry);

module.exports = router;
