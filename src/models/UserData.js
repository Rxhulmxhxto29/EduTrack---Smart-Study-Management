const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  key: {
    type: String,
    required: true,
    enum: [
      'progress_data',        // Study progress tracking
      'timetable_data',       // Personal timetable
      'custom_subjects',      // User-added subjects
      'study_streak',         // Study streak data
      'exam_mode_data',       // Exam mode settings
      'favorites',            // Favorite notes
      'preferences',          // UI preferences
      'dashboard_data'        // Dashboard customizations
    ]
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {}
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for user + key (unique per user)
userDataSchema.index({ user: 1, key: 1 }, { unique: true });

// Static method to get user data
userDataSchema.statics.getData = async function(userId, key, defaultValue = null) {
  const record = await this.findOne({ user: userId, key });
  return record ? record.data : defaultValue;
};

// Static method to set user data
userDataSchema.statics.setData = async function(userId, key, data) {
  return this.findOneAndUpdate(
    { user: userId, key },
    { 
      user: userId, 
      key, 
      data, 
      lastUpdated: new Date() 
    },
    { upsert: true, new: true }
  );
};

// Static method to get all user data
userDataSchema.statics.getAllUserData = async function(userId) {
  const records = await this.find({ user: userId });
  const result = {};
  records.forEach(record => {
    result[record.key] = record.data;
  });
  return result;
};

module.exports = mongoose.model('UserData', userDataSchema);
