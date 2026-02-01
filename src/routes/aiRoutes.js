/**
 * AI Routes - API endpoints for AI features
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

// Note Analysis
router.post('/analyze-note/:noteId', aiController.analyzeNote);
router.post('/analyze-notes', aiController.analyzeNotes);

// Summarization
router.post('/summarize/:noteId', aiController.summarizeNote);

// Study Insights & Gap Analysis
router.get('/insights', aiController.getInsights);
router.get('/gap-analysis', aiController.getGapAnalysis);

// Smart Search
router.post('/smart-search', aiController.smartSearch);
router.get('/search-suggestions', aiController.getSearchSuggestions);

// Duplicate Detection
router.get('/duplicates', aiController.findDuplicates);

// Exam Mode
router.get('/exam-ready', aiController.getExamReady);
router.get('/revision-24h', aiController.getLast24HourRevision);

// Content Analysis
router.post('/detect-important/:noteId', aiController.detectImportant);
router.get('/similar/:noteId', aiController.findSimilar);

// Keyword Extraction
router.post('/extract-keywords', aiController.extractKeywords);

module.exports = router;
