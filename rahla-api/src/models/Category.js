import mongoose from "mongoose";
import slugify from "../utils/slugify.js";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "" }, // FontAwesome icon class
  color: { type: String, default: "#0ea5e9" }, // Hex color for UI
  image: { type: String, default: "" }, // Category banner image
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // For subcategories
  metaTitle: { type: String, default: "" },
  metaDescription: { type: String, default: "" },
  productCount: { type: Number, default: 0 } // Cached count
}, { timestamps: true });

CategorySchema.pre("save", function(next){
  if(!this.slug) this.slug = slugify(this.name);
  next();
});

// Virtual for subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Method to update product count
CategorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  this.productCount = await Product.countDocuments({ category: this.name });
  await this.save();
};

export default mongoose.model("Category", CategorySchema);