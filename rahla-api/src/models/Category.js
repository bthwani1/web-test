import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);


