/**
 * AI Controller - Handles all AI-related API requests
 */

const aiService = require('../services/ai');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Progress = require('../models/Progress');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Analyze a single note
 * POST /api/ai/analyze-note/:noteId
 */
exports.analyzeNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    
    const note = await Note.findById(noteId);
    if (!note) {
      throw new ApiError(404, 'Note not found');
    }

    const analysis = aiService.analyzeNote(note);

    // Update note with AI data
    await Note.findByIdAndUpdate(noteId, {
      aiScore: analysis.aiScore,
      aiTags: analysis.aiTags,
      aiKeywords: analysis.keywords,
      aiSummary: analysis.summary,
      aiAnalyzedAt: new Date()
    });

    res.status(200).json(
      new ApiResponse(200, analysis, 'Note analyzed successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Batch analyze multiple notes
 * POST /api/ai/analyze-notes
 */
exports.analyzeNotes = async (req, res, next) => {
  try {
    const { noteIds } = req.body;
    const userId = req.user._id;

    let notes;
    if (noteIds && noteIds.length > 0) {
      notes = await Note.find({ _id: { $in: noteIds } });
    } else {
      // Analyze all user's notes
      notes = await Note.find({ uploadedBy: userId }).limit(50);
    }

    const results = [];
    for (const note of notes) {
      const analysis = aiService.analyzeNote(note);
      
      // Update note with AI data
      await Note.findByIdAndUpdate(note._id, {
        aiScore: analysis.aiScore,
        aiTags: analysis.aiTags,
        aiKeywords: analysis.keywords,
        aiSummary: analysis.summary,
        aiAnalyzedAt: new Date()
      });

      results.push({
        noteId: note._id,
        title: note.title,
        aiScore: analysis.aiScore,
        tags: analysis.aiTags
      });
    }

    res.status(200).json(
      new ApiResponse(200, { analyzed: results.length, results }, 'Notes analyzed successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Generate summary for a note
 * POST /api/ai/summarize/:noteId
 */
exports.summarizeNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { type = 'exam' } = req.query;

    const note = await Note.findById(noteId);
    if (!note) {
      throw new ApiError(404, 'Note not found');
    }

    const content = [note.title, note.description, note.content].filter(Boolean).join(' ');
    const summary = aiService.generateSummary(content, type);

    // Update note with summary
    await Note.findByIdAndUpdate(noteId, {
      'aiSummary.short': typeof summary === 'string' ? summary : summary.summary,
      'aiSummary.detailed': aiService.generateSummary(content, 'detailed')
    });

    res.status(200).json(
      new ApiResponse(200, { summary, type }, 'Summary generated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI study insights
 * GET /api/ai/insights
 */
exports.getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user's notes
    const notes = await Note.find({ 
      $or: [
        { uploadedBy: userId },
        { isPublic: true }
      ]
    }).limit(100);

    // Get user's progress
    const progress = await Progress.find({ user: userId });

    // Generate insights
    const insights = aiService.generateInsights(notes, progress);

    res.status(200).json(
      new ApiResponse(200, insights, 'Insights generated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get study gap analysis
 * GET /api/ai/gap-analysis
 */
exports.getGapAnalysis = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { branch, semester } = req.user;

    // Get subjects for user's branch/semester
    const subjects = await Subject.find({ branch, semester });

    // Get user's progress
    const progress = await Progress.find({ user: userId });

    // Get notes
    const notes = await Note.find({
      $or: [
        { uploadedBy: userId },
        { branch, semester, isPublic: true }
      ]
    });

    // Analyze gaps
    const gapAnalysis = aiService.analyzeStudyGaps(progress, subjects, notes);

    res.status(200).json(
      new ApiResponse(200, gapAnalysis, 'Gap analysis completed')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Smart search
 * POST /api/ai/smart-search
 */
exports.smartSearch = async (req, res, next) => {
  try {
    const { query, filters = {} } = req.body;
    const userId = req.user._id;
    const { branch, semester } = req.user;

    if (!query) {
      throw new ApiError(400, 'Search query is required');
    }

    // Get notes to search
    const notes = await Note.find({
      $or: [
        { uploadedBy: userId },
        { branch, semester, isPublic: true }
      ]
    }).populate('subject', 'name');

    // Apply filters
    let searchFilters = { ...filters };
    if (filters.examMode) {
      searchFilters.examMode = true;
    }

    // Perform smart search
    const searchResults = aiService.searchWithFilters(query, notes, searchFilters);

    res.status(200).json(
      new ApiResponse(200, {
        results: searchResults.results.map(r => ({
          note: {
            _id: r.note._id,
            title: r.note.title,
            description: r.note.description,
            subject: r.note.subject,
            aiTags: r.note.aiTags,
            aiScore: r.note.aiScore
          },
          relevance: Math.round(r.relevance),
          matchType: r.matchType
        })),
        queryType: searchResults.queryType,
        parsedQuery: searchResults.parsedQuery,
        totalMatches: searchResults.totalMatches
      }, 'Search completed')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get search suggestions
 * GET /api/ai/search-suggestions
 */
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;
    const { branch, semester } = req.user;

    if (!q || q.length < 2) {
      return res.status(200).json(
        new ApiResponse(200, [], 'Query too short')
      );
    }

    const notes = await Note.find({
      $or: [
        { uploadedBy: userId },
        { branch, semester, isPublic: true }
      ]
    }).select('title topics aiKeywords');

    const suggestions = aiService.getSearchSuggestions(q, notes);

    res.status(200).json(
      new ApiResponse(200, suggestions, 'Suggestions retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Find duplicate notes
 * GET /api/ai/duplicates
 */
exports.findDuplicates = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const notes = await Note.find({ uploadedBy: userId })
      .select('title description content topics');

    const duplicates = aiService.findDuplicates(notes, 0.75);

    res.status(200).json(
      new ApiResponse(200, {
        duplicateGroups: duplicates.length,
        groups: duplicates.map(group => ({
          original: {
            _id: group.original._id,
            title: group.original.title
          },
          duplicates: group.duplicates.map(d => ({
            _id: d.note._id,
            title: d.note.title,
            similarity: d.similarity
          }))
        }))
      }, 'Duplicates found')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get exam-ready content
 * GET /api/ai/exam-ready
 */
exports.getExamReady = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { branch, semester } = req.user;
    const { subject, minScore = 60 } = req.query;

    let query = {
      $or: [
        { uploadedBy: userId },
        { branch, semester, isPublic: true }
      ]
    };

    if (subject) {
      query.subject = subject;
    }

    const notes = await Note.find(query)
      .populate('subject', 'name')
      .sort({ 'aiScore.examRelevance': -1 });

    // Filter by AI score
    const examReadyNotes = notes.filter(note => 
      (note.aiScore?.examRelevance || 0) >= parseInt(minScore) ||
      note.aiTags?.includes('Exam Important') ||
      note.aiTags?.includes('Must Read')
    );

    res.status(200).json(
      new ApiResponse(200, {
        total: examReadyNotes.length,
        notes: examReadyNotes.map(note => ({
          _id: note._id,
          title: note.title,
          subject: note.subject,
          aiScore: note.aiScore,
          aiTags: note.aiTags,
          summary: note.aiSummary?.short
        }))
      }, 'Exam-ready content retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get last 24-hour revision content
 * GET /api/ai/revision-24h
 */
exports.getLast24HourRevision = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { branch, semester } = req.user;

    const notes = await Note.find({
      $or: [
        { uploadedBy: userId },
        { branch, semester, isPublic: true }
      ],
      'aiScore.examRelevance': { $gte: 50 }
    })
    .populate('subject', 'name')
    .sort({ 'aiScore.examRelevance': -1 })
    .limit(30);

    const revisionContent = aiService.getLast24HourRevision(notes);

    res.status(200).json(
      new ApiResponse(200, {
        totalItems: revisionContent.length,
        revisionContent
      }, 'Revision content retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Detect important content in a note
 * POST /api/ai/detect-important/:noteId
 */
exports.detectImportant = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
      throw new ApiError(404, 'Note not found');
    }

    const analysis = aiService.analyzeNote(note);

    res.status(200).json(
      new ApiResponse(200, {
        importanceScore: analysis.aiScore.examRelevance,
        tags: analysis.aiTags,
        keywords: analysis.keywords,
        stats: analysis.stats,
        examRelevance: analysis.examRelevance,
        formulas: analysis.formulas,
        definitions: analysis.definitions
      }, 'Important content detected')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Find similar notes
 * GET /api/ai/similar/:noteId
 */
exports.findSimilar = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;
    const { branch, semester } = req.user;

    const targetNote = await Note.findById(noteId);
    if (!targetNote) {
      throw new ApiError(404, 'Note not found');
    }

    const allNotes = await Note.find({
      _id: { $ne: noteId },
      $or: [
        { uploadedBy: userId },
        { branch, semester, isPublic: true }
      ]
    });

    const similarNotes = aiService.findSimilarNotes(targetNote, allNotes, 5);

    res.status(200).json(
      new ApiResponse(200, {
        targetNote: { _id: targetNote._id, title: targetNote.title },
        similar: similarNotes.map(s => ({
          _id: s.note._id,
          title: s.note.title,
          similarity: s.similarity
        }))
      }, 'Similar notes found')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Extract keywords from text
 * POST /api/ai/extract-keywords
 */
exports.extractKeywords = async (req, res, next) => {
  try {
    const { text, topN = 15 } = req.body;

    if (!text) {
      throw new ApiError(400, 'Text is required');
    }

    const keywords = aiService.extractKeywords(text, topN);

    res.status(200).json(
      new ApiResponse(200, { keywords }, 'Keywords extracted')
    );
  } catch (error) {
    next(error);
  }
};
