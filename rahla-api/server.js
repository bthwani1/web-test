import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { router as authRouter } from './src/routes/auth.js';
import { router as productsRouter } from './src/routes/products.js';
import { router as categoriesRouter } from './src/routes/categories.js';

const app = express();
const PORT = process.env.PORT || 8080;
const ORIGIN = process.env.CORS_ORIGIN || '*';

// DB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rahla';
mongoose.connect(MONGODB_URI).then(()=>{
  console.log('Mongo connected');
}).catch(err=>{
  console.error('Mongo error', err);
  process.exit(1);
});

// Middlewares
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/health', (req, res)=> res.json({ ok:true }));

// Routes
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next)=>{
  const code = err.status || 500;
  res.status(code).json({ error: err.message || 'Server error' });
});

app.listen(PORT, ()=>{
  console.log(`API listening on :${PORT}`);
});


