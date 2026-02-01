const Progress = require('../models/Progress');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/helpers');

/**
 * @desc    Get user's progress
 * @route   GET /api/progress
 * @access  Private
 */
exports.getProgress = asyncHandler(async (req, res) => {
  const { subject } = req.query;

  const filter = { user: req.user._id };
  if (subject) filter.subject = subject;

  const progress = await Progress.find(filter)
    .populate('subject', 'name code')
    .populate('unit', 'name unitNumber')
    .sort({ 'subject': 1, 'unit.unitNumber': 1 });

  const response = ApiResponse.success(
    { progress },
    'Progress retrieved'
  );

  response.send(res);
});

/**
 * @desc    Get progress statistics
 * @route   GET /api/progress/stats
 * @access  Private
 */
exports.getProgressStats = asyncHandler(async (req, res) => {
  const progress = await Progress.find({ user: req.user._id });

  const stats = {
    totalUnits: progress.length,
    completed: progress.filter(p => p.unitStatus === 'completed').length,
    inProgress: progress.filter(p => p.unitStatus === 'in-progress').length,
    notStarted: progress.filter(p => p.unitStatus === 'not-started').length,
    averageCompletion: progress.length > 0 
      ? Math.round(progress.reduce((acc, p) => acc + p.completionPercentage, 0) / progress.length)
      : 0,
    totalTimeSpent: progress.reduce((acc, p) => acc + p.totalTimeSpent, 0),
    readyForExam: progress.filter(p => p.readyForExam).length
  };

  const response = ApiResponse.success(
    { stats },
    'Progress statistics retrieved'
  );

  response.send(res);
});

/**
 * @desc    Mark topic as complete
 * @route   POST /api/progress/mark-complete
 * @access  Private
 */
exports.markTopicComplete = asyncHandler(async (req, res) => {
  const { subject, subjectId, unit, unitId, topicName, confidenceLevel, userNotes, notes, timeSpent } = req.body;

  // Accept both subject/subjectId and unit/unitId for flexibility
  const actualSubject = subject || subjectId;
  const actualUnit = unit || unitId;
  const actualNotes = userNotes || notes;

  // Find or create progress record
  let progress = await Progress.findOne({
    user: req.user._id,
    subject: actualSubject,
    unit: actualUnit
  });

  if (!progress) {
    // Get unit details to create progress
    const unitDoc = await Unit.findById(actualUnit).populate('subject');
    if (!unitDoc) {
      throw ApiError.notFound('Unit not found');
    }

    // Initialize progress with all topics
    const topicProgress = unitDoc.topics.map(topic => ({
      topicName: topic.name,
      status: 'not-started',
      confidenceLevel: 1
    }));

    progress = await Progress.create({
      user: req.user._id,
      subject: actualSubject,
      unit: actualUnit,
      topicProgress
    });
  }

  // Update topic
  const topic = progress.topicProgress.find(t => t.topicName === topicName);
  
  if (!topic) {
    throw ApiError.notFound('Topic not found in progress');
  }

  topic.status = 'completed';
  topic.completedAt = new Date();
  topic.lastStudied = new Date();
  
  // Convert confidenceLevel from string to number if needed
  if (confidenceLevel) {
    const levelMap = { 'low': 1, 'medium': 2, 'high': 3 };
    topic.confidenceLevel = typeof confidenceLevel === 'string' 
      ? (levelMap[confidenceLevel.toLowerCase()] || parseInt(confidenceLevel))
      : confidenceLevel;
  }
  
  if (actualNotes) topic.userNotes = actualNotes;

  if (timeSpent) {
    progress.addTimeSpent(parseInt(timeSpent));
  }

  await progress.save();

  const response = ApiResponse.success(
    { progress },
    'Topic marked as complete'
  );

  response.send(res);
});

/**
 * @desc    Update topic status
 * @route   PUT /api/progress/:id/topic
 * @access  Private
 */
exports.updateTopicStatus = asyncHandler(async (req, res) => {
  const { topicName, status, confidenceLevel, userNotes } = req.body;

  const progress = await Progress.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!progress) {
    throw ApiError.notFound('Progress not found');
  }

  const topic = progress.topicProgress.find(t => t.topicName === topicName);
  
  if (!topic) {
    throw ApiError.notFound('Topic not found');
  }

  if (status) topic.status = status;
  if (confidenceLevel) topic.confidenceLevel = confidenceLevel;
  if (userNotes) topic.userNotes = userNotes;
  topic.lastStudied = new Date();

  await progress.save();

  const response = ApiResponse.success(
    { progress },
    'Topic status updated'
  );

  response.send(res);
});

/**
 * @desc    Mark unit as ready for exam
 * @route   PUT /api/progress/:id/ready-for-exam
 * @access  Private
 */
exports.markReadyForExam = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!progress) {
    throw ApiError.notFound('Progress not found');
  }

  progress.readyForExam = true;
  await progress.save();

  const response = ApiResponse.success(
    { progress },
    'Unit marked as ready for exam'
  );

  response.send(res);
});

/**
 * @desc    Record revision
 * @route   POST /api/progress/:id/revision
 * @access  Private
 */
exports.recordRevision = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!progress) {
    throw ApiError.notFound('Progress not found');
  }

  progress.revisionCount += 1;
  progress.lastRevisedAt = new Date();
  if (progress.unitStatus === 'completed') {
    progress.unitStatus = 'revision';
  }

  await progress.save();

  const response = ApiResponse.success(
    { progress },
    'Revision recorded'
  );

  response.send(res);
});
