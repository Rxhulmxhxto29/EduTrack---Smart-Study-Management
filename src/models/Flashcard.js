const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  // Creator Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Subject Association
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  
  subjectName: {
    type: String,
    required: true,
  },

  // Optional Unit Association
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
  },

  // Card Content
  question: {
    type: String,
    required: true,
    trim: true,
  },

  answer: {
    type: String,
    required: true,
    trim: true,
  },

  // Optional Additional Information
  hint: {
    type: String,
    trim: true,
  },

  tags: [{
    type: String,
    trim: true,
  }],

  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },

  // Study Progress
  studyStats: {
    totalReviews: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    lastReviewed: {
      type: Date,
    },
    nextReview: {
      type: Date,
    },
  },

  // Spaced Repetition
  interval: {
    type: Number,
    default: 1, // Days until next review
  },

  easeFactor: {
    type: Number,
    default: 2.5, // SM-2 algorithm default
  },

  // Organization
  deck: {
    type: String,
    default: 'General',
  },

  isPublic: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true,
});

// Indexes for performance
flashcardSchema.index({ createdBy: 1, subject: 1 });
flashcardSchema.index({ 'studyStats.nextReview': 1 });
flashcardSchema.index({ deck: 1 });
flashcardSchema.index({ tags: 1 });

// Virtual for accuracy percentage
flashcardSchema.virtual('accuracy').get(function() {
  if (this.studyStats.totalReviews === 0) return 0;
  return Math.round((this.studyStats.correctCount / this.studyStats.totalReviews) * 100);
});

// Methods
flashcardSchema.methods.recordReview = function(correct) {
  this.studyStats.totalReviews += 1;
  if (correct) {
    this.studyStats.correctCount += 1;
    // Increase interval for spaced repetition
    this.interval = Math.ceil(this.interval * this.easeFactor);
    this.easeFactor = Math.max(1.3, this.easeFactor + 0.1);
  } else {
    // Reset interval on incorrect answer
    this.interval = 1;
    this.easeFactor = Math.max(1.3, this.easeFactor - 0.2);
  }
  
  this.studyStats.lastReviewed = new Date();
  this.studyStats.nextReview = new Date(Date.now() + this.interval * 24 * 60 * 60 * 1000);
  
  return this.save();
};

// Statics
flashcardSchema.statics.getDueCards = function(userId) {
  return this.find({
    createdBy: userId,
    'studyStats.nextReview': { $lte: new Date() },
  }).populate('subject', 'name');
};

module.exports = mongoose.model('Flashcard', flashcardSchema);
