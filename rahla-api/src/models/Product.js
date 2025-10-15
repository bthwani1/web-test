import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  key: String,
  url: String,
  width: Number,
  height: Number,
  mime: String,
  v: String
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
  price: { type: Number, required: true },
  oldPrice: Number,
  tags: { type: [String], index: true },
  desc: String,
  media: mediaSchema,
  status: { type: String, enum: ['Draft','Published','Archived'], default: 'Draft' },
  revisions: [{
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    diff: Object
  }]
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);


