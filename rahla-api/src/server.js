import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import { connect } from "./db.js";
import authRoutes from "./routes/auth.js";
import catRoutes from "./routes/categories.js";
import prodRoutes from "./routes/products.js";
import mediaRoutes from "./routes/media.js";
import { auditMiddleware, securityAudit, errorAudit } from "./middleware/audit.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || "*").split(",").map(s => s.trim());
app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true);
    if (corsOrigins.includes("*") || corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked"), false);
  },
  credentials: false
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Security audit middleware
app.use(securityAudit);

const limiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use(limiter);

app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/auth", auditMiddleware('AUTH_ACCESS'), authRoutes);
app.use("/categories", auditMiddleware('CATEGORY_ACCESS'), catRoutes);
app.use("/products", auditMiddleware('PRODUCT_ACCESS'), prodRoutes);
app.use("/media", auditMiddleware('MEDIA_ACCESS'), mediaRoutes);

// Global error handling
app.use(errorAudit);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
