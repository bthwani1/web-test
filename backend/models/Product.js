const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 200
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  oldPrice: {
    type: Number,
    min: 0
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true
  },
  images: [{
    url: String,
    alt: String,
    order: Number
  }],
  tags: [{
    type: String,
    trim: true
  }],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  stock: { 
    type: Number, 
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.oldPrice && this.oldPrice > this.price) {
    return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  }
  return 0;
});

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  if (this.images && this.images.length > 0) {
    const sortedImages = this.images.sort((a, b) => (a.order || 0) - (b.order || 0));
    return sortedImages[0].url;
  }
  return null;
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Generate SKU if not provided
  if (!this.sku && this.name) {
    this.sku = this.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }
  
  next();
});

// Static methods
productSchema.statics.findPublished = function() {
  return this.find({ status: 'published' }).populate('category');
};

productSchema.statics.findByCategory = function(categoryId) {
  return this.find({ category: categoryId, status: 'published' });
};

productSchema.statics.searchProducts = function(query, options = {}) {
  const searchQuery = {
    status: 'published',
    $text: { $search: query }
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Instance methods
productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

productSchema.methods.updateSales = function(quantity) {
  this.sales += quantity;
  if (this.stock > 0) {
    this.stock = Math.max(0, this.stock - quantity);
  }
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
