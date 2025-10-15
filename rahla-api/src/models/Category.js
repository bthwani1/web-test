import mongoose from "mongoose";
import slugify from "../utils/slugify.js";
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true }
}, { timestamps: true });
CategorySchema.pre("save", function(next){
  if(!this.slug) this.slug = slugify(this.name);
  next();
});
export default mongoose.model("Category", CategorySchema);