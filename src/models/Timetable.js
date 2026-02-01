const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Can be personal or shared (for class)
  type: {
    type: String,
    enum: ['personal', 'shared'],
    default: 'personal'
  },
  // For shared timetables
  branch: String,
  semester: Number,
  section: String,
  // Day of week
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    lowercase: true
  },
  // Time slot
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
  },
  // Class details
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'break', 'other', 'personal', 'shared'],
    default: 'lecture'
  },
  room: {
    type: String,
    trim: true
  },
  teacher: {
    type: String,
    trim: true
  },
  // Additional info
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Online class link
  onlineLink: {
    type: String,
    trim: true
  },
  // Recurrence (if needed)
  isRecurring: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  // Status
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

// Indexes
timetableSchema.index({ user: 1, dayOfWeek: 1 });
timetableSchema.index({ branch: 1, semester: 1, section: 1, dayOfWeek: 1 });
timetableSchema.index({ subject: 1 });
timetableSchema.index({ isActive: 1 });

// Validation: end time should be after start time
timetableSchema.pre('save', function(next) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    next(new Error('End time must be after start time'));
  }
  
  next();
});

module.exports = mongoose.model('Timetable', timetableSchema);
