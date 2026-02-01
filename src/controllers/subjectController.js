const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler, paginate, buildPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Get all subjects
 * @route   GET /api/subjects
 * @access  Private
 */
exports.getAllSubjects = asyncHandler(async (req, res) => {
  const { branch, semester, page, limit } = req.query;

  const filter = { isActive: true };
  
  // For students, filter by their branch and semester
  if (req.user.role === 'student') {
    filter.branch = { $in: [req.user.branch, 'COMMON'] };
    filter.semester = req.user.semester;
  } else {
    if (branch) filter.branch = branch.toUpperCase();
    if (semester) filter.semester = parseInt(semester);
  }

  const { skip, limit: parsedLimit, page: parsedPage } = paginate(page, limit);

  const [subjects, total] = await Promise.all([
    Subject.find(filter)
      .populate('createdBy', 'name')
      .sort({ semester: 1, code: 1 })
      .skip(skip)
      .limit(parsedLimit),
    Subject.countDocuments(filter)
  ]);

  const response = ApiResponse.success(
    {
      subjects,
      pagination: buildPaginationMeta(total, parsedPage, parsedLimit)
    },
    'Subjects retrieved successfully'
  );

  response.send(res);
});

/**
 * @desc    Get subject by ID with units
 * @route   GET /api/subjects/:id
 * @access  Private
 */
exports.getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id)
    .populate('createdBy', 'name role');

  if (!subject) {
    throw ApiError.notFound('Subject not found');
  }

  // Get units for this subject
  const units = await Unit.find({ subject: subject._id, isActive: true })
    .sort({ unitNumber: 1 });

  const response = ApiResponse.success(
    { subject, units },
    'Subject details retrieved'
  );

  response.send(res);
});

/**
 * @desc    Create subject
 * @route   POST /api/subjects
 * @access  Private (Admin)
 */
exports.createSubject = asyncHandler(async (req, res) => {
  const { name, code, branch, semester, credits, description, syllabusVersion } = req.body;

  // Check if code already exists
  const existing = await Subject.findOne({ code: code.toUpperCase() });
  if (existing) {
    throw ApiError.conflict('Subject code already exists');
  }

  const subject = await Subject.create({
    name,
    code: code.toUpperCase(),
    branch: branch.toUpperCase(),
    semester,
    credits,
    description,
    syllabusVersion,
    createdBy: req.user._id
  });

  const response = ApiResponse.created(
    { subject },
    'Subject created successfully'
  );

  response.send(res);
});

/**
 * @desc    Update subject
 * @route   PUT /api/subjects/:id
 * @access  Private (Admin)
 */
exports.updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    throw ApiError.notFound('Subject not found');
  }

  const { name, description, credits, syllabusVersion, isActive } = req.body;

  if (name) subject.name = name;
  if (description) subject.description = description;
  if (credits) subject.credits = credits;
  if (syllabusVersion) subject.syllabusVersion = syllabusVersion;
  if (isActive !== undefined) subject.isActive = isActive;

  await subject.save();

  const response = ApiResponse.success(
    { subject },
    'Subject updated successfully'
  );

  response.send(res);
});

/**
 * @desc    Delete subject
 * @route   DELETE /api/subjects/:id
 * @access  Private (Admin)
 */
exports.deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    throw ApiError.notFound('Subject not found');
  }

  subject.isActive = false;
  await subject.save();

  const response = ApiResponse.success(null, 'Subject deactivated successfully');
  response.send(res);
});

/**
 * @desc    Create unit for subject
 * @route   POST /api/subjects/:id/units
 * @access  Private (Admin/Teacher)
 */
exports.createUnit = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    throw ApiError.notFound('Subject not found');
  }

  const { unitNumber, name, description, topics, duration } = req.body;

  const unit = await Unit.create({
    subject: subject._id,
    unitNumber,
    name,
    description,
    topics,
    duration
  });

  const response = ApiResponse.created(
    { unit },
    'Unit created successfully'
  );

  response.send(res);
});

/**
 * @desc    Update unit
 * @route   PUT /api/subjects/units/:unitId
 * @access  Private (Admin/Teacher)
 */
exports.updateUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.findById(req.params.unitId);

  if (!unit) {
    throw ApiError.notFound('Unit not found');
  }

  const { name, description, topics, duration, isActive } = req.body;

  if (name) unit.name = name;
  if (description) unit.description = description;
  if (topics) unit.topics = topics;
  if (duration) unit.duration = duration;
  if (isActive !== undefined) unit.isActive = isActive;

  await unit.save();

  const response = ApiResponse.success(
    { unit },
    'Unit updated successfully'
  );

  response.send(res);
});

/**
 * @desc    Delete unit
 * @route   DELETE /api/subjects/units/:unitId
 * @access  Private (Admin)
 */
exports.deleteUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.findById(req.params.unitId);

  if (!unit) {
    throw ApiError.notFound('Unit not found');
  }

  unit.isActive = false;
  await unit.save();

  const response = ApiResponse.success(null, 'Unit deactivated successfully');
  response.send(res);
});
