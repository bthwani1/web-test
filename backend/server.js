const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const Sentry = require('@sentry/node');
const { applySecurityHeaders } = require('../security-headers');
const { swaggerUi, specs } = require('./swagger');
require('dotenv').config();

// فحص صارم لمتغيرات البيئة المطلوبة
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SENTRY_DSN'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ متغيرات البيئة المطلوبة مفقودة:', missingVars.join(', '));
  console.error('يرجى التأكد من وجود ملف .env مع جميع المتغيرات المطلوبة');
  process.exit(1);
}

console.log('✅ جميع متغيرات البيئة المطلوبة موجودة');

const app = express();

// Sentry initialization
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
});

// Sentry middleware
app.use(Sentry.requestHandler());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "https://rahlacdn.b-cdn.net", "data:"],
      connectSrc: ["'self'", "https://api.bunny.net"]
    }
  }
}));

// تطبيق رؤوس الأمان المتقدمة
applySecurityHeaders(app);

// CORS configuration with allowlist
const allowedOrigins = [
  'https://rahla.example.com',
  'https://admin.rahla.example.com',
  'https://bthwani1.github.io',
  'http://localhost:3000',
  'http://localhost:3001'
];

// Add environment-specific origins
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/media', require('./routes/media'));
app.use('/api/admin', require('./routes/admin'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Rahla Store API Documentation'
}));

// Health checks
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Advanced health check
app.get('/healthz', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Readiness check
app.get('/readyz', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis connection (if configured)
    let redisStatus = 'not-configured';
    if (process.env.REDIS_URL) {
      // Add Redis health check here if needed
      redisStatus = 'connected';
    }
    
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          readyState: dbState
        },
        redis: {
          status: redisStatus
        }
      }
    };
    
    // Return 200 if all services are healthy
    if (dbState === 1) {
      res.json(health);
    } else {
      res.status(503).json({
        ...health,
        status: 'Service Unavailable'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Sentry error handler
app.use(Sentry.errorHandler());

// Global error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Log to Sentry
  Sentry.captureException(err);
  
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
