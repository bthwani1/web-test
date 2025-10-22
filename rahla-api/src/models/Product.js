import mongoose from "mongoose";
import slugify from "../utils/slugify.js";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  rating: { type: Number, default: 4 },
  category: { type: String, index: true },     // category name (flat for simplicity)
  tags: [String],
  desc: String,
  image: String,
  // Enhanced fields
  shortDescription: { type: String, default: "" },
  fullDescription: { type: String, default: "" },
  images: [{ type: String }], // Multiple images
  sku: { type: String, unique: true, sparse: true }, // Stock Keeping Unit
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  weight: { type: Number, default: 0 }, // in grams
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  views: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  // SEO fields
  metaTitle: { type: String, default: "" },
  metaDescription: { type: String, default: "" },
  // Additional product attributes
  brand: { type: String, default: "" },
  material: { type: String, default: "" },
  color: { type: String, default: "" },
  size: { type: String, default: "" },
  // Pricing
  costPrice: { type: Number, default: 0 }, // Cost to business
  margin: { type: Number, default: 0 }, // Profit margin percentage
  // Status
  status: { 
    type: String, 
    enum: ['draft', 'active', 'inactive', 'discontinued'], 
    default: 'draft' 
  }
}, { timestamps: true });

ProductSchema.pre("save", function(next){
  if(!this.slug) this.slug = slugify(this.name);
  // Auto-generate SKU if not provided
  if(!this.sku) {
    this.sku = `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

ProductSchema.index({ name: "text", desc: "text", tags: "text", shortDescription: "text" });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.oldPrice && this.oldPrice > this.price) {
    return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  }
  return 0;
});

// Method to increment views
ProductSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment sales
ProductSchema.methods.incrementSales = function(quantity = 1) {
  this.sales += quantity;
  return this.save();
};

export default mongoose.model("Product", ProductSchema);