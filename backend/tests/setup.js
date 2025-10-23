// Test setup file
const mongoose = require('mongoose');

// Increase timeout for database operations
jest.setTimeout(10000);

// Global test setup
beforeAll(async () => {
  // Connect to test database
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rahla-test';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
