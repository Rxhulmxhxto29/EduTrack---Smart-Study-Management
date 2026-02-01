const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler, paginate, buildPaginationMeta } = require('../utils/helpers');
const fileService = require('../services/fileService');
const searchService = require('../services/searchService');

/**
 * @desc    Get all notes with filters and search
 * @route   GET /api/notes
 * @access  Private
 */
exports.getAllNotes = asyncHandler(async (req, res) => {
  const {
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
    page,
    limit,
    sortBy,
    sortOrder
  } = req.query;

  // Build filter based on user role
  let filter = {
    isDeleted: false
  };

  // For students, show their own notes + approved public/class notes
  if (req.user.role === 'student') {
    filter.$or = [
      { uploadedBy: req.user._id }, // User's own notes (any visibility)
      { 
        visibility: 'public',
        status: 'approved'
      },
      {
        visibility: 'class',
        status: 'approved',
        branch: req.user.branch,
        semester: req.user.semester,
        section: req.user.section
      }
    ];
  } else {
    // Teachers/Admins see approved notes by default
    filter.status = 'approved';
  }

  // Apply additional filters
  if (subject) filter.subject = subject;
  if (unit) filter.unit = unit;
  if (tags) {
    const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
    filter.tags = { $in: tagArray };
  }
  if (branch) filter.branch = branch.toUpperCase();
  if (semester) filter.semester = parseInt(semester);
  if (section) filter.section = section.toUpperCase();
  if (isImportant) filter.isImportant = isImportant === 'true';
  if (isExamFocused) filter.isExamFocused = isExamFocused === 'true';
  if (isPYQ) filter.isPYQ = isPYQ === 'true';
  if (minRating) filter.averageRating = { $gte: parseFloat(minRating) };

  const { skip, limit: parsedLimit, page: parsedPage } = paginate(page, limit);

  const sort = {};
  const sortField = sortBy || 'createdAt';
  sort[sortField] = sortOrder === 'asc' ? 1 : -1;

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .populate('subject', 'name code')
      .populate('unit', 'name unitNumber')
      .populate('uploadedBy', 'name role')
      .select('-ratings -previousVersions')
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit),
    Note.countDocuments(filter)
  ]);

  const response = ApiResponse.success(
    {
      notes,
      pagination: buildPaginationMeta(total, parsedPage, parsedLimit)
    },
    'Notes retrieved successfully'
  );

  response.send(res);
});

/**
 * @desc    Search notes
 * @route   GET /api/notes/search
 * @access  Private
 */
exports.searchNotes = asyncHandler(async (req, res) => {
  const result = await searchService.searchNotes(req.query, req.query);

  // Filter based on user role
  if (req.user.role === 'student') {
    result.notes = result.notes.filter(note => {
      return note.visibility === 'public' ||
        (note.visibility === 'class' &&
          note.branch === req.user.branch &&
          note.semester === req.user.semester &&
          note.section === req.user.section);
    });
    result.pagination.total = result.notes.length;
  }

  const response = ApiResponse.success(result, 'Search completed');
  response.send(res);
});

/**
 * @desc    Get exam mode notes (important + highly rated)
 * @route   GET /api/notes/exam-mode
 * @access  Private
 */
exports.getExamModeNotes = asyncHandler(async (req, res) => {
  const filters = {
    subject: req.query.subject,
    unit: req.query.unit,
    branch: req.user.role === 'student' ? req.user.branch : req.query.branch,
    semester: req.user.role === 'student' ? req.user.semester : req.query.semester,
    section: req.user.role === 'student' ? req.user.section : req.query.section
  };

  const result = await searchService.getExamModeNotes(filters, req.query);

  const response = ApiResponse.success(result, 'Exam notes retrieved');
  response.send(res);
});

/**
 * @desc    Get single note by ID
 * @route   GET /api/notes/:id
 * @access  Private
 */
