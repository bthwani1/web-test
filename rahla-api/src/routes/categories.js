import { Router } from 'express';
import { z } from 'zod';
import { Category } from '../models/Category.js';
import { AuditLog } from '../models/AuditLog.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next)=>{
  try{
    const items = await Category.find({}).sort({ order: 1, name: 1 });
    res.json({ items });
  }catch(err){ next(err); }
});

router.post('/', authorize('Editor','Admin','Owner'), async (req, res, next)=>{
  try{
    const body = z.object({ name:z.string().min(2), slug:z.string().min(2), parentId:z.string().optional(), order:z.number().optional(), published:z.boolean().optional() }).parse(req.body);
    const item = await Category.create(body);
    await AuditLog.create({ action:'create', collection:'Category', documentId: String(item._id), userId:req.user?.id, ip:req.ip, userAgent:req.headers['user-agent'], before:null, after:item });
    res.status(201).json(item);
  }catch(err){ next(err); }
});

router.patch('/:id', authorize('Editor','Admin','Owner'), async (req, res, next)=>{
  try{
    const id = req.params.id;
    const before = await Category.findById(id);
    const item = await Category.findByIdAndUpdate(id, req.body, { new: true });
    await AuditLog.create({ action:'update', collection:'Category', documentId: String(id), userId:req.user?.id, ip:req.ip, userAgent:req.headers['user-agent'], before, after:item });
    res.json(item);
  }catch(err){ next(err); }
});

router.delete('/:id', authorize('Admin','Owner'), async (req, res, next)=>{
  try{
    const id = req.params.id;
    const before = await Category.findById(id);
    await Category.findByIdAndDelete(id);
    await AuditLog.create({ action:'delete', collection:'Category', documentId: String(id), userId:req.user?.id, ip:req.ip, userAgent:req.headers['user-agent'], before, after:null });
    res.json({ ok:true });
  }catch(err){ next(err); }
});


