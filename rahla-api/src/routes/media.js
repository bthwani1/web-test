import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth.js';

export const router = Router();

router.use(authenticate, authorize('Editor','Admin','Owner'));

// Bunny Signed Upload via Storage API key (recommended: use a separate key with limited scope)
router.post('/sign-upload', async (req, res, next)=>{
  try{
    const body = z.object({
      key: z.string().min(3), // e.g., "rahlamedia/products/filename.jpg"
      contentType: z.string().default('application/octet-stream'),
      size: z.number().max(10*1024*1024).optional() // optional size guard (10MB)
    }).parse(req.body);

    const storageKey = process.env.BUNNY_STORAGE_FTP_PASSWORD; // using provided secret
    const storageHost = process.env.BUNNY_STORAGE_FTP_HOST || 'sg.storage.bunnycdn.com';
    if(!storageKey) return res.status(500).json({ error: 'Storage key not set' });

    // Pre-signed URL pattern (Bunny supports HTTP PUT via Storage zone hostname with AccessKey header)
    // See: https://docs.bunny.net/reference/storage-api
    const url = `https://${storageHost}/${body.key}`;
    const headers = { 'Content-Type': body.contentType, 'AccessKey': storageKey };
    const publicUrl = `https://rahlacdn.b-cdn.net/${body.key}`;

    return res.json({ url, method: 'PUT', headers, publicUrl });
  }catch(err){ next(err); }
});

import { Router } from "express";
import axios from "axios";
import { requireAuth, requireRole } from "../middleware/auth.js";
import crypto from "crypto";

const router = Router();

// Bunny CDN configuration
const BUNNY_API_KEY = process.env.BUNNY_CDN_API_KEY;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_CDN_STORAGE_ZONE || "rahlamedia";
const BUNNY_PULL_ZONE = process.env.BUNNY_CDN_PULL_ZONE || "rahlacdn";
const BUNNY_HOSTNAME = `${BUNNY_PULL_ZONE}.b-cdn.net`;

// Generate signed URL for upload
const generateSignedUrl = (path, expiresIn = 3600) => {
  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  const token = `${BUNNY_STORAGE_ZONE}${path}${expires}${BUNNY_API_KEY}`;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  
  return `https://${BUNNY_HOSTNAME}${path}?token=${hash}&expires=${expires}`;
};

// @route   POST /api/media/upload-url
// @desc    Get signed URL for file upload
// @access  Private (Editor+)
router.post('/upload-url', [
  requireAuth,
  requireRole("owner", "admin", "editor")
], async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    
    if (!filename || !contentType) {
      return res.status(400).json({ message: 'Filename and content type required' });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ message: 'Invalid file type. Only images allowed.' });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = filename.split('.').pop();
    const uniqueFilename = `${timestamp}-${randomString}.${extension}`;
    
    // Create path for Bunny CDN
    const path = `/products/${uniqueFilename}`;
    
    // Generate signed URL
    const signedUrl = generateSignedUrl(path);
    
    // Also return the public URL
    const publicUrl = `https://${BUNNY_HOSTNAME}${path}`;
    
    res.json({
      signedUrl,
      publicUrl,
      filename: uniqueFilename,
      expiresIn: 3600 // 1 hour
    });
    
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ message: 'Error generating upload URL' });
  }
});

// @route   POST /api/media/upload
// @desc    Upload file directly to Bunny CDN
// @access  Private (Editor+)
router.post('/upload', [
  requireAuth,
  requireRole("owner", "admin", "editor")
], async (req, res) => {
  try {
    const { file } = req.body;
    
    if (!file) {
      return res.status(400).json({ message: 'File data required' });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const path = `/products/${timestamp}-${randomString}.jpg`;
    
    // Upload to Bunny CDN
    const bunnyUrl = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}${path}`;
    
    const response = await axios.put(bunnyUrl, file, {
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'image/jpeg'
      }
    });
    
    if (response.status === 201) {
      const publicUrl = `https://${BUNNY_HOSTNAME}${path}`;
      
      res.json({
        success: true,
        url: publicUrl,
        filename: path.split('/').pop()
      });
    } else {
      res.status(500).json({ message: 'Upload failed' });
    }
    
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// @route   DELETE /api/media/delete
// @desc    Delete file from Bunny CDN
// @access  Private (Editor+)
router.delete('/delete', [
  requireAuth,
  requireRole("owner", "admin", "editor")
], async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ message: 'Filename required' });
    }
    
    // Extract path from filename
    const path = `/products/${filename}`;
    
    // Delete from Bunny CDN
    const bunnyUrl = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}${path}`;
    
    const response = await axios.delete(bunnyUrl, {
      headers: {
        'AccessKey': BUNNY_API_KEY
      }
    });
    
    if (response.status === 200 || response.status === 404) {
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(500).json({ message: 'Delete failed' });
    }
    
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// @route   GET /api/media/list
// @desc    List files in Bunny CDN storage
// @access  Private (Editor+)
router.get('/list', [
  requireAuth,
  requireRole("owner", "admin", "editor")
], async (req, res) => {
  try {
    const { path = '/products' } = req.query;
    
    // List files from Bunny CDN
    const bunnyUrl = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}${path}`;
    
    const response = await axios.get(bunnyUrl, {
      headers: {
        'AccessKey': BUNNY_API_KEY
      }
    });
    
    if (response.status === 200) {
      const files = response.data.map(file => ({
        name: file.ObjectName,
        size: file.Length,
        lastModified: file.LastChanged,
        url: `https://${BUNNY_HOSTNAME}${file.ObjectName}`
      }));
      
      res.json({ files });
    } else {
      res.status(500).json({ message: 'Failed to list files' });
    }
    
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ message: 'Error listing files' });
  }
});

// @route   POST /api/media/optimize
// @desc    Optimize image using Bunny CDN transformations
// @access  Public
router.post('/optimize', async (req, res) => {
  try {
    const { url, width, height, quality, format } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL required' });
    }
    
    // Build optimization parameters
    const params = new URLSearchParams();
    if (width) params.append('width', width);
    if (height) params.append('height', height);
    if (quality) params.append('quality', quality);
    if (format) params.append('format', format);
    
    // Add auto-optimization
    params.append('format', 'auto');
    
    const optimizedUrl = `${url}?${params.toString()}`;
    
    res.json({
      originalUrl: url,
      optimizedUrl,
      parameters: {
        width: width || 'auto',
        height: height || 'auto',
        quality: quality || 70,
        format: format || 'auto'
      }
    });
    
  } catch (error) {
    console.error('Error optimizing image:', error);
    res.status(500).json({ message: 'Error optimizing image' });
  }
});

module.exports = router;
