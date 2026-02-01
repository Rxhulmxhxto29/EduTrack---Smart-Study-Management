const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  },
  // Target audience
  branch: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'ALL'],
    uppercase: true
  },
  semester: {
    type: Number,
    required: true,
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8']
  },
  sections: [{
    type: String,
    uppercase: true,
    trim: true
  }],  // Empty array means all sections
  // Assignment files
  attachments: [{
    name: String,
    url: String,
    publicId: String,
    format: String,
    size: Number
  }],
  // Deadlines
  assignedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  // Marks
  maxMarks: {
    type: Number,
    required: true,
    min: [1, 'Max marks must be at least 1']
  },
  // Submissions
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    files: [{
      name: String,
      url: String,
      publicId: String,
      format: String,
      size: Number
    }],
    remarks: String,
    // Grading
    marksObtained: {
      type: Number,
      min: 0
    },
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date,
    status: {
      type: String,
      enum: ['submitted', 'graded', 'pending-revision'],
      default: 'submitted'
    }
  }],
  // Settings
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  lateSubmissionPenalty: {
    type: Number,
    default: 0,  // percentage penalty per day
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Indexes
assignmentSchema.index({ subject: 1, dueDate: 1 });
assignmentSchema.index({ branch: 1, semester: 1 });
assignmentSchema.index({ dueDate: 1, isActive: 1 });
assignmentSchema.index({ 'submissions.student': 1 });
assignmentSchema.index({ createdBy: 1 });

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

// Virtual for submission count
assignmentSchema.virtual('submissionCount').get(function() {
  return this.submissions ? this.submissions.length : 0;
});

// Method to check if student has submitted
assignmentSchema.methods.hasStudentSubmitted = function(studentId) {
  return this.submissions.some(sub => sub.student.toString() === studentId.toString());
};

// Method to get student's submission
assignmentSchema.methods.getStudentSubmission = function(studentId) {
  return this.submissions.find(sub => sub.student.toString() === studentId.toString());
};

module.exports = mongoose.model('Assignment', assignmentSchema);