exports.getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id)
    .populate('subject', 'name code branch semester')
    .populate('unit', 'name unitNumber description')
    .populate('uploadedBy', 'name role')
    .populate('ratings.user', 'name');

  if (!note) {
    throw ApiError.notFound('Note not found');
  }

  if (note.isDeleted) {
    throw ApiError.notFound('Note has been deleted');
  }

  // Check access permissions
  if (req.user.role === 'student') {
    if (note.visibility === 'private') {
      throw ApiError.forbidden('You do not have access to this note');
    }
    if (note.visibility === 'class') {
      if (note.branch !== req.user.branch ||
          note.semester !== req.user.semester ||
          note.section !== req.user.section) {
        throw ApiError.forbidden('You do not have access to this note');
      }
    }
  }

  // Increment view count
  await note.incrementViews();

  const response = ApiResponse.success({ note }, 'Note retrieved');
  response.send(res);
});

/**
 * @desc    Create new note
 * @route   POST /api/notes
 * @access  Private (All authenticated users)
 */
exports.createNote = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    content,
    subject,
    unit,
    topic,
    tags,
    isImportant,
    isExamFocused,
    hasFormulas,
    hasDiagrams,
    isPYQ,
    pyqYear,
    visibility,
    branch,
    semester,
    section,
    rating
  } = req.body;

  // For personal notes (students), we don't require subject/unit validation
  const isPersonalNote = !subject || !unit || req.user.role === 'student';

  let noteData = {
    title,
    description,
    content: content || '',
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toLowerCase())) : [],
    isImportant: isImportant === 'true' || isImportant === true,
    isExamFocused: isExamFocused === 'true' || isExamFocused === true,
    hasFormulas: hasFormulas === 'true' || hasFormulas === true,
    hasDiagrams: hasDiagrams === 'true' || hasDiagrams === true,
    isPYQ: isPYQ === 'true' || isPYQ === true,
    pyqYear: isPYQ ? pyqYear : undefined,
    visibility: isPersonalNote ? 'private' : (visibility || 'class'),
    branch: branch || req.user.branch,
    semester: semester || req.user.semester,
    section: section || req.user.section,
    uploadedBy: req.user._id,
    rating: rating || 0
  };

  // Handle teacher/admin notes with subject/unit
  if (!isPersonalNote) {
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      throw ApiError.notFound('Subject not found');
    }

    const unitDoc = await Unit.findById(unit);
    if (!unitDoc) {
      throw ApiError.notFound('Unit not found');
    }

    if (unitDoc.subject.toString() !== subject) {
      throw ApiError.badRequest('Unit does not belong to the specified subject');
    }

    noteData.subject = subject;
    noteData.unit = unit;
    noteData.topic = topic;
    noteData.branch = branch || subjectDoc.branch;
    noteData.semester = semester || subjectDoc.semester;
  }

  // Handle file upload if present
  if (req.uploadedFile) {
    const fileData = await fileService.uploadFile(req.uploadedFile, 'edutrack/notes');

    const duplicate = await fileService.checkDuplicate(
      fileData.contentHash,
      Note,
      'contentHash'
    );

    if (duplicate) {
      await fileService.deleteFile(fileData.publicId, fileData.resourceType);
      throw ApiError.conflict(
        `This file already exists: "${duplicate.title}". Please check before uploading.`
      );
    }

    noteData.file = {
      url: fileData.url,
      publicId: fileData.publicId,
      format: fileData.format,
      size: fileData.size
    };
    noteData.contentHash = fileData.contentHash;
  }

  // Handle file data passed as JSON (for local storage fallback)
  if (req.body.file && !req.uploadedFile) {
    noteData.file = req.body.file;
  }

  // Create note
  const note = await Note.create(noteData);

  const populatedNote = await Note.findById(note._id)
    .populate('subject', 'name code')
    .populate('unit', 'name unitNumber')
    .populate('uploadedBy', 'name role');

  const response = ApiResponse.created(
    { note: populatedNote },
    'Note created successfully'
  );

  response.send(res);
});

/**
 * @desc    Update note
 * @route   PUT /api/notes/:id
 * @access  Private (Teacher/Admin/Owner)
 */
