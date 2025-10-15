import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  tokenId: { type: String, required: true },
  userAgent: String,
  ip: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: ['Viewer'] },
  twoFA: {
    enabled: { type: Boolean, default: false },
    secret: { type: String }
  },
  sessions: { type: [sessionSchema], default: [] }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);


