const Assignment = require('../models/Assignment');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler, paginate, buildPaginationMeta, getDaysUntilDeadline } = require('../utils/helpers');
const fileService = require('../services/fileService');

/**
 * @desc    Get all assignments
 * @route   GET /api/assignments
 * @access  Private
 */
exports.getAllAssignments = asyncHandler(async (req, res) => {
  const { subject, branch, semester, section, status, page, limit } = req.query;

  const filter = { isActive: true };

  // For students, filter by their class
  if (req.user.role === 'student') {
    filter.branch = { $in: [req.user.branch, 'ALL'] };
    filter.semester = req.user.semester;
    filter.$or = [
      { sections: { $size: 0 } }, // All sections
      { sections: req.user.section }
    ];
  } else {
    if (branch) filter.branch = branch.toUpperCase();
    if (semester) filter.semester = parseInt(semester);
    if (section) filter.sections = section.toUpperCase();
  }

  if (subject) filter.subject = subject;

  const { skip, limit: parsedLimit, page: parsedPage } = paginate(page, limit);

  const [assignments, total] = await Promise.all([
    Assignment.find(filter)
      .populate('subject', 'name code')
      .populate('createdBy', 'name')
      .select('-submissions')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parsedLimit),
    Assignment.countDocuments(filter)
  ]);

  const response = ApiResponse.success(
    {
      assignments,
      pagination: buildPaginationMeta(total, parsedPage, parsedLimit)
    },
    'Assignments retrieved successfully'
  );

  response.send(res);
});

/**
 * @desc    Get pending assignments for student
 * @route   GET /api/assignments/pending
 * @access  Private (Student)
 */
exports.getPendingAssignments = asyncHandler(async (req, res) => {
  const filter = {
    branch: { $in: [req.user.branch, 'ALL'] },
    semester: req.user.semester,
    $or: [
      { sections: { $size: 0 } },
      { sections: req.user.section }
    ],
    isActive: true,
    dueDate: { $gte: new Date() }
  };

  const assignments = await Assignment.find(filter)
    .populate('subject', 'name code')
    .select('-submissions')
    .sort({ dueDate: 1 });

  // Filter out assignments already submitted
  const pending = assignments.filter(assignment => 
    !assignment.hasStudentSubmitted(req.user._id)
  );

  const response = ApiResponse.success(
    { assignments: pending },
    'Pending assignments retrieved'
  );

  response.send(res);
});

/**
 * @desc    Get assignment by ID
 * @route   GET /api/assignments/:id
 * @access  Private
 */
exports.getAssignmentById = asyncHandler(async (req, res) => {
  let assignment = await Assignment.findById(req.params.id)
    .populate('subject', 'name code')
    .populate('createdBy', 'name role')
    .populate('submissions.student', 'name enrollmentNumber');

  if (!assignment) {
    throw ApiError.notFound('Assignment not found');
  }

  // For students, show only their submission
  if (req.user.role === 'student') {
    const userSubmission = assignment.getStudentSubmission(req.user._id);
    assignment = assignment.toObject();
    assignment.submissions = userSubmission ? [userSubmission] : [];
    assignment.daysRemaining = getDaysUntilDeadline(assignment.dueDate);
  }

  const response = ApiResponse.success(
    { assignment },
    'Assignment retrieved'
  );

  response.send(res);
});

/**
 * @desc    Create assignment
 * @route   POST /api/assignments
 * @access  Private (Teacher/Admin)
 */
exports.createAssignment = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    subject,
    unit,
    branch,
    targetBranch,
    semester,
    targetSemester,
    sections,
    dueDate,
    maxMarks,
    allowLateSubmission,
    lateSubmissionPenalty
  } = req.body;

  // Accept both branch/targetBranch and semester/targetSemester for flexibility
  const assignmentBranch = branch || targetBranch;
  const assignmentSemester = semester || targetSemester;

  let attachments = [];
  
  // Handle multiple file uploads
  if (req.uploadedFiles && req.uploadedFiles.length > 0) {
    const uploadResults = await fileService.uploadMultipleFiles(
      req.uploadedFiles,
      'edutrack/assignments'
    );
    
    attachments = uploadResults.map((result, index) => ({
      name: req.uploadedFiles[index].name,
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      size: result.size
    }));
  }

  const assignment = await Assignment.create({
    title,
    description,
    subject,
    unit,
    branch: assignmentBranch ? assignmentBranch.toUpperCase() : undefined,
    semester: assignmentSemester,
    sections: sections ? sections.map(s => s.toUpperCase()) : [],
    attachments,
    dueDate,
    maxMarks,
    allowLateSubmission,
    lateSubmissionPenalty,
    createdBy: req.user._id
  });

  const populatedAssignment = await Assignment.findById(assignment._id)
    .populate('subject', 'name code')
    .populate('createdBy', 'name');

  const response = ApiResponse.created(
    { assignment: populatedAssignment },
    'Assignment created successfully'
  );

  response.send(res);
});

