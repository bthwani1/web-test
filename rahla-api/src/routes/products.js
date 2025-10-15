import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { AuditLog } from '../models/AuditLog.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const router = Router();

// simple RBAC middleware placeholder
// Secure all below
router.use(authenticate);

router.get('/', async (req, res, next)=>{
  try{
    const { q, limit=50, skip=0 } = req.query;
    const filter = q ? { name: new RegExp(q, 'i') } : {};
    const items = await Product.find(filter).limit(Number(limit)).skip(Number(skip)).sort({ updatedAt: -1 });
    res.json({ items });
  }catch(err){ next(err); }
});

router.post('/', authorize('Editor','Admin','Owner'), async (req, res, next)=>{
  try{
    const body = z.object({ name:z.string().min(2), slug:z.string().min(2), categoryId:z.string().optional(), price:z.number(), oldPrice:z.number().optional(), tags:z.array(z.string()).optional(), desc:z.string().optional(), media:z.any().optional() }).parse(req.body);
    const before = null;
    const item = await Product.create(body);
    await AuditLog.create({ action:'create', collection:'Product', documentId: String(item._id), userId:req.user?.id, ip:req.ip, userAgent:req.headers['user-agent'], before, after:item });
    res.status(201).json(item);
  }catch(err){ next(err); }
});

router.patch('/:id', authorize('Editor','Admin','Owner'), async (req, res, next)=>{
  try{
    const id = req.params.id;
    const before = await Product.findById(id);
    const item = await Product.findByIdAndUpdate(id, req.body, { new: true });
    await AuditLog.create({ action:'update', collection:'Product', documentId: String(id), userId:req.user?.id, ip:req.ip, userAgent:req.headers['user-agent'], before, after:item });
    res.json(item);
  }catch(err){ next(err); }
});

router.delete('/:id', authorize('Admin','Owner'), async (req, res, next)=>{
  try{
    const id = req.params.id;
    const before = await Product.findById(id);
    await Product.findByIdAndDelete(id);
    await AuditLog.create({ action:'delete', collection:'Product', documentId: String(id), userId:req.user?.id, ip:req.ip, userAgent:req.headers['user-agent'], before, after:null });
    res.json({ ok:true });
  }catch(err){ next(err); }
});


