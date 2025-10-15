import mongoose from "mongoose";
export async function connect(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
}
