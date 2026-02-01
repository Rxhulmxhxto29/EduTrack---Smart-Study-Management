const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  content: {
    type: String,
    trim: true,
    maxlength: [50000, 'Content cannot exceed 50000 characters']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: false  // Made optional for personal notes
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: false  // Made optional for personal notes
  },
  topic: {
    type: String,
    trim: true
  },
  file: {
    url: {
      type: String
    },
    publicId: {
      type: String
    },
    format: {
      type: String,
      enum: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', null]
    },
    size: {
      type: Number  // in bytes
    },
    filename: String,
    mimetype: String,
    isLocal: Boolean  // For base64 stored files
  },
  // User rating for personal notes
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Important flags for filtering
  isImportant: {
    type: Boolean,
    default: false
  },
  isExamFocused: {
    type: Boolean,
    default: false
  },
  hasFormulas: {
    type: Boolean,
    default: false
  },
  hasDiagrams: {
    type: Boolean,
    default: false
  },
  isPYQ: {
    type: Boolean,
    default: false  // Previous Year Question paper
  },
  pyqYear: {
    type: Number,
    min: [2000, 'Invalid year'],
    max: [new Date().getFullYear(), 'Year cannot be in future']
  },
  // Version control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    versionNumber: Number,
    fileUrl: String,
    publicId: String,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Ratings
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Duplicate detection hash
  contentHash: {
    type: String
  },
  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  moderationNote: String,
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  // Upload info
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'class', 'private'],
    default: 'class'
  },
  // Class specific (for class visibility)
  branch: String,
  semester: Number,
  section: String,
  // Metadata
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  // AI-Generated Fields
  aiScore: {
    quality: { type: Number, min: 0, max: 100, default: 0 },
    completeness: { type: Number, min: 0, max: 100, default: 0 },
    examRelevance: { type: Number, min: 0, max: 100, default: 0 },
    overall: { type: Number, min: 0, max: 100, default: 0 }
  },
  aiTags: [{
    type: String,
    enum: [
      'Exam Important',
      'High Weightage',
      'Quick Revision',
      'Must Read',
      'Formula Heavy',
      'Definition Rich',
      'PYQ Frequent',
      'Low Priority'
    ]
  }],
  aiKeywords: [{
    word: String,
    importance: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    }
  }],
  aiSummary: {
    short: String,
    detailed: String,
    bulletPoints: [String],
    keyPoints: [String]
  },
  aiAnalyzedAt: Date,
  // PYQ Matching
  pyqMatches: [{
    question: String,
    year: Number,
    similarity: Number,
    marks: Number
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

// Compound indexes for efficient queries
noteSchema.index({ subject: 1, unit: 1 });
noteSchema.index({ subject: 1, isImportant: 1, isExamFocused: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ isPYQ: 1, pyqYear: -1 });
noteSchema.index({ branch: 1, semester: 1, section: 1 });
noteSchema.index({ isDeleted: 1, status: 1 });
noteSchema.index({ averageRating: -1 });
noteSchema.index({ contentHash: 1 }, { unique: true, sparse: true });
noteSchema.index({ createdAt: -1 });
// AI Score indexes
noteSchema.index({ 'aiScore.examRelevance': -1 });
noteSchema.index({ 'aiScore.overall': -1 });
noteSchema.index({ aiTags: 1 });

// Text index for search
noteSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  topic: 'text'
});

// Calculate average rating before saving
noteSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = (sum / this.ratings.length).toFixed(1);
    this.totalRatings = this.ratings.length;
  }
  next();
});

// Method to increment view count
noteSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment download count
noteSchema.methods.incrementDownloads = function() {
  this.downloadCount += 1;
  return this.save();
};

module.exports = mongoose.model('Note', noteSchema);
