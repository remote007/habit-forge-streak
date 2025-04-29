const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Badge schema
const badgeSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requiredStreak: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'master'],
    default: 'beginner'
  },
  color: {
    type: String,
    default: '#4F46E5' // Default indigo color
  }
}, {
  timestamps: true
});

// Index for faster lookups
badgeSchema.index({ requiredStreak: 1 });

// Static method to find badges that a user qualifies for based on streak
badgeSchema.statics.findEligibleBadges = function(streakCount) {
  return this.find({ requiredStreak: { $lte: streakCount } }).sort({ requiredStreak: -1 });
};

// Create and export the model
const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
