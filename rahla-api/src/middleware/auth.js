import jwt from "jsonwebtoken";

export function requireAuth(req,res,next){
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if(!token) return res.status(401).json({ error: "unauthorized" });
  try{
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  }catch{
    res.status(401).json({ error: "invalid token" });
  }
}

export function requireRole(...roles){
  return (req,res,next)=>{
    if(!req.user) return res.status(401).json({ error: "unauthorized" });
    if(!roles.includes(req.user.role)) return res.status(403).json({ error: "forbidden" });
    next();
  };
}