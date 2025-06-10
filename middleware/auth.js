const { AuthenticationError } = require('./errorHandler');

// Authentication middleware that checks for API key
const authenticate = (req, res, next) => {
  const apiKey = req.get('X-API-Key') || req.get('Authorization');
  
  // Check for API key in headers (as per assignment requirements)
  if (!apiKey) {
    throw new AuthenticationError('Missing API key. Please provide X-API-Key header or Authorization header.');
  }
  
  // For this demo, we'll accept any non-empty API key
  // In a real app, you'd validate against a database
  if (apiKey.trim().length === 0) {
    throw new AuthenticationError('Invalid API key provided.');
  }
  
  // Add user info to request (in real app, decode from API key)
  req.user = { id: 'user123', name: 'Demo User', apiKey };
  next();
};

module.exports = {
  authenticate
};