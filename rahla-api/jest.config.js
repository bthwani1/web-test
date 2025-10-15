export default {
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/**/*.test.js',
    '!src/server.js', // Exclude main server file from coverage
    '!src/db.js',     // Exclude db connection from coverage
    '!src/utils/slugify.js', // Exclude simple utility
    '!src/models/*.js', // Exclude models (schema definitions)
    '!src/middleware/audit.js' // Exclude audit middleware for now
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Specific file requirements
    './src/routes/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true
};
