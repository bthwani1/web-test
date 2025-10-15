import dotenv from "dotenv"; dotenv.config();
import { connect } from "./src/db.js";
import User from "./src/models/User.js";
import bcrypt from "bcryptjs";

const { ADMIN_NAME="Owner", ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if(!ADMIN_EMAIL || !ADMIN_PASSWORD){
  console.error("Set ADMIN_EMAIL & ADMIN_PASSWORD in .env");
  process.exit(1);
}

await connect(process.env.MONGODB_URI);
const exists = await User.findOne({ email: ADMIN_EMAIL });
if(exists){ console.log("Admin exists:", ADMIN_EMAIL); process.exit(0); }
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, passwordHash, role:"owner" });
console.log("✅ Admin created:", ADMIN_EMAIL);
process.exit(0);
