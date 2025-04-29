/**
 * Script to initialize default badges in the database
 * Run this script to ensure badges exist in the database
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Badge = require('../models/Badge');

// Load environment variables
dotenv.config();

// Default badges to create if they don't exist
const defaultBadges = [
  {
    name: "Getting Started",
    icon: "🥉",
    description: "First successful streak!",
    requiredStreak: 3,
    category: "beginner",
    color: "#6EE7B7" // Mint green
  },
  {
    name: "Weekly Warrior",
    icon: "🥈",
    description: "A full week of consistency!",
    requiredStreak: 7,
    category: "beginner",
    color: "#93C5FD" // Light blue
  },
  {
    name: "Fortnight Focus",
    icon: "🥇",
    description: "Two strong weeks!",
    requiredStreak: 14,
    category: "intermediate",
    color: "#FCD34D" // Yellow
  },
  {
    name: "Monthly Master",
    icon: "🏆",
    description: "A habit formed for real!",
    requiredStreak: 30,
    category: "advanced",
    color: "#F472B6" // Pink
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-forge')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to initialize badges
async function initBadges() {
  try {
    console.log('Checking for existing badges...');
    
    // Check each badge and create if it doesn't exist
    for (const badgeData of defaultBadges) {
      const existingBadge = await Badge.findOne({ name: badgeData.name });
      
      if (!existingBadge) {
        console.log(`Creating badge: ${badgeData.name}`);
        const badge = new Badge(badgeData);
        await badge.save();
        console.log(`Badge created: ${badgeData.name}`);
      } else {
        console.log(`Badge already exists: ${badgeData.name}`);
      }
    }
    
    console.log('Badge initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing badges:', error);
    process.exit(1);
  }
}

// Run the initialization
initBadges();
