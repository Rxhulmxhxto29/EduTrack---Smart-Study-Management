const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Statistics
router.get('/stats', flashcardController.getStats);

// Due flashcards for study
router.get('/due', flashcardController.getDueFlashcards);

// CRUD operations
router.get('/', flashcardController.getFlashcards);
router.post('/', flashcardController.createFlashcard);
router.get('/:id', flashcardController.getFlashcard);
router.put('/:id', flashcardController.updateFlashcard);
router.delete('/:id', flashcardController.deleteFlashcard);

// Study session
router.post('/:id/review', flashcardController.recordReview);

module.exports = router;
