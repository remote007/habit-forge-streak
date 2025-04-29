const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware to authenticate JWT tokens
const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  // Check if no auth header
  if (!authHeader) {
    console.log('No authorization header found');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  // Check if Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    console.log('Invalid token format (not Bearer)');
    return res.status(401).json({ message: 'Invalid token format' });
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Add user from payload to request
    req.user = decoded;
    
    // Log successful authentication
    console.log('User authenticated:', req.user.id);
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
