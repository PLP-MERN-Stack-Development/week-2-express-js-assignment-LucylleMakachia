const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductStats
} = require('./controllers/productController');

// GET /api/products/search - Search products by name (must be before /:id route)
router.get('/search', asyncHandler(searchProducts));

// GET /api/products/stats - Get product statistics
router.get('/stats', asyncHandler(getProductStats));

// GET /api/products - Get all products with filtering, pagination, and search
router.get('/', asyncHandler(getAllProducts));

// GET /api/products/:id - Get a specific product
router.get('/:id', asyncHandler(getProductById));

// POST /api/products - Create a new product (requires authentication)
router.post('/', authenticate, validateProduct, asyncHandler(createProduct));

// PUT /api/products/:id - Update a product (requires authentication)
router.put('/:id', authenticate, validateProduct, asyncHandler(updateProduct));

// DELETE /api/products/:id - Delete a product (requires authentication)
router.delete('/:id', authenticate, asyncHandler(deleteProduct));

module.exports = router;