import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const r = Router();

// One-time initialization: create first owner if no users exist
r.post("/register-initial", async (req,res)=>{
  const count = await User.countDocuments();
  if(count>0) return res.status(403).json({ error: "already initialized" });
  const { name, email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: "email and password required" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role:"owner" });
  res.json({ ok:true, id:user._id });
});

r.post("/login", async (req,res)=>{
  const { email, password } = req.body;
  const u = await User.findOne({ email });
  if(!u) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if(!ok) return res.status(401).json({ error: "invalid credentials" });
  const token = jwt.sign({ id:u._id, role:u.role, email:u.email }, process.env.JWT_SECRET, { expiresIn:"7d" });
  res.json({ token, user:{ id:u._id, name:u.name, email:u.email, role:u.role } });
});

r.get("/me", requireAuth, async (req,res)=>{
  const u = await User.findById(req.user.id).select('-passwordHash');
  if(!u) return res.status(404).json({ error: "user not found" });
  res.json({ user: { id:u._id, name:u.name, email:u.email, role:u.role } });
});

export default r;