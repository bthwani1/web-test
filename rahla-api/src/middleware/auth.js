import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export async function authenticate(req, res, next){
  try{
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if(!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).lean();
    if(!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id: String(user._id), roles: user.roles || [] };
    next();
  }catch(err){ next(Object.assign(new Error('Unauthorized'), { status: 401 })); }
}

export function authorize(...allowed){
  return (req, res, next)=>{
    const roles = req.user?.roles || [];
    const ok = roles.some(r=>allowed.includes(r));
    if(!ok) return next(Object.assign(new Error('Forbidden'), { status: 403 }));
    next();
  };
}