exports.updateNote = asyncHandler(async (req, res) => {
  let note = await Note.findById(req.params.id);

  if (!note) {
    throw ApiError.notFound('Note not found');
  }

  // Check ownership
  if (req.user.role !== 'admin' && 
      note.uploadedBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this note');
  }

  const {
    title,
    description,
    content,
    tags,
    isImportant,
    isExamFocused,
    hasFormulas,
    hasDiagrams,
    isPYQ,
    pyqYear,
    visibility,
    rating,
    file
  } = req.body;

  // Update text fields
  if (title) note.title = title;
  if (description !== undefined) note.description = description;
  if (content !== undefined) note.content = content;
  if (rating !== undefined) note.rating = rating;
  if (tags) {
    note.tags = Array.isArray(tags) ? 
      tags.map(t => t.toLowerCase()) : 
      tags.split(',').map(t => t.trim().toLowerCase());
  }
  if (isImportant !== undefined) note.isImportant = isImportant;
  if (isExamFocused !== undefined) note.isExamFocused = isExamFocused;
  if (hasFormulas !== undefined) note.hasFormulas = hasFormulas;
  if (hasDiagrams !== undefined) note.hasDiagrams = hasDiagrams;
  if (isPYQ !== undefined) note.isPYQ = isPYQ;
  if (pyqYear) note.pyqYear = pyqYear;
  if (visibility) note.visibility = visibility;
  
  // Update file from JSON (for local storage data)
  if (file && !req.uploadedFile) {
    note.file = file;
  }

  // Handle file replacement
  if (req.uploadedFile) {
    // Save previous version
    note.previousVersions.push({
      versionNumber: note.version,
      fileUrl: note.file.url,
      publicId: note.file.publicId,
      updatedAt: new Date(),
      updatedBy: req.user._id
    });

    // Upload new file
    const fileData = await fileService.replaceFile(
      note.file.publicId,
      req.uploadedFile,
      'edutrack/notes',
      note.file.format === 'pdf' ? 'raw' : 'image'
    );

    note.file = {
      url: fileData.url,
      publicId: fileData.publicId,
      format: fileData.format,
      size: fileData.size
    };
    note.contentHash = fileData.contentHash;
    note.version += 1;
  }

  await note.save();

  const updatedNote = await Note.findById(note._id)
    .populate('subject', 'name code')
    .populate('unit', 'name unitNumber')
    .populate('uploadedBy', 'name role');

  const response = ApiResponse.success(
    { note: updatedNote },
    'Note updated successfully'
  );

  response.send(res);
});

/**
 * @desc    Delete note (soft delete)
 * @route   DELETE /api/notes/:id
 * @access  Private (Teacher/Admin/Owner)
 */
exports.deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    throw ApiError.notFound('Note not found');
  }

  // Check ownership
  if (req.user.role !== 'admin' && 
      note.uploadedBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to delete this note');
  }

  // Soft delete
  note.isDeleted = true;
  note.deletedAt = new Date();
  await note.save();

  const response = ApiResponse.success(null, 'Note deleted successfully');
  response.send(res);
});

/**
 * @desc    Rate a note
 * @route   POST /api/notes/:id/rate
 * @access  Private
 */
exports.rateNote = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;
  const note = await Note.findById(req.params.id);

  if (!note) {
    throw ApiError.notFound('Note not found');
  }

  if (!rating || rating < 1 || rating > 5) {
    throw ApiError.badRequest('Rating must be between 1 and 5');
  }

  // Check if user already rated
  const existingRatingIndex = note.ratings.findIndex(
    r => r.user.toString() === req.user._id.toString()
  );

  if (existingRatingIndex !== -1) {
    // Update existing rating
    note.ratings[existingRatingIndex].rating = rating;
    note.ratings[existingRatingIndex].review = review;
    note.ratings[existingRatingIndex].createdAt = new Date();
  } else {
    // Add new rating
    note.ratings.push({
      user: req.user._id,
      rating,
      review
    });
  }

  await note.save();

  const response = ApiResponse.success(
    { averageRating: note.averageRating, totalRatings: note.totalRatings },
    'Rating added successfully'
  );

  response.send(res);
});

/**
 * @desc    Increment download count
 * @route   POST /api/notes/:id/download
 * @access  Private
 */
exports.incrementDownload = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    throw ApiError.notFound('Note not found');
  }

  await note.incrementDownloads();

  const response = ApiResponse.success(null, 'Download recorded');
  response.send(res);
});

/**
 * @desc    Get related notes
 * @route   GET /api/notes/:id/related
 * @access  Private
 */
exports.getRelatedNotes = asyncHandler(async (req, res) => {
  const relatedNotes = await searchService.getRelatedNotes(req.params.id);

  const response = ApiResponse.success(
    { notes: relatedNotes },
    'Related notes retrieved'
  );

  response.send(res);
});
