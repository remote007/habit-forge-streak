const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const userRoutes = require('./routes/userRoutes');
const habitRoutes = require('./routes/habitRoutes');
const badgeRoutes = require('./routes/badgeRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-forge')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/badges', badgeRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Habit Forge Streak API is running');
});

// Start server
const PORT = process.env.PORT || 8087;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
