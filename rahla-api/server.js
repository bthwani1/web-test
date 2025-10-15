import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import { connect } from "./src/db.js";
import authRoutes from "./src/routes/auth.js";
import catRoutes from "./src/routes/categories.js";
import prodRoutes from "./src/routes/products.js";
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

const limiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use(limiter);

app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/auth", authRoutes);
app.use("/categories", catRoutes);
app.use("/products", prodRoutes);

const PORT = process.env.PORT || 8080;
connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log("🚀 API on", PORT));
}).catch((e) => {
  console.error("DB connection error:", e);
  process.exit(1);
});