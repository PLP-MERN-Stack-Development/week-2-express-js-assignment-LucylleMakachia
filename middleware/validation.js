const { ValidationError } = require('./errorHandler');

// Validation middleware for product data
const validateProduct = (req, res, next) => {
  const { name, description, price, category } = req.body;
  const errors = [];
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  }
  
  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }
  
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Invalid product data', errors);
  }
  
  next();
};

module.exports = {
  validateProduct
};