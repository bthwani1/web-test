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
  image: String
}, { timestamps: true });

ProductSchema.pre("save", function(next){
  if(!this.slug) this.slug = slugify(this.name);
  next();
});

ProductSchema.index({ name: "text", desc: "text", tags: "text" });
export default mongoose.model("Product", ProductSchema);