/**
 * @desc    Submit assignment
 * @route   POST /api/assignments/:id/submit
 * @access  Private (Student)
 */
exports.submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw ApiError.notFound('Assignment not found');
  }

  // Check if already submitted
  if (assignment.hasStudentSubmitted(req.user._id)) {
    throw ApiError.conflict('You have already submitted this assignment');
  }

  // Check deadline
  if (!assignment.allowLateSubmission && assignment.isOverdue) {
    throw ApiError.badRequest('Assignment deadline has passed');
  }

  const { remarks } = req.body;

  // Upload submission files
  if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
    throw ApiError.badRequest('Please upload at least one file');
  }

  const uploadResults = await fileService.uploadMultipleFiles(
    req.uploadedFiles,
    'edutrack/submissions'
  );

  const files = uploadResults.map((result, index) => ({
    name: req.uploadedFiles[index].name,
    url: result.url,
    publicId: result.publicId,
    format: result.format,
    size: result.size
  }));

  assignment.submissions.push({
    student: req.user._id,
    files,
    remarks
  });

  await assignment.save();

  const response = ApiResponse.created(
    null,
    'Assignment submitted successfully'
  );

  response.send(res);
});

/**
 * @desc    Grade submission
 * @route   PUT /api/assignments/:id/submissions/:submissionId/grade
 * @access  Private (Teacher/Admin)
 */
exports.gradeSubmission = asyncHandler(async (req, res) => {
  const { marksObtained, feedback, status } = req.body;
  
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw ApiError.notFound('Assignment not found');
  }

  const submission = assignment.submissions.id(req.params.submissionId);

  if (!submission) {
    throw ApiError.notFound('Submission not found');
  }

  if (marksObtained > assignment.maxMarks) {
    throw ApiError.badRequest('Marks obtained cannot exceed maximum marks');
  }

  submission.marksObtained = marksObtained;
  submission.feedback = feedback;
  submission.status = status || 'graded';
  submission.gradedBy = req.user._id;
  submission.gradedAt = new Date();

  await assignment.save();

  const response = ApiResponse.success(
    null,
    'Submission graded successfully'
  );

  response.send(res);
});

/**
 * @desc    Update assignment
 * @route   PUT /api/assignments/:id
 * @access  Private (Teacher/Admin/Owner)
 */
exports.updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw ApiError.notFound('Assignment not found');
  }

  // Check ownership
  if (req.user.role !== 'admin' && 
      assignment.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this assignment');
  }

  const { title, description, dueDate, maxMarks, allowLateSubmission, isActive } = req.body;

  if (title) assignment.title = title;
  if (description) assignment.description = description;
  if (dueDate) assignment.dueDate = dueDate;
  if (maxMarks) assignment.maxMarks = maxMarks;
  if (allowLateSubmission !== undefined) assignment.allowLateSubmission = allowLateSubmission;
  if (isActive !== undefined) assignment.isActive = isActive;

  await assignment.save();

  const response = ApiResponse.success(
    { assignment },
    'Assignment updated successfully'
  );

  response.send(res);
});

/**
 * @desc    Delete assignment
 * @route   DELETE /api/assignments/:id
 * @access  Private (Admin/Owner)
 */
exports.deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw ApiError.notFound('Assignment not found');
  }

  // Check ownership
  if (req.user.role !== 'admin' && 
      assignment.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to delete this assignment');
  }

  assignment.isActive = false;
  await assignment.save();

  const response = ApiResponse.success(null, 'Assignment deleted successfully');
  response.send(res);
});
