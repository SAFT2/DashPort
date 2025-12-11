const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Product = require('../models/Product');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const { productValidation } = require('../middleware/validation.middleware');

const router = express.Router();

// Initialize data
Product.init();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/products
// @desc    Get all products (with filters)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '', 
      status = '',
      minPrice = '',
      maxPrice = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let products = await Product.getAll();

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (category) {
      products = products.filter(product => product.category === category);
    }
    
    if (status) {
      products = products.filter(product => product.status === status);
    }

    if (minPrice) {
      products = products.filter(product => product.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      products = products.filter(product => product.price <= parseFloat(maxPrice));
    }

    // Apply sorting
    products.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Get unique categories for filter options
    const categories = [...new Set(products.map(p => p.category))];

    res.json({
      success: true,
      data: paginatedProducts,
      filters: {
        categories,
        statuses: ['in_stock', 'out_of_stock', 'low_stock']
      },
      pagination: {
        total: products.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(products.length / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await Product.getById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin only)
router.post('/', adminMiddleware, upload.single('image'), productValidation, async (req, res) => {
  try {
    const productData = req.body;
    
    // Handle image upload
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', adminMiddleware, upload.single('image'), productValidation, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const updates = req.body;

    // Handle image upload
    if (req.file) {
      updates.image = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.update(productId, updates);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const deleted = await Product.delete(productId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/categories/stats
// @desc    Get product statistics by category
// @access  Private
router.get('/categories/stats', async (req, res) => {
  try {
    const products = await Product.getAll();
    
    const categoryStats = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          count: 0,
          totalValue: 0,
          totalStock: 0
        };
      }
      
      acc[product.category].count++;
      acc[product.category].totalValue += product.price * product.stock;
      acc[product.category].totalStock += product.stock;
      
      return acc;
    }, {});

    res.json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;