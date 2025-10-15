import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
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
  collection: { type: String, required: true },
  documentId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  statusCode: { type: Number, required: true },
  resource: { type: String, required: true },
  method: { 
    type: String, 
    required: true,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  },
  before: Object,
  after: Object,
  errorMessage: String,
  metadata: Object
}, { 
  timestamps: true 
});

// Indexes for better performance
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ ip: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);


