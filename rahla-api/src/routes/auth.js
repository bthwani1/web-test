import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import crypto from 'crypto';

export const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const ACCESS_TTL = '15m';
const REFRESH_TTL = '30d';

function signAccess(user){
  return jwt.sign({ sub: user._id, roles: user.roles }, JWT_SECRET, { expiresIn: ACCESS_TTL });
}
function signRefresh(user, tokenId){
  return jwt.sign({ sub: user._id, tid: tokenId }, JWT_SECRET, { expiresIn: REFRESH_TTL });
}

router.post('/register', async (req, res, next)=>{
  try{
    const body = z.object({ email: z.string().email(), password: z.string().min(8) }).parse(req.body);
    const exists = await User.findOne({ email: body.email });
    if (exists) return res.status(409).json({ error: 'Email exists' });
    const hash = await bcrypt.hash(body.password, 12);
    const user = await User.create({ email: body.email, passwordHash: hash, roles: ['Owner'] });
    return res.json({ ok: true, id: user._id });
  }catch(err){ next(err); }
});

router.post('/login', async (req, res, next)=>{
  try{
    const body = z.object({ email: z.string().email(), password: z.string().min(8) }).parse(req.body);
    const user = await User.findOne({ email: body.email });
    if(!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const tokenId = crypto.randomUUID();
    user.sessions.push({ tokenId, userAgent: req.headers['user-agent'], ip: req.ip });
    await user.save();
    res.json({ token: signAccess(user), refresh: signRefresh(user, tokenId) });
  }catch(err){ next(err); }
});

// One-time initial owner registration
router.post('/register-initial', async (req, res, next)=>{
  try{
    const exists = await User.findOne({});
    if (exists) return res.status(409).json({ error: 'Already initialized' });
    const body = z.object({ email: z.string().email(), password: z.string().min(8) }).parse(req.body);
    const hash = await bcrypt.hash(body.password, 12);
    const user = await User.create({ email: body.email, passwordHash: hash, roles: ['Owner','Admin'] });
    res.status(201).json({ ok:true, id: user._id });
  }catch(err){ next(err); }
});

router.post('/refresh', async (req, res, next)=>{
  try{
    const body = z.object({ refresh: z.string().min(10) }).parse(req.body);
    const payload = jwt.verify(body.refresh, JWT_SECRET);
    const user = await User.findById(payload.sub);
    if(!user) return res.status(401).json({ error: 'Invalid token' });
    const has = user.sessions.some(s=>s.tokenId===payload.tid);
    if(!has) return res.status(401).json({ error: 'Revoked' });
    res.json({ access: signAccess(user) });
  }catch(err){ next(err); }
});

router.post('/logout', async (req, res, next)=>{
  try{
    const body = z.object({ refresh: z.string().min(10) }).parse(req.body);
    const payload = jwt.verify(body.refresh, JWT_SECRET);
    await User.updateOne({ _id: payload.sub }, { $pull: { sessions: { tokenId: payload.tid } } });
    res.json({ ok: true });
  }catch(err){ next(err); }
});


