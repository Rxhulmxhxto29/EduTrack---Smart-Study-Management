const Announcement = require('../models/Announcement');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler, paginate, buildPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Get all announcements
 * @route   GET /api/announcements
 * @access  Private
 */
exports.getAllAnnouncements = asyncHandler(async (req, res) => {
  const { type, priority, page, limit } = req.query;

  const filter = { isActive: true };

  // Filter by target audience
  if (req.user.role === 'student') {
    filter.$or = [
      { targetAudience: 'all' },
      { targetAudience: 'students' },
      {
        targetAudience: 'specific-class',
        branch: req.user.branch,
        semester: req.user.semester,
        sections: { $in: [req.user.section, null, []] }
      }
    ];
  } else if (req.user.role === 'teacher') {
    filter.$or = [
      { targetAudience: 'all' },
      { targetAudience: 'teachers' }
    ];
  }

  if (type) filter.type = type;
  if (priority) filter.priority = priority;

  const { skip, limit: parsedLimit, page: parsedPage } = paginate(page, limit);

  const [announcements, total] = await Promise.all([
    Announcement.find(filter)
      .populate('createdBy', 'name role')
      .select('-readBy')
      .sort({ isPinned: -1, publishedAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    Announcement.countDocuments(filter)
  ]);

  // Mark which announcements user has read
  const announcementsWithReadStatus = announcements.map(announcement => {
    const obj = announcement.toObject();
    obj.isRead = announcement.isReadBy(req.user._id);
    return obj;
  });

  const response = ApiResponse.success(
    {
      announcements: announcementsWithReadStatus,
      pagination: buildPaginationMeta(total, parsedPage, parsedLimit)
    },
    'Announcements retrieved'
  );

  response.send(res);
});

/**
 * @desc    Get announcement by ID
 * @route   GET /api/announcements/:id
 * @access  Private
 */
exports.getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('createdBy', 'name role');

  if (!announcement) {
    throw ApiError.notFound('Announcement not found');
  }

  // Mark as read
  await announcement.markAsRead(req.user._id);

  const response = ApiResponse.success(
    { announcement },
    'Announcement retrieved'
  );

  response.send(res);
});

/**
 * @desc    Create announcement
 * @route   POST /api/announcements
 * @access  Private (Teacher/Admin)
 */
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    content,
    type,
    priority,
    targetAudience,
    targetRole,
    branch,
    targetBranch,
    semester,
    targetSemester,
    sections,
    expiresAt,
    isPinned
  } = req.body;

  // Accept both content/message and targetRole/targetAudience for flexibility
  const announcementMessage = message || content;
  let audience = targetAudience || targetRole || 'all';
  
  // Map common variations to valid enum values
  if (audience === 'student') audience = 'students';
  if (audience === 'teacher') audience = 'teachers';
  
  const announcementBranch = branch || targetBranch;
  const announcementSemester = semester || targetSemester;

  const announcement = await Announcement.create({
    title,
    message: announcementMessage,
    type,
    priority,
    targetAudience: audience,
    branch: announcementBranch,
    semester: announcementSemester,
    sections,
    expiresAt,
    isPinned: isPinned || false,
    createdBy: req.user._id
  });

  const response = ApiResponse.created(
    { announcement },
    'Announcement created successfully'
  );

  response.send(res);
});

/**
 * @desc    Update announcement
 * @route   PUT /api/announcements/:id
 * @access  Private (Admin/Owner)
 */
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw ApiError.notFound('Announcement not found');
  }

  // Check ownership
  if (req.user.role !== 'admin' && 
      announcement.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to update this announcement');
  }

  const allowedFields = [
    'title', 'message', 'type', 'priority', 'expiresAt', 'isPinned', 'isActive'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      announcement[field] = req.body[field];
    }
  });

  await announcement.save();

  const response = ApiResponse.success(
    { announcement },
    'Announcement updated'
  );

  response.send(res);
});

/**
 * @desc    Delete announcement
 * @route   DELETE /api/announcements/:id
 * @access  Private (Admin/Owner)
 */
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw ApiError.notFound('Announcement not found');
  }

  // Check ownership
  if (req.user.role !== 'admin' && 
      announcement.createdBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to delete this announcement');
  }

  await announcement.deleteOne();

  const response = ApiResponse.success(null, 'Announcement deleted');
  response.send(res);
});

/**
 * @desc    Mark announcement as read
 * @route   POST /api/announcements/:id/read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw ApiError.notFound('Announcement not found');
  }

  await announcement.markAsRead(req.user._id);

  const response = ApiResponse.success(null, 'Marked as read');
  response.send(res);
});
