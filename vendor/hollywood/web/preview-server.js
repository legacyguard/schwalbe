#!/usr/bin/env node

/**
 * Custom preview server with proper MIME type handling
 * Fixes the "Expected a JavaScript module but got application/octet-stream" error
 */

import { createServer } from 'http';
import { resolve, extname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { parse } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// MIME type mappings
const mimeTypes = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.ts': 'application/javascript',
  '.tsx': 'application/javascript',
  '.jsx': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.avif': 'image/avif'
};

/**
 * Get MIME type for a file extension
 */
function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Create custom preview server
 */
function createPreviewServer() {
  const distPath = resolve(__dirname, 'dist');
  const indexHtml = resolve(distPath, 'index.html');
  
  console.log('🔧 Starting custom preview server...');
  console.log('📁 Serving from:', distPath);
  
  if (!existsSync(indexHtml)) {
    console.error('❌ dist/index.html not found. Please run "npm run build" first.');
    process.exit(1);
  }

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Try to serve static file
    const filePath = resolve(distPath, pathname.slice(1) || 'index.html');
    
    if (existsSync(filePath)) {
      const mimeType = getMimeType(filePath);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      // Special handling for JavaScript modules
      if (mimeType === 'application/javascript') {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        console.log(`📦 Serving JS module: ${pathname} with MIME type: ${mimeType}`);
      }
      
      try {
        const content = readFileSync(filePath);
        res.writeHead(200);
        res.end(content);
      } catch (err) {
        console.error(`❌ Error reading file ${filePath}:`, err.message);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    } else {
      // Serve index.html for SPA routing
      res.setHeader('Content-Type', 'text/html');
      try {
        const html = readFileSync(indexHtml, 'utf-8');
        res.writeHead(200);
        res.end(html);
      } catch (err) {
        console.error('❌ Error serving index.html:', err.message);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    }
  });

  const port = 4173;
  const host = '0.0.0.0';

  server.listen(port, host, () => {
    console.log('');
    console.log('🚀 Preview server started successfully!');
    console.log('');
    console.log(`  ➜  Local:   http://localhost:${port}/`);
    console.log(`  ➜  Network: http://${host}:${port}/`);
    console.log('');
    console.log('✅ MIME types properly configured for JavaScript modules');
    console.log('✅ CORS enabled for development');
    console.log('✅ Static file serving optimized');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Shutting down preview server...');
    server.close();
  });
}

// Start the server
try {
  createPreviewServer();
} catch (err) {
  console.error('❌ Failed to start preview server:', err);
  process.exit(1);
}