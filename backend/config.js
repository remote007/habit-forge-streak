module.exports = {
  // JWT secret key - in production, this would be an environment variable
  jwtSecret: 'habit-forge-secret-key-2025',
  
  // JWT token expiration (24 hours in seconds)
  jwtExpiration: 86400,
  
  // MongoDB connection string
  mongoURI: 'mongodb+srv://user20:yumcoco124@cluster0.ko1nyuo.mongodb.net/HabitForgeStreak?retryWrites=true&w=majority',
  
  // Server port
  port: 8087
};
