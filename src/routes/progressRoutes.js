const express = require('express');
const router = express.Router();
const {
  getProgress,
  getProgressStats,
  markTopicComplete,
  updateTopicStatus,
  markReadyForExam,
  recordRevision
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProgress);
router.get('/stats', protect, getProgressStats);
router.post('/mark-complete', protect, markTopicComplete);
router.put('/:id/topic', protect, updateTopicStatus);
router.put('/:id/ready-for-exam', protect, markReadyForExam);
router.post('/:id/revision', protect, recordRevision);

module.exports = router;
