import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["owner","admin","editor","viewer"], default: "owner" }
}, { timestamps: true });
export default mongoose.model("User", UserSchema);