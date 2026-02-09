const Flashcard = require('../models/Flashcard');
const Subject = require('../models/Subject');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// Get all flashcards for the current user
exports.getFlashcards = async (req, res, next) => {
  try {
    const { subject, deck, difficulty, dueSoon } = req.query;
    
    const filter = { createdBy: req.user._id };
    
    if (subject) filter.subject = subject;
    if (deck) filter.deck = deck;
    if (difficulty) filter.difficulty = difficulty;
    
    // Due soon: cards that need review in next 7 days
    if (dueSoon === 'true') {
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      filter['studyStats.nextReview'] = { $lte: weekFromNow };
    }
    
    const flashcards = await Flashcard.find(filter)
      .populate('subject', 'name code')
      .populate('unit', 'name')
      .sort('-createdAt');
    
    res.json(new ApiResponse(true, 'Flashcards retrieved successfully', { 
      flashcards,
      count: flashcards.length 
    }));
  } catch (error) {
    next(error);
  }
};

// Get a single flashcard
exports.getFlashcard = async (req, res, next) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
      .populate('subject', 'name code')
      .populate('unit', 'name');
    
    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found');
    }
    
    res.json(new ApiResponse(true, 'Flashcard retrieved successfully', { flashcard }));
  } catch (error) {
    next(error);
  }
};

// Create a new flashcard
exports.createFlashcard = async (req, res, next) => {
  try {
    const { subject, question, answer, hint, tags, difficulty, deck, unit } = req.body;
    
    // Verify subject exists
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      throw new ApiError(404, 'Subject not found');
    }
    
    const flashcard = await Flashcard.create({
      createdBy: req.user._id,
      subject,
      subjectName: subjectDoc.name,
      unit,
      question,
      answer,
      hint,
      tags: tags || [],
      difficulty: difficulty || 'medium',
      deck: deck || 'General',
    });
    
    await flashcard.populate('subject', 'name code');
    
    res.status(201).json(new ApiResponse(true, 'Flashcard created successfully', { flashcard }));
  } catch (error) {
    next(error);
  }
};

// Update a flashcard
exports.updateFlashcard = async (req, res, next) => {
  try {
    const { question, answer, hint, tags, difficulty, deck, subject, unit } = req.body;
    
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    
    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found');
    }
    
    // Update fields
    if (question !== undefined) flashcard.question = question;
    if (answer !== undefined) flashcard.answer = answer;
    if (hint !== undefined) flashcard.hint = hint;
    if (tags !== undefined) flashcard.tags = tags;
    if (difficulty !== undefined) flashcard.difficulty = difficulty;
    if (deck !== undefined) flashcard.deck = deck;
    if (unit !== undefined) flashcard.unit = unit;
    
    if (subject !== undefined) {
      const subjectDoc = await Subject.findById(subject);
      if (!subjectDoc) {
        throw new ApiError(404, 'Subject not found');
      }
      flashcard.subject = subject;
      flashcard.subjectName = subjectDoc.name;
    }
    
    await flashcard.save();
    await flashcard.populate('subject', 'name code');
    
    res.json(new ApiResponse(true, 'Flashcard updated successfully', { flashcard }));
  } catch (error) {
    next(error);
  }
};

// Delete a flashcard
exports.deleteFlashcard = async (req, res, next) => {
  try {
    const flashcard = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    
    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found');
    }
    
    res.json(new ApiResponse(true, 'Flashcard deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// Record a study session review
exports.recordReview = async (req, res, next) => {
  try {
    const { correct } = req.body;
    
    if (typeof correct !== 'boolean') {
      throw new ApiError(400, 'correct field must be a boolean');
    }
    
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    
    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found');
    }
    
    await flashcard.recordReview(correct);
    
    res.json(new ApiResponse(true, 'Review recorded successfully', { 
      flashcard,
      accuracy: flashcard.accuracy,
      nextReview: flashcard.studyStats.nextReview,
    }));
  } catch (error) {
    next(error);
  }
};

// Get due flashcards for study
exports.getDueFlashcards = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    
    const dueCards = await Flashcard.find({
      createdBy: req.user._id,
      'studyStats.nextReview': { $lte: new Date() },
    })
      .populate('subject', 'name code')
      .populate('unit', 'name')
      .limit(parseInt(limit))
      .sort('studyStats.nextReview');
    
    res.json(new ApiResponse(true, 'Due flashcards retrieved successfully', { 
      flashcards: dueCards,
      count: dueCards.length 
    }));
  } catch (error) {
    next(error);
  }
};

// Get flashcard statistics
exports.getStats = async (req, res, next) => {
  try {
    const totalCards = await Flashcard.countDocuments({ createdBy: req.user._id });
    
    const dueCards = await Flashcard.countDocuments({
      createdBy: req.user._id,
      'studyStats.nextReview': { $lte: new Date() },
    });
    
    const masteredCards = await Flashcard.countDocuments({
      createdBy: req.user._id,
      'studyStats.totalReviews': { $gte: 5 },
      interval: { $gte: 7 },
    });
    
    const byDifficulty = await Flashcard.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);
    
    const bySubject = await Flashcard.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$subjectName', count: { $sum: 1 } } },
    ]);
    
    res.json(new ApiResponse(true, 'Statistics retrieved successfully', {
      totalCards,
      dueCards,
      masteredCards,
      byDifficulty,
      bySubject,
    }));
  } catch (error) {
    next(error);
  }
};
