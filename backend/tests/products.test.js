const request = require('supertest');
const app = require('../server');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('Products API', () => {
  let authToken;
  let testCategory;
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rahla-test');
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'editor'
    });
    await testUser.save();

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    authToken = loginResponse.body.tokens.accessToken;

    // Create test category
    testCategory = new Category({
      name: 'Test Category',
      description: 'Test category description',
      slug: 'test-category',
      isActive: true
    });
    await testCategory.save();
  });

  describe('GET /api/products', () => {
    test('should get all products', async () => {
      // Create test products
      const product1 = new Product({
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        category: testCategory._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product1.save();

      const product2 = new Product({
        name: 'Product 2',
        description: 'Description 2',
        price: 200,
        category: testCategory._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product2.save();

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.products).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    test('should filter products by category', async () => {
      // Create products in different categories
      const category2 = new Category({
        name: 'Category 2',
        description: 'Category 2 description',
        slug: 'category-2',
        isActive: true
      });
      await category2.save();

      const product1 = new Product({
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        category: testCategory._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product1.save();

      const product2 = new Product({
        name: 'Product 2',
        description: 'Description 2',
        price: 200,
        category: category2._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product2.save();

      const response = await request(app)
        .get(`/api/products?category=${testCategory._id}`)
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Product 1');
    });

    test('should search products by name', async () => {
      const product1 = new Product({
        name: 'iPhone 15',
        description: 'Latest iPhone',
        price: 1000,
        category: testCategory._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product1.save();

      const product2 = new Product({
        name: 'Samsung Galaxy',
        description: 'Samsung phone',
        price: 800,
        category: testCategory._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product2.save();

      const response = await request(app)
        .get('/api/products?search=iPhone')
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('iPhone 15');
    });
  });

  describe('POST /api/products', () => {
    test('should create a new product with valid data', async () => {
      const productData = {
        name: 'New Product',
        description: 'Product description',
        price: 150,
        category: testCategory._id,
        status: 'published'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.product.name).toBe(productData.name);
      expect(response.body.product.price).toBe(productData.price);
    });

    test('should not create product without authentication', async () => {
      const productData = {
        name: 'New Product',
        description: 'Product description',
        price: 150,
        category: testCategory._id
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should not create product with invalid data', async () => {
      const productData = {
        name: '', // Invalid: empty name
        price: -100, // Invalid: negative price
        category: 'invalid-id' // Invalid: not a valid ObjectId
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    test('should get a single product', async () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        category: testCategory._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product.save();

      const response = await request(app)
        .get(`/api/products/${product._id}`)
        .expect(200);

      expect(response.body.name).toBe('Test Product');
      expect(response.body.price).toBe(100);
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update a product', async () => {
      const product = new Product({
        name: 'Original Product',
        description: 'Original description',
        price: 100,
        category: testCategory._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product.save();

      const updateData = {
        name: 'Updated Product',
        price: 150
      };

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Product updated successfully');
      expect(response.body.product.name).toBe('Updated Product');
      expect(response.body.product.price).toBe(150);
    });

    test('should not update product without authentication', async () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        category: testCategory._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product.save();

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .send({ name: 'Updated Product' })
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete a product', async () => {
      const product = new Product({
        name: 'Product to Delete',
        description: 'This will be deleted',
        price: 100,
        category: testCategory._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product.save();

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Product deleted successfully');

      // Verify product is deleted
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    test('should not delete product without authentication', async () => {
      const product = new Product({
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        category: testCategory._id,
        status: 'published',
        createdBy: testUser._id
      });
      await product.save();

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });
});
