#!/usr/bin/env node

/**
 * LegacyGuard Social Media Image Generator
 *
 * This script generates a 1200x630px PNG image for social media sharing.
 *
 * Requirements:
 * - Node.js with Canvas support
 * - Install: npm install canvas
 *
 * Usage:
 * 1. Install canvas: npm install canvas
 * 2. Run: node scripts/generate-og-image.js
 * 3. Image will be saved as public/og-image.png
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create canvas
const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Helper function to create gradient
function createGradient(x1, y1, x2, y2, colors) {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  return gradient;
}

// Helper function to create radial gradient
function createRadialGradient(x1, y1, r1, x2, y2, r2, colors) {
  const gradient = ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  return gradient;
}

// Helper function to draw rounded rectangle
function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Helper function to add shadow
function addShadow(
  color = 'rgba(0, 0, 0, 0.3)',
  blur = 8,
  offsetX = 0,
  offsetY = 4
) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = offsetX;
  ctx.shadowOffsetY = offsetY;
}

// Helper function to remove shadow
function removeShadow() {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// Main drawing function
function drawImage() {
  // Background gradient
  const bgGradient = createGradient(0, 0, width, height, [
    '#0f172a',
    '#1e293b',
    '#334155',
  ]);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Background pattern circles
  const circleGradient1 = createRadialGradient(240, 504, 0, 240, 504, 120, [
    'rgba(59, 130, 246, 0.1)',
    'transparent',
  ]);
  ctx.fillStyle = circleGradient1;
  ctx.beginPath();
  ctx.arc(240, 504, 120, 0, 2 * Math.PI);
  ctx.fill();

  const circleGradient2 = createRadialGradient(960, 126, 0, 960, 126, 100, [
    'rgba(16, 185, 129, 0.1)',
    'transparent',
  ]);
  ctx.fillStyle = circleGradient2;
  ctx.beginPath();
  ctx.arc(960, 126, 100, 0, 2 * Math.PI);
  ctx.fill();

  const circleGradient3 = createRadialGradient(480, 252, 0, 480, 252, 80, [
    'rgba(139, 92, 246, 0.05)',
    'transparent',
  ]);
  ctx.fillStyle = circleGradient3;
  ctx.beginPath();
  ctx.arc(480, 252, 80, 0, 2 * Math.PI);
  ctx.fill();

  // Floating elements
  ctx.font = '48px Arial';
  ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
  ctx.fillText('📄', 120, 189);

  ctx.font = '40px Arial';
  ctx.fillText('🔒', 1080, 252);

  ctx.font = '36px Arial';
  ctx.fillText('👨‍👩‍👧‍👦', 240, 504);

  // Logo container
  const logoX = width / 2;
  const logoY = height / 2 - 40;

  // Logo icon background
  const logoGradient = createGradient(
    logoX - 40,
    logoY - 40,
    logoX + 40,
    logoY + 40,
    ['#3b82f6', '#1d4ed8']
  );

  addShadow();
  ctx.fillStyle = logoGradient;
  drawRoundedRect(logoX - 40, logoY - 40, 80, 80, 20);
  ctx.fill();
  removeShadow();

  // Logo icon emoji
  ctx.font = '40px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🛡️', logoX, logoY);

  // Logo text
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = 'white';
  addShadow();
  ctx.fillText('LegacyGuard', logoX + 60, logoY);
  removeShadow();

  // Tagline
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';
  addShadow();
  ctx.fillText(
    'Your Legacy, Secured. Your Family, Protected.',
    logoX,
    logoY + 105
  );
  removeShadow();

  // Features
  const features = [
    'AI-Powered Security',
    'Family Protection',
    'Document Management',
  ];
  const featureY = logoY + 165;

  ctx.font = '18px Arial';
  ctx.textAlign = 'center';

  features.forEach((feature, index) => {
    const x = logoX + (index - 1) * 200;

    // Checkmark
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('✓', x - 10, featureY);

    // Feature text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px Arial';
    ctx.fillText(feature, x + 10, featureY);
  });

  // Accent line at bottom
  const accentGradient = createGradient(0, height - 6, width, height - 6, [
    '#3b82f6',
    '#10b981',
    '#8b5cf6',
  ]);
  ctx.fillStyle = accentGradient;
  ctx.fillRect(0, height - 6, width, 6);

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;

  // Horizontal lines
  for (let i = 0; i <= 5; i++) {
    const y = (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let i = 0; i <= 5; i++) {
    const x = (width / 5) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

// Generate and save the image
try {
  console.log('🎨 Generating LegacyGuard social media image...');

  drawImage();

  // Ensure public directory exists
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save as PNG
  const outputPath = path.join(publicDir, 'og-image.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log('✅ Image generated successfully!');
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`📏 Dimensions: ${width}x${height}px`);
  console.log(`💾 File size: ${(buffer.length / 1024).toFixed(1)}KB`);
  console.log('');
  console.log('🚀 Your social media image is ready!');
  console.log(
    '📱 Perfect for Facebook, LinkedIn, Twitter, and WhatsApp sharing'
  );
} catch (error) {
  console.error('❌ Error generating image:', error.message);
  console.log('');
  console.log('💡 Make sure you have the canvas package installed:');
  console.log('   npm install canvas');
  console.log('');
  console.log('🔧 If you have issues with canvas, you can:');
  console.log('   1. Use the HTML version: public/og-image.html');
  console.log('   2. Use the SVG version: public/og-image.svg');
  console.log('   3. Convert SVG to PNG using online tools');
}
