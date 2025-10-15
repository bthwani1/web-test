import { Router } from "express";
import Product from "../models/Product.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const r = Router();

// list + filters
r.get("/", async (req,res)=>{
  const { q, category, tag, min, max, sort="createdAt:desc", limit=50, offset=0 } = req.query;
  const find = {};
  if(category) find.category = category;
  if(tag) find.tags = tag;
  if(min) find.price = { ...(find.price||{}), $gte: Number(min) };
  if(max) find.price = { ...(find.price||{}), $lte: Number(max) };

  let query = Product.find(find);

  if(q){
    query = query.find({ $text: { $search: q } }, { score: { $meta: "textScore" } })
                 .sort({ score: { $meta: "textScore" } });
  } else {
    const [k,dir] = String(sort).split(":");
    query = query.sort({ [k]: dir==="asc"?1:-1 });
  }

  const total = await Product.countDocuments(find);
  const items = await query.skip(Number(offset)).limit(Number(limit));
  res.json({ total, items });
});

r.get("/:slugOrId", async (req,res)=>{
  const { slugOrId } = req.params;
  const bySlug = await Product.findOne({ slug: slugOrId });
  res.json(bySlug || await Product.findById(slugOrId));
});

r.post("/", requireAuth, requireRole("owner","admin","editor"), async (req,res)=>{
  const p = await Product.create(req.body);
  res.status(201).json(p);
});

r.patch("/:id", requireAuth, requireRole("owner","admin","editor"), async (req,res)=>{
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new:true });
  res.json(p);
});

r.delete("/:id", requireAuth, requireRole("owner","admin"), async (req,res)=>{
  await Product.findByIdAndDelete(req.params.id);
  res.json({ deleted:true });
});

r.get("/export", async (req,res)=>{
  const { format = 'json' } = req.query;
  const items = await Product.find({}).lean();
  if (format === 'csv'){
    const fields = ['_id','name','slug','price','oldPrice','category','tags','desc'];
    const csvHeader = fields.join(',');
    const rows = items.map(i=> fields.map(f=>{
      const v = Array.isArray(i[f]) ? i[f].join('|') : (i[f] ?? '');
      return String(v).replaceAll('"','""');
    }).map(x=>`"${x}"`).join(','));
    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Content-Disposition','attachment; filename="products.csv"');
    return res.send([csvHeader, ...rows].join('\n'));
  }
  res.json(items);
});

r.post("/import", requireAuth, requireRole("owner","admin","editor"), async (req,res)=>{
  const payload = Array.isArray(req.body) ? req.body : (req.body.items || []);
  if (!Array.isArray(payload)) return res.status(400).json({ error: 'invalid payload' });
  const created = [];
  for (const p of payload){
    const item = await Product.create(p);
    created.push(item._id);
  }
  res.json({ created: created.length });
});

export default r;