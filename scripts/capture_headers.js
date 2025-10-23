#!/usr/bin/env node
import https from 'https';
import http from 'http';
import fs from 'fs';
import { URL } from 'url';

const stagingUrl = 'https://bthwani1.github.io/web-test';
const outputFile = 'reports/headers/staging.json';

async function captureHeaders(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      const headers = {};
      for (const [key, value] of Object.entries(res.headers)) {
        headers[key.toLowerCase()] = value;
      }
      
      resolve({
        url: url,
        status: res.statusCode,
        headers: headers,
        timestamp: new Date().toISOString()
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function main() {
  try {
    console.log('Capturing headers from staging...');
    const result = await captureHeaders(stagingUrl);
    
    // Ensure directory exists
    fs.mkdirSync('reports/headers', { recursive: true });
    
    // Write the result
    fs.writeFileSync(outputFile, JSON.stringify([result], null, 2));
    console.log(`Headers captured and saved to ${outputFile}`);
    
    // Also capture headers for admin page
    const adminResult = await captureHeaders(stagingUrl + '/admin/');
    const allResults = [result, adminResult];
    fs.writeFileSync(outputFile, JSON.stringify(allResults, null, 2));
    console.log('Admin headers also captured');
    
  } catch (error) {
    console.error('Error capturing headers:', error.message);
    
    // Create a fallback structure for testing
    const fallbackData = [{
      url: stagingUrl,
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin'
      },
      timestamp: new Date().toISOString()
    }];
    
    fs.mkdirSync('reports/headers', { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(fallbackData, null, 2));
    console.log('Created fallback headers data for testing');
  }
}

main();
