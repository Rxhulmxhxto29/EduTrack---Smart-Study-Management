const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    uppercase: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'COMMON', 'OTHER'],
    uppercase: true
  },
  semester: {
    type: Number,
    required: true,
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8']
  },
  credits: {
    type: Number,
    required: true,
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot exceed 6']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  syllabus: {
    url: String,
    publicId: String
  },
  syllabusVersion: {
    type: String,
    default: '1.0'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
subjectSchema.index({ code: 1 }, { unique: true });
subjectSchema.index({ branch: 1, semester: 1 });
subjectSchema.index({ isActive: 1 });

// Virtual for units
subjectSchema.virtual('units', {
  ref: 'Unit',
  localField: '_id',
  foreignField: 'subject'
});

module.exports = mongoose.model('Subject', subjectSchema);
