const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  unitNumber: {
    type: Number,
    required: true,
    min: [1, 'Unit number must be at least 1']
  },
  name: {
    type: String,
    required: [true, 'Unit name is required'],
    trim: true,
    maxlength: [150, 'Unit name cannot exceed 150 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  topics: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    isImportant: {
      type: Boolean,
      default: false
    }
  }],
  duration: {
    type: String,  // e.g., "2 weeks", "10 hours"
    trim: true
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
  timestamps: true
});

// Compound index for unique unit number per subject
unitSchema.index({ subject: 1, unitNumber: 1 }, { unique: true });
unitSchema.index({ subject: 1, isActive: 1 });

module.exports = mongoose.model('Unit', unitSchema);
