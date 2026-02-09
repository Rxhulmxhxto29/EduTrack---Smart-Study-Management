const Timetable = require('../models/Timetable');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/helpers');

/**
 * @desc    Get user's timetable
 * @route   GET /api/timetable
 * @access  Private
 */
exports.getTimetable = asyncHandler(async (req, res) => {
  const { dayOfWeek } = req.query;

  const filter = { isActive: true };

  // Get personal timetable or shared class timetable
  if (req.user.role === 'student') {
    filter.$or = [
      { user: req.user._id, type: 'personal' },
      {
        type: 'shared',
        branch: req.user.branch,
        semester: req.user.semester,
        section: req.user.section
      }
    ];
  } else {
    filter.user = req.user._id;
  }

  if (dayOfWeek) {
    filter.dayOfWeek = dayOfWeek.toLowerCase();
  }

  const timetable = await Timetable.find(filter)
    .populate('subject', 'name code')
    .sort({ dayOfWeek: 1, startTime: 1 });

  // Group by day
  const grouped = timetable.reduce((acc, entry) => {
    const day = entry.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {});

  const response = ApiResponse.success(
    { timetable: grouped },
    'Timetable retrieved'
  );

  response.send(res);
});

/**
 * @desc    Create timetable entry
 * @route   POST /api/timetable
 * @access  Private
 */
exports.createTimetableEntry = asyncHandler(async (req, res) => {
  const {
    type,
    branch,
    semester,
    section,
    dayOfWeek,
    startTime,
    endTime,
    subject,
    classType,
    room,
    teacher,
    notes,
    onlineLink
  } = req.body;

  // Only teachers/admin can create shared timetables
  if (type === 'shared' && req.user.role === 'student') {
    throw ApiError.forbidden('Students cannot create shared timetables');
  }

  const entry = await Timetable.create({
    user: req.user._id,
    type: type || 'personal',
    branch,
    semester,
    section,
    dayOfWeek: dayOfWeek.toLowerCase(),
    startTime,
    endTime,
    subject,
    classType,
    room,
    teacher,
    notes,
    onlineLink
  });

  const populatedEntry = await Timetable.findById(entry._id)
    .populate('subject', 'name code');

  const response = ApiResponse.created(
    { entry: populatedEntry },
    'Timetable entry created'
  );

  response.send(res);
});

/**
 * @desc    Update timetable entry
 * @route   PUT /api/timetable/:id
 * @access  Private
 */
exports.updateTimetableEntry = asyncHandler(async (req, res) => {
  const entry = await Timetable.findById(req.params.id);

  if (!entry) {
    throw ApiError.notFound('Timetable entry not found');
  }

  // Check ownership
  if (entry.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this entry');
  }

  const allowedFields = [
    'startTime', 'endTime', 'subject', 'classType', 'room',
    'teacher', 'notes', 'onlineLink', 'isActive'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      entry[field] = req.body[field];
    }
  });

  await entry.save();

  const response = ApiResponse.success(
    { entry },
    'Timetable entry updated'
  );

  response.send(res);
});

/**
 * @desc    Delete timetable entry
 * @route   DELETE /api/timetable/:id
 * @access  Private
 */
exports.deleteTimetableEntry = asyncHandler(async (req, res) => {
  const entry = await Timetable.findById(req.params.id);

  if (!entry) {
    throw ApiError.notFound('Timetable entry not found');
  }

  // Check ownership
  if (entry.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to delete this entry');
  }

  await entry.deleteOne();

  const response = ApiResponse.success(null, 'Timetable entry deleted');
  response.send(res);
});
