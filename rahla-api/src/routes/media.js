import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import crypto from "crypto";

const router = Router();

// Bunny CDN configuration
const BUNNY_STORAGE_KEY = process.env.BUNNY_STORAGE_FTP_PASSWORD;
const BUNNY_STORAGE_HOST = process.env.BUNNY_STORAGE_FTP_HOST || "sg.storage.bunnycdn.com";
const BUNNY_PULL_ZONE = "rahlacdn";
const BUNNY_HOSTNAME = `${BUNNY_PULL_ZONE}.b-cdn.net`;

// Simple signed upload endpoint
router.post('/sign-upload', requireAuth, requireRole("owner", "admin", "editor"), async (req, res) => {
  try {
    const { key, contentType = 'application/octet-stream' } = req.body;
    
    if (!key) {
      return res.status(400).json({ error: 'Key required' });
    }
    
    if (!BUNNY_STORAGE_KEY) {
      return res.status(500).json({ error: 'Storage key not configured' });
    }
    
    const url = `https://${BUNNY_STORAGE_HOST}/${key}`;
    const headers = {
      'Content-Type': contentType,
      'AccessKey': BUNNY_STORAGE_KEY
    };
    const publicUrl = `https://${BUNNY_HOSTNAME}/${key}`;
    
    res.json({ url, method: 'PUT', headers, publicUrl });
  } catch (error) {
    console.error('Sign upload error:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'media' });
});



export default router;
