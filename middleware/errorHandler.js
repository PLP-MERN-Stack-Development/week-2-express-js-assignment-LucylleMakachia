// Custom Error Classes (Task 4 requirement)
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.details = details;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

// Async error wrapper function (Task 4 requirement)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Handle 404 for undefined routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/products',
      'GET /api/products/:id',
      'GET /api/products/search',
      'GET /api/products/stats',
      'POST /api/products',
      'PUT /api/products/:id',
      'DELETE /api/products/:id'
    ]
  });
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON format in request body'
    });
  }
  
  // Handle custom errors
  if (err.status) {
    const response = {
      error: err.name || 'Error',
      message: err.message
    };
    
    // Add details for validation errors
    if (err.details && err.details.length > 0) {
      response.details = err.details;
    }
    
    return res.status(err.status).json(response);
  }
  
  // Handle other errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  NotFoundError,
  ValidationError,
  ConflictError,
  AuthenticationError,
  asyncHandler,
  errorHandler,
  notFoundHandler
};