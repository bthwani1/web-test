import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // create/update/delete/login
  collection: { type: String, required: true },
  documentId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip: String,
  userAgent: String,
  before: Object,
  after: Object
}, { timestamps: true });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);


