const express = require('express');
const router = express.Router();
const {
  getAllNotes,
  searchNotes,
  getExamModeNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  rateNote,
  incrementDownload,
  getRelatedNotes
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const { validateFile, optionalFileValidation } = require('../middleware/fileUpload');

// Public search endpoint (requires auth)
router.get('/search', protect, searchNotes);
router.get('/exam-mode', protect, getExamModeNotes);

// Note CRUD - Allow all authenticated users to create/manage their own notes
router.route('/')
  .get(protect, getAllNotes)
  .post(
    protect,
    // Removed isTeacherOrAdmin - students can create personal notes
    optionalFileValidation([
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]),
    createNote
  );

router.route('/:id')
  .get(protect, getNoteById)
  .put(
    protect,
    // Removed isTeacherOrAdmin - users can edit their own notes (controller checks ownership)
    optionalFileValidation([
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]),
    updateNote
  )
  .delete(protect, deleteNote); // Controller checks ownership

// Rating and actions
router.post('/:id/rate', protect, rateNote);
router.post('/:id/download', protect, incrementDownload);
router.get('/:id/related', protect, getRelatedNotes);

module.exports = router;
