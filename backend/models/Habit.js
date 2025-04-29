const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for habit history (dates and their completion status)
const habitHistorySchema = new Schema({
  // Using Mixed type to store a record of dates and their status
  // Format: { "2023-04-29": "completed", "2023-04-30": "missed", ... }
}, { _id: false, strict: false });

// Main Habit schema
const habitSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetDays: {
    type: [String],
    required: true,
    validate: {
      validator: function(days) {
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'daily'];
        return days.every(day => validDays.includes(day.toLowerCase()));
      },
      message: 'Target days must be valid days of the week or "Daily"'
    }
  },
  startDate: {
    type: String,
    required: true,
    validate: {
      validator: function(date) {
        // Validate date format (YYYY-MM-DD)
        return /^\d{4}-\d{2}-\d{2}$/.test(date);
      },
      message: 'Start date must be in YYYY-MM-DD format'
    }
  },
  history: {
    type: habitHistorySchema,
    default: {}
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  badges: {
    type: [String],
    default: []
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create indexes for better query performance
habitSchema.index({ userId: 1, name: 1 });

// Method to update streak counts
habitSchema.methods.updateStreaks = function() {
  if (!this.history || Object.keys(this.history).length === 0) {
    this.currentStreak = 0;
    this.longestStreak = 0;
    return;
  }

  const dates = Object.keys(this.history).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Convert targetDays to lowercase for consistent comparison
  const targetDaysLower = this.targetDays.map(day => day.toLowerCase());

  // Process dates in chronological order
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const status = this.history[date];
    
    // Get day of week for this date
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Check if this day is a target day
    const isTargetDay = targetDaysLower.includes(dayOfWeek) || targetDaysLower.includes('daily');
    
    if (isTargetDay) {
      if (status === 'completed') {
        tempStreak++;
        // Update longest streak if current temp streak is longer
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (status === 'missed') {
        tempStreak = 0; // Reset streak on missed days
      }
      // Null status doesn't affect streak for past dates
    }
  }

  // Calculate current streak (only counting consecutive completed days up to today)
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Start from today and go backwards
  let currentDate = new Date(today);
  currentStreak = 0;
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const isTargetDay = targetDaysLower.includes(dayOfWeek) || targetDaysLower.includes('daily');
    
    // If it's a target day, check completion
    if (isTargetDay) {
      const status = this.history[dateStr];
      
      if (status === 'completed') {
        currentStreak++;
      } else if (status === 'missed' || (dateStr <= today && !status)) {
        // Break on missed day or if we expected a completion but don't have one
        break;
      }
    }
    
    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1);
    
    // Stop if we're going too far back (arbitrary limit of 365 days)
    if (currentStreak > 365) break;
  }

  // Update the document
  this.currentStreak = currentStreak;
  this.longestStreak = longestStreak;
};

// Virtual property to get completion rate
habitSchema.virtual('completionRate').get(function() {
  if (!this.history || Object.keys(this.history).length === 0) return 0;
  
  const entries = Object.values(this.history);
  const completed = entries.filter(status => status === 'completed').length;
  return (completed / entries.length) * 100;
});

// Create and export the model
const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
