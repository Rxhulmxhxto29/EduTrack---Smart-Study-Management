const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  // Topic-level progress
  topicProgress: [{
    topicName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'revision-needed'],
      default: 'not-started'
    },
    completedAt: Date,
    notesViewed: [{
      note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
      },
      viewedAt: Date,
      timeSpent: Number  // in minutes
    }],
    // Confidence level
    confidenceLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    // Notes
    userNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    lastStudied: Date
  }],
  // Overall unit progress
  unitStatus: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'revision'],
    default: 'not-started'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Time tracking
  totalTimeSpent: {
    type: Number,
    default: 0  // in minutes
  },
  // Exam preparation flags
  readyForExam: {
    type: Boolean,
    default: false
  },
  revisionCount: {
    type: Number,
    default: 0
  },
  lastRevisedAt: Date,
  // Metadata
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

// Compound unique index: one progress record per user-subject-unit
progressSchema.index({ user: 1, subject: 1, unit: 1 }, { unique: true });
progressSchema.index({ user: 1, unitStatus: 1 });
progressSchema.index({ user: 1, subject: 1 });

// Calculate completion percentage before saving
progressSchema.pre('save', function(next) {
  if (this.topicProgress && this.topicProgress.length > 0) {
    const completedTopics = this.topicProgress.filter(
      topic => topic.status === 'completed'
    ).length;
    
    this.completionPercentage = Math.round(
      (completedTopics / this.topicProgress.length) * 100
    );
    
    // Auto-update unit status based on completion
    if (this.completionPercentage === 100) {
      this.unitStatus = 'completed';
    } else if (this.completionPercentage > 0) {
      this.unitStatus = 'in-progress';
    }
  }
  
  next();
});

// Method to mark topic as complete
progressSchema.methods.markTopicComplete = function(topicName) {
  const topic = this.topicProgress.find(t => t.topicName === topicName);
  if (topic) {
    topic.status = 'completed';
    topic.completedAt = new Date();
  }
  return this.save();
};

// Method to add time spent
progressSchema.methods.addTimeSpent = function(minutes) {
  this.totalTimeSpent += minutes;
  return this.save();
};

module.exports = mongoose.model('Progress', progressSchema);
