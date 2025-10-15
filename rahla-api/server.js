import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import { connect } from "./src/db.js";
import authRoutes from "./src/routes/auth.js";
import catRoutes from "./src/routes/categories.js";
import prodRoutes from "./src/routes/products.js";
import mediaRoutes from "./src/routes/media.js";
import { auditMiddleware, securityAudit, errorAudit } from "./src/middleware/audit.js";
import rateLimit from "express-rate-limit";

dotenv.config();

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,
});

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
// Sentry request handler
app.use(Sentry.requestHandler());

app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "https://rahlacdn.b-cdn.net", "data:"],
      connectSrc: ["'self'", "https://web-test-d179.onrender.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
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

// Sentry error handler
app.use(Sentry.errorHandler());

// Global error handling
app.use(errorAudit);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Log to Sentry
  Sentry.captureException(err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 8080;
connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log("🚀 API on", PORT));
}).catch((e) => {
  console.error("DB connection error:", e);
  Sentry.captureException(e);
  process.exit(1);
});