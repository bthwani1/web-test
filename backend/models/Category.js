const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
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
    maxlength: 500
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: {
    url: String,
    alt: String
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true,
    match: /^#[0-9A-F]{6}$/i
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  productCount: {
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
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, order: 1 });
categorySchema.index({ isActive: 1 });

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products in this category
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Pre-save middleware
categorySchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Post-save middleware to update product count
categorySchema.post('save', async function() {
  if (this.isModified('isActive')) {
    const Product = mongoose.model('Product');
    const count = await Product.countDocuments({ 
      category: this._id, 
      status: 'published' 
    });
    this.productCount = count;
    await this.save();
  }
});

// Static methods
categorySchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ order: 1 });
};

categorySchema.statics.findRootCategories = function() {
  return this.find({ parent: null, isActive: true }).sort({ order: 1 });
};

categorySchema.statics.findWithChildren = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parent',
        as: 'children'
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        pipeline: [
          { $match: { status: 'published' } },
          { $count: 'count' }
        ],
        as: 'productCount'
      }
    },
    {
      $addFields: {
        productCount: { $arrayElemAt: ['$productCount.count', 0] }
      }
    },
    {
      $sort: { order: 1 }
    }
  ]);
};

// Instance methods
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    category: this._id, 
    status: 'published' 
  });
  this.productCount = count;
  return this.save();
};

categorySchema.methods.getBreadcrumb = async function() {
  const breadcrumb = [];
  let current = this;
  
  while (current) {
    breadcrumb.unshift({
      _id: current._id,
      name: current.name,
      slug: current.slug
    });
    
    if (current.parent) {
      current = await mongoose.model('Category').findById(current.parent);
    } else {
      current = null;
    }
  }
  
  return breadcrumb;
};

module.exports = mongoose.model('Category', categorySchema);
