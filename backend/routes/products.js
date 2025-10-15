const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { authenticate, authorize, optionalAuth, auditLog } = require('../middleware/rbac');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isMongoId(),
  query('status').optional().isIn(['draft', 'published', 'archived']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('search').optional().isString(),
  query('sort').optional().isIn(['name', 'price', 'rating', 'createdAt', '-name', '-price', '-rating', '-createdAt'])
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Status filter - only show published to non-authenticated users
    if (req.user) {
      if (req.query.status) {
        query.status = req.query.status;
      }
    } else {
      query.status = 'published';
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Search filter
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sort
    let sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') ? req.query.sort.slice(1) : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
      sort[sortField] = sortOrder;
    } else if (req.query.search) {
      // Default sort for search results
      sort = { score: { $meta: 'textScore' } };
    } else {
      sort = { createdAt: -1 };
    }

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('createdBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user can view this product
    if (product.status === 'draft' && (!req.user || req.user.role === 'viewer')) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment views for published products
    if (product.status === 'published') {
      await product.incrementViews();
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Editor+)
router.post('/', [
  authenticate,
  authorize('products.create'),
  auditLog('CREATE_PRODUCT'),
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('price').isFloat({ min: 0 }),
  body('oldPrice').optional().isFloat({ min: 0 }),
  body('category').isMongoId(),
  body('tags').optional().isArray(),
  body('stock').optional().isInt({ min: 0 }),
  body('sku').optional().isString(),
  body('status').optional().isIn(['draft', 'published', 'archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Generate slug from name
    const slug = req.body.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    const productData = {
      ...req.body,
      slug,
      createdBy: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    await product.populate('category', 'name slug');
    await product.populate('createdBy', 'name');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Editor+)
router.put('/:id', [
  authenticate,
  authorize('products.update'),
  auditLog('UPDATE_PRODUCT'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('oldPrice').optional().isFloat({ min: 0 }),
  body('category').optional().isMongoId(),
  body('tags').optional().isArray(),
  body('stock').optional().isInt({ min: 0 }),
  body('sku').optional().isString(),
  body('status').optional().isIn(['draft', 'published', 'archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if category exists (if being updated)
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // Update slug if name is being changed
    if (req.body.name && req.body.name !== product.name) {
      const newSlug = req.body.name.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if new slug already exists
      const existingProduct = await Product.findOne({ slug: newSlug, _id: { $ne: product._id } });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this name already exists' });
      }

      req.body.slug = newSlug;
    }

    // Update product
    Object.assign(product, req.body);
    product.updatedBy = req.user._id;
    await product.save();

    await product.populate('category', 'name slug');
    await product.populate('createdBy', 'name');
    await product.populate('updatedBy', 'name');

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Editor+)
router.delete('/:id', [
  authenticate,
  authorize('products.delete'),
  auditLog('DELETE_PRODUCT')
], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products/:id/images
// @desc    Add images to product
// @access  Private (Editor+)
router.post('/:id/images', [
  authenticate,
  authorize('products.update'),
  auditLog('ADD_PRODUCT_IMAGES'),
  body('images').isArray({ min: 1 }),
  body('images.*.url').isURL(),
  body('images.*.alt').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add images with order
    req.body.images.forEach((image, index) => {
      product.images.push({
        ...image,
        order: index + product.images.length
      });
    });

    product.updatedBy = req.user._id;
    await product.save();

    res.json({
      message: 'Images added successfully',
      images: product.images
    });
  } catch (error) {
    console.error('Add product images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id/images/:imageId
// @desc    Remove image from product
// @access  Private (Editor+)
router.delete('/:id/images/:imageId', [
  authenticate,
  authorize('products.update'),
  auditLog('REMOVE_PRODUCT_IMAGE')
], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.images = product.images.filter(img => img._id.toString() !== req.params.imageId);
    product.updatedBy = req.user._id;
    await product.save();

    res.json({
      message: 'Image removed successfully',
      images: product.images
    });
  } catch (error) {
    console.error('Remove product image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
