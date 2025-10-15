import { Router } from "express";
import Category from "../models/Category.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const r = Router();

r.get("/", async (_req,res)=>{
  const items = await Category.find().sort({ name:1 });
  res.json({ items });
});

r.post("/", requireAuth, requireRole("owner","admin"), async (req,res)=>{
  const c = await Category.create({ name: req.body.name });
  res.status(201).json(c);
});

r.patch("/:id", requireAuth, requireRole("owner","admin"), async (req,res)=>{
  const c = await Category.findByIdAndUpdate(req.params.id, { name:req.body.name }, { new:true });
  res.json(c);
});

r.delete("/:id", requireAuth, requireRole("owner","admin"), async (req,res)=>{
  await Category.findByIdAndDelete(req.params.id);
  res.json({ deleted:true });
});

export default r;