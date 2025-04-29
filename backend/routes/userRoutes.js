const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const authMiddleware = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword
    });
    
    // Save user to database
    const savedUser = await newUser.save();
    
    // Create JWT token
    const payload = {
      id: savedUser._id,
      email: savedUser.email
    };
    
    const token = jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
    
    // Return user data and token
    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email
      }
    });
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const payload = {
      id: user._id,
      email: user.email
    };
    
    const token = jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
    
    // Return user data and token
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user (protected route)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token endpoint
router.get('/verify-token', authMiddleware, (req, res) => {
  // If the middleware passes, the token is valid
  res.status(200).json({ valid: true });
});

// Update user profile (protected route)
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    console.log('Profile update request:', { email, hasCurrentPassword: !!currentPassword, hasNewPassword: !!newPassword });
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If updating password, verify current password
    if (newPassword) {
      console.log('Attempting to update password');
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        console.log('Current password verification failed');
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      console.log('Current password verified, hashing new password');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      console.log('Password updated successfully');
    }
    
    // Update email if provided
    if (email && email !== user.email) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    
    // Save updated user
    await user.save();
    console.log('User profile updated and saved to database');
    
    // Return updated user data
    res.json({
      id: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user profile (protected route)
router.delete('/profile', authMiddleware, async (req, res) => {
  try {
    // Find and delete the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete the user
    await User.findByIdAndDelete(req.user.id);
    
    // Return success message
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user badges
router.get('/:userId/badges', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.badges || []);
  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add badges to user
router.post('/:userId/badges', async (req, res) => {
  try {
    const { userId } = req.params;
    const { badges, habitId } = req.body;
    
    if (!badges || !Array.isArray(badges)) {
      return res.status(400).json({ message: 'Invalid badges data' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize badges array if it doesn't exist
    if (!user.badges) {
      user.badges = [];
    }
    
    // Add new badges that don't already exist
    const unlockedBadges = [];
    for (const badge of badges) {
      if (!user.badges.includes(badge)) {
        user.badges.push(badge);
        unlockedBadges.push(badge);
      }
    }
    
    await user.save();
    
    res.json({ 
      success: true, 
      unlockedBadges,
      message: unlockedBadges.length > 0 ? 'Badges unlocked!' : 'No new badges unlocked'
    });
  } catch (error) {
    console.error('Error adding badges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
