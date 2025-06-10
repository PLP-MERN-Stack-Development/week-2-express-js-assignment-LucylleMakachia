const { v4: uuidv4 } = require('uuid');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/products - Get all products with filtering, pagination, and search
const getAllProducts = (req, res) => {
  let filteredProducts = [...products];
  
  // Search functionality
  const { search } = req.query;
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filtering by category
  const { category } = req.query;
  if (category) {
    filteredProducts = filteredProducts.filter(product =>
      product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Filtering by inStock status
  const { inStock } = req.query;
  if (inStock !== undefined) {
    const stockFilter = inStock.toLowerCase() === 'true';
    filteredProducts = filteredProducts.filter(product =>
      product.inStock === stockFilter
    );
  }
  
  // Price range filtering
  const { minPrice, maxPrice } = req.query;
  if (minPrice !== undefined) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) {
      filteredProducts = filteredProducts.filter(product => product.price >= min);
    }
  }
  if (maxPrice !== undefined) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      filteredProducts = filteredProducts.filter(product => product.price <= max);
    }
  }
  
  // Sorting
  const { sortBy, sortOrder } = req.query;
  if (sortBy && ['name', 'price', 'category', 'createdAt'].includes(sortBy)) {
    filteredProducts.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'desc') {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
  }
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filteredProducts.length / limit),
      totalProducts: filteredProducts.length,
      hasNextPage: endIndex < filteredProducts.length,
      hasPrevPage: page > 1
    },
    filters: {
      search: search || null,
      category: category || null,
      inStock: inStock !== undefined ? (inStock.toLowerCase() === 'true') : null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      sortBy: sortBy || null,
      sortOrder: sortOrder || 'asc'
    }
  });
};

// GET /api/products/:id - Get a specific product
const getProductById = (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  
  if (!product) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  res.json({
    product,
    message: 'Product retrieved successfully'
  });
};

// POST /api/products - Create a new product
const createProduct = (req, res) => {
  const { name, description, price, category, inStock = true } = req.body;
  
  // Check if product with same name already exists
  const existingProduct = products.find(p => 
    p.name.toLowerCase() === name.toLowerCase()
  );
  
  if (existingProduct) {
    throw new ConflictError('A product with this name already exists');
  }
  
  const newProduct = {
    id: uuidv4(),
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price),
    category: category.trim().toLowerCase(),
    inStock: Boolean(inStock),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    product: newProduct,
    message: 'Product created successfully'
  });
};

// PUT /api/products/:id - Update a product
const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, inStock } = req.body;
  
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  // Check if another product with same name exists (excluding current product)
  const existingProduct = products.find(p => 
    p.id !== id && p.name.toLowerCase() === name.toLowerCase()
  );
  
  if (existingProduct) {
    throw new ConflictError('Another product with this name already exists');
  }
  
  // Update the product
  const updatedProduct = {
    ...products[productIndex],
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price),
    category: category.trim().toLowerCase(),
    inStock: inStock !== undefined ? Boolean(inStock) : products[productIndex].inStock,
    updatedAt: new Date().toISOString()
  };
  
  products[productIndex] = updatedProduct;
  
  res.json({
    product: updatedProduct,
    message: 'Product updated successfully'
  });
};

// DELETE /api/products/:id - Delete a product
const deleteProduct = (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  const deletedProduct = products[productIndex];
  products.splice(productIndex, 1);
  
  res.json({
    product: deletedProduct,
    message: 'Product deleted successfully'
  });
};

// GET /api/products/search - Search products by name
const searchProducts = (req, res) => {
  const { q, name } = req.query;
  const searchTerm = (q || name || '').toLowerCase();
  
  if (!searchTerm) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Search query is required. Use ?q=searchterm or ?name=searchterm'
    });
  }
  
  const searchResults = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm)
  );
  
  res.json({
    query: searchTerm,
    results: searchResults,
    count: searchResults.length,
    message: `Found ${searchResults.length} product(s) matching "${searchTerm}"`
  });
};

// GET /api/products/stats - Get product statistics
const getProductStats = (req, res) => {
  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.inStock).length;
  const outOfStockCount = totalProducts - inStockCount;
  
  // Count by category
  const categoryStats = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = { total: 0, inStock: 0, outOfStock: 0 };
    }
    acc[category].total++;
    if (product.inStock) {
      acc[category].inStock++;
    } else {
      acc[category].outOfStock++;
    }
    return acc;
  }, {});
  
  // Price statistics
  const prices = products.map(p => p.price);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  
  res.json({
    overview: {
      totalProducts,
      inStockCount,
      outOfStockCount,
      categories: Object.keys(categoryStats).length
    },
    categoryBreakdown: categoryStats,
    priceStats: {
      average: Math.round(avgPrice * 100) / 100,
      minimum: minPrice,
      maximum: maxPrice
    },
    generatedAt: new Date().toISOString()
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductStats
};