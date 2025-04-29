const express = require('express');
const Badge = require('../models/Badge');
const User = require('../models/User');
const router = express.Router();

// Get all badges
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find().sort({ requiredStreak: 1 });
    res.status(200).json(badges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single badge by ID
router.get('/:badgeId', async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.badgeId);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    res.status(200).json(badge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new badge (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, icon, description, requiredStreak, category, color } = req.body;

    const badge = new Badge({
      name,
      icon,
      description,
      requiredStreak,
      category: category || 'beginner',
      color: color || '#4F46E5'
    });

    await badge.save();
    res.status(201).json(badge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a badge (admin only)
router.put('/:badgeId', async (req, res) => {
  try {
    const { name, icon, description, requiredStreak, category, color } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (icon) updates.icon = icon;
    if (description) updates.description = description;
    if (requiredStreak) updates.requiredStreak = requiredStreak;
    if (category) updates.category = category;
    if (color) updates.color = color;

    const badge = await Badge.findByIdAndUpdate(
      req.params.badgeId,
      { $set: updates },
      { new: true }
    );

    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    res.status(200).json(badge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a badge (admin only)
router.delete('/:badgeId', async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.badgeId);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    res.status(200).json({ message: 'Badge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all badges for a specific streak count
router.get('/streak/:count', async (req, res) => {
  try {
    const streakCount = parseInt(req.params.count);
    const badges = await Badge.findEligibleBadges(streakCount);
    res.status(200).json(badges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
