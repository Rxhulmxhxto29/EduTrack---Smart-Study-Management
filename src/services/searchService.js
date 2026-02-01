const Note = require('../models/Note');
const { sanitizeSearchQuery } = require('../utils/helpers');

/**
 * Search notes with advanced filters
 * @param {Object} filters - Search filters
 * @param {Object} options - Pagination and sort options
 * @returns {Object} Search results with metadata
 */
exports.searchNotes = async (filters = {}, options = {}) => {
  try {
    const {
      query,
      subject,
      unit,
      tags,
      branch,
      semester,
      section,
      isImportant,
      isExamFocused,
      isPYQ,
      minRating,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = { ...filters, ...options };

    // Build search filter
    const searchFilter = {
      isDeleted: false,
      status: 'approved'
    };

    // Text search
    if (query) {
      const sanitizedQuery = sanitizeSearchQuery(query);
      searchFilter.$text = { $search: sanitizedQuery };
    }

    // Filter by subject
    if (subject) {
      searchFilter.subject = subject;
    }

    // Filter by unit
    if (unit) {
      searchFilter.unit = unit;
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      searchFilter.tags = { $in: tagArray.map(t => t.toLowerCase()) };
    }

    // Filter by class
    if (branch) {
      searchFilter.branch = branch.toUpperCase();
    }
    if (semester) {
      searchFilter.semester = parseInt(semester);
    }
    if (section) {
      searchFilter.section = section.toUpperCase();
    }

    // Filter by flags
    if (isImportant === 'true' || isImportant === true) {
      searchFilter.isImportant = true;
    }
    if (isExamFocused === 'true' || isExamFocused === true) {
      searchFilter.isExamFocused = true;
    }
    if (isPYQ === 'true' || isPYQ === true) {
      searchFilter.isPYQ = true;
    }

    // Filter by rating
    if (minRating) {
      searchFilter.averageRating = { $gte: parseFloat(minRating) };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sort = {};
    if (query && sortBy === 'relevance') {
      sort.score = { $meta: 'textScore' };
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute search
    const [notes, total] = await Promise.all([
      Note.find(searchFilter)
        .populate('subject', 'name code')
        .populate('unit', 'name unitNumber')
        .populate('uploadedBy', 'name role')
        .select('-ratings -previousVersions')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Note.countDocuments(searchFilter)
    ]);

    return {
      notes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNextPage: skip + notes.length < total,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get exam-focused notes (important + highly rated)
 * @param {Object} filters - Class and subject filters
 * @param {Object} options - Pagination options
 * @returns {Object} Exam notes
 */
exports.getExamModeNotes = async (filters = {}, options = {}) => {
  const { subject, unit, branch, semester, section, page = 1, limit = 50 } = { ...filters, ...options };

  const searchFilter = {
    isDeleted: false,
    status: 'approved',
    $or: [
      { isImportant: true },
      { isExamFocused: true },
      { averageRating: { $gte: 4.0 } }
    ]
  };

  if (subject) searchFilter.subject = subject;
  if (unit) searchFilter.unit = unit;
  if (branch) searchFilter.branch = branch.toUpperCase();
  if (semester) searchFilter.semester = parseInt(semester);
  if (section) searchFilter.section = section.toUpperCase();

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notes, total] = await Promise.all([
    Note.find(searchFilter)
      .populate('subject', 'name code')
      .populate('unit', 'name unitNumber')
      .select('title description file tags isImportant isExamFocused hasFormulas hasDiagrams averageRating totalRatings')
      .sort({ isExamFocused: -1, isImportant: -1, averageRating: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Note.countDocuments(searchFilter)
  ]);

  return {
    notes,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

/**
 * Get related notes (same subject/unit/tags)
 * @param {String} noteId - Current note ID
 * @param {Number} limit - Number of related notes
 * @returns {Array} Related notes
 */
exports.getRelatedNotes = async (noteId, limit = 5) => {
  const note = await Note.findById(noteId);
  if (!note) return [];

  const relatedNotes = await Note.find({
    _id: { $ne: noteId },
    isDeleted: false,
    status: 'approved',
    $or: [
      { subject: note.subject },
      { unit: note.unit },
      { tags: { $in: note.tags } }
    ]
  })
    .populate('subject', 'name')
    .populate('unit', 'name')
    .select('title description file tags averageRating')
    .limit(limit)
    .sort({ averageRating: -1, viewCount: -1 });

  return relatedNotes;
};

/**
 * Get PYQ notes for a subject
 * @param {String} subjectId - Subject ID
 * @param {Object} options - Filter and pagination options
 * @returns {Object} PYQ notes grouped by year
 */
exports.getPYQNotes = async (subjectId, options = {}) => {
  const { page = 1, limit = 20, sortBy = 'pyqYear', sortOrder = 'desc' } = options;

  const filter = {
    subject: subjectId,
    isPYQ: true,
    isDeleted: false,
    status: 'approved'
  };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .populate('unit', 'name unitNumber')
      .select('title file pyqYear averageRating downloadCount')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Note.countDocuments(filter)
  ]);

  // Group by year
  const groupedByYear = notes.reduce((acc, note) => {
    const year = note.pyqYear || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(note);
    return acc;
  }, {});

  return {
    notes: groupedByYear,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

/**
 * Get autocomplete suggestions for search
 * @param {String} query - Partial search query
 * @param {String} field - Field to search ('title', 'tags', etc.)
 * @returns {Array} Suggestions
 */
exports.getSearchSuggestions = async (query, field = 'title', limit = 10) => {
  if (!query || query.length < 2) return [];

  const sanitizedQuery = sanitizeSearchQuery(query);
  const regex = new RegExp(sanitizedQuery, 'i');

  let suggestions;

  if (field === 'tags') {
    suggestions = await Note.distinct('tags', {
      tags: regex,
      isDeleted: false,
      status: 'approved'
    });
  } else {
    const filter = {
      [field]: regex,
      isDeleted: false,
      status: 'approved'
    };

    suggestions = await Note.find(filter)
      .select(field)
      .limit(limit)
      .lean();

    suggestions = suggestions.map(doc => doc[field]);
  }

  return suggestions.slice(0, limit);
};

module.exports = exports;
