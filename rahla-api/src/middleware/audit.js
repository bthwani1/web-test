import mongoose from "mongoose";

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for public actions
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'REGISTER',
      'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
      'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
      'UPLOAD_MEDIA', 'DELETE_MEDIA',
      'UPDATE_SETTINGS', 'CHANGE_PASSWORD',
      'API_ERROR', 'SECURITY_VIOLATION'
    ]
  },
  resource: {
    type: String,
    required: true // e.g., '/products', '/categories', '/auth/login'
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  },
  statusCode: {
    type: Number,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  errorMessage: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ ip: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// Audit middleware
export const auditMiddleware = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    let responseBody = null;
    let statusCode = res.statusCode;
    
    // Capture response
    res.send = function(body) {
      responseBody = body;
      originalSend.call(this, body);
    };
    
    res.json = function(body) {
      responseBody = body;
      originalJson.call(this, body);
    };
    
    // Log after response is sent
    res.on('finish', async () => {
      try {
        const auditData = {
          userId: req.user?._id || req.user?.id,
          action,
          resource: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          requestBody: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
          responseData: sanitizeResponseBody(responseBody),
          errorMessage: statusCode >= 400 ? getErrorMessage(responseBody) : undefined,
          metadata: {
            referer: req.get('Referer'),
            origin: req.get('Origin'),
            contentLength: req.get('Content-Length'),
            responseTime: Date.now() - req.startTime
          }
        };
        
        await AuditLog.create(auditData);
      } catch (error) {
        console.error('Audit logging error:', error);
        // Don't fail the request if audit logging fails
      }
    });
    
    req.startTime = Date.now();
    next();
  };
};

// Security audit for suspicious activities
export const securityAudit = (req, res, next) => {
  const suspiciousPatterns = [
    /script/i,
    /javascript:/i,
    /<script/i,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /\.\.\//,
    /\.\.\\/
  ];
  
  const requestString = JSON.stringify(req.body) + req.originalUrl + JSON.stringify(req.query);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      // Log security violation
      AuditLog.create({
        userId: req.user?._id,
        action: 'SECURITY_VIOLATION',
        resource: req.originalUrl,
        method: req.method,
        statusCode: 403,
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        requestBody: req.body,
        metadata: {
          suspiciousPattern: pattern.source,
          blocked: true
        }
      }).catch(console.error);
      
      return res.status(403).json({ 
        message: 'Suspicious activity detected',
        code: 'SECURITY_VIOLATION'
      });
    }
  }
  
  next();
};

// Error audit middleware
export const errorAudit = (err, req, res, next) => {
  AuditLog.create({
    userId: req.user?._id,
    action: 'API_ERROR',
    resource: req.originalUrl,
    method: req.method,
    statusCode: err.status || 500,
    ip: req.ip || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    requestBody: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
    errorMessage: err.message,
    metadata: {
      stack: err.stack,
      name: err.name
    }
  }).catch(console.error);
  
  next(err);
};

// Helper functions
function sanitizeRequestBody(body) {
  if (!body) return undefined;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'key'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

function sanitizeResponseBody(body) {
  if (!body) return undefined;
  
  // Only log basic response info, not full data
  if (typeof body === 'object') {
    return {
      success: body.success !== undefined ? body.success : true,
      message: body.message,
      total: body.total,
      count: body.count
    };
  }
  
  return typeof body === 'string' ? body.substring(0, 100) : body;
}

function getErrorMessage(body) {
  if (typeof body === 'object' && body.message) {
    return body.message;
  }
  if (typeof body === 'string') {
    return body.substring(0, 200);
  }
  return 'Unknown error';
}

// Query helpers
export const getAuditLogs = async (filters = {}) => {
  const query = {};
  
  if (filters.userId) query.userId = filters.userId;
  if (filters.action) query.action = filters.action;
  if (filters.dateFrom) query.createdAt = { $gte: new Date(filters.dateFrom) };
  if (filters.dateTo) {
    query.createdAt = { 
      ...query.createdAt, 
      $lte: new Date(filters.dateTo) 
    };
  }
  if (filters.ip) query.ip = filters.ip;
  
  return AuditLog.find(query)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100);
};

export const getSecurityViolations = async (days = 7) => {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);
  
  return AuditLog.find({
    action: 'SECURITY_VIOLATION',
    createdAt: { $gte: dateFrom }
  }).sort({ createdAt: -1 });
};

export const getUserActivity = async (userId, days = 30) => {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);
  
  return AuditLog.find({
    userId,
    createdAt: { $gte: dateFrom }
  }).sort({ createdAt: -1 });
};

export { AuditLog };
