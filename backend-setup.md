# Backend Setup Guide

## 1. إنشاء المشروع
```bash
mkdir rahla-api && cd rahla-api
npm init -y
npm i express mongoose dotenv cors morgan jsonwebtoken bcryptjs helmet express-rate-limit
npm i -D nodemon jest supertest
```

## 2. هيكل المشروع
```
src/
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   └── categoryController.js
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Category.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   └── categories.js
├── middleware/
│   ├── auth.js
│   ├── rbac.js
│   └── validation.js
├── services/
│   ├── authService.js
│   └── mediaService.js
└── utils/
    ├── jwt.js
    └── logger.js
```

## 3. ملفات أساسية

### server.js
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://bthwani1.github.io',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### .env
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rahla-store
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
CORS_ORIGIN=https://bthwani1.github.io
BUNNY_CDN_API_KEY=your-bunny-api-key
BUNNY_CDN_ZONE_ID=your-zone-id
```

## 4. النماذج الأساسية

### User Model
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'editor', 'viewer'], default: 'viewer' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);
```

### Product Model
```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  oldPrice: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [{ type: String }],
  tags: [String],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
```

## 5. نظام الصلاحيات

### RBAC Middleware
```javascript
const ROLES = {
  owner: ['*'],
  admin: ['products.*', 'categories.*', 'users.read'],
  editor: ['products.create', 'products.update', 'categories.*'],
  viewer: ['products.read', 'categories.read']
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = ROLES[userRole] || [];
    
    if (permissions.includes('*') || permissions.includes(requiredPermission)) {
      next();
    } else {
      res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
};

module.exports = { checkPermission };
```
