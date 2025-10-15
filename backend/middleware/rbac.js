const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Role-based permissions
const PERMISSIONS = {
  owner: ['*'], // All permissions
  admin: [
    'products.*',
    'categories.*',
    'users.read',
    'users.update',
    'orders.*',
    'analytics.*',
    'settings.read',
    'settings.update'
  ],
  editor: [
    'products.create',
    'products.read',
    'products.update',
    'categories.create',
    'categories.read',
    'categories.update',
    'orders.read'
  ],
  viewer: [
    'products.read',
    'categories.read',
    'orders.read'
  ]
};

// Check if user has specific permission
const hasPermission = (userRole, requiredPermission) => {
  const userPermissions = PERMISSIONS[userRole] || [];
  
  // Owner has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }
  
  // Check exact permission
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check wildcard permissions (e.g., products.* includes products.create)
  const wildcardPermission = requiredPermission.split('.')[0] + '.*';
  return userPermissions.includes(wildcardPermission);
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not found.' });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ message: 'Account is temporarily locked.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Authorization middleware
const authorize = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions.',
        required: permission,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

// Role-based middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Required role: ' + roles.join(' or '),
        userRole: req.user.role
      });
    }
    
    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Audit logging middleware
const auditLog = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      if (req.user && res.statusCode < 400) {
        console.log(`[AUDIT] User ${req.user._id} (${req.user.email}) performed ${action} at ${new Date().toISOString()}`);
        
        // Here you could save to an audit log database
        // await AuditLog.create({
        //   userId: req.user._id,
        //   action,
        //   resource: req.originalUrl,
        //   method: req.method,
        //   ip: req.ip,
        //   userAgent: req.get('User-Agent')
        // });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  requireRole,
  optionalAuth,
  auditLog,
  hasPermission,
  PERMISSIONS
};
