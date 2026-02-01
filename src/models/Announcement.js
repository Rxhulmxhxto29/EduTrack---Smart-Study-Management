const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Announcement message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'urgent', 'exam', 'holiday', 'event', 'academic'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // Target audience
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'teachers', 'specific-class'],
    default: 'all'
  },
  // For specific class announcements
  branch: String,
  semester: Number,
  sections: [String],
  // Attachments
  attachments: [{
    name: String,
    url: String,
    publicId: String,
    format: String,
    size: Number
  }],
  // Scheduling
  publishedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Read tracking
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
announcementSchema.index({ publishedAt: -1, isPinned: -1 });
announcementSchema.index({ type: 1, priority: -1 });
announcementSchema.index({ branch: 1, semester: 1 });
announcementSchema.index({ targetAudience: 1, isActive: 1 });
announcementSchema.index({ expiresAt: 1 });
announcementSchema.index({ 'readBy.user': 1 });

// Virtual for read count
announcementSchema.virtual('readCount').get(function() {
  return this.readBy ? this.readBy.length : 0;
});

// Method to mark as read by user
announcementSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(
    item => item.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({ user: userId, readAt: new Date() });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to check if user has read
announcementSchema.methods.isReadBy = function(userId) {
  if (!this.readBy || this.readBy.length === 0) {
    return false;
  }
  return this.readBy.some(item => item.user.toString() === userId.toString());
};

// Virtual for content (alias for message)
announcementSchema.virtual('content').get(function() {
  return this.message;
}).set(function(value) {
  this.message = value;
});

// Auto-deactivate expired announcements (can be run as a cron job)
announcementSchema.statics.deactivateExpired = async function() {
  const now = new Date();
  return this.updateMany(
    { expiresAt: { $lt: now }, isActive: true },
    { $set: { isActive: false } }
  );
};

module.exports = mongoose.model('Announcement', announcementSchema);
