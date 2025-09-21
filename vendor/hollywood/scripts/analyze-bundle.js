#!/usr/bin/env node

/**
 * Bundle Analysis Script for LegacyGuard
 * Analyzes the production build and provides performance insights
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DIST_DIR = path.join(__dirname, '..', 'dist');
const BUNDLE_ANALYSIS_OUTPUT = path.join(
  __dirname,
  '..',
  'bundle-analysis.json'
);

// Size thresholds (in KB)
const THRESHOLDS = {
  CHUNK_WARNING: 250, // Warn if chunk is larger than 250KB
  CHUNK_ERROR: 500, // Error if chunk is larger than 500KB
  TOTAL_WARNING: 1000, // Warn if total size is larger than 1MB
  TOTAL_ERROR: 2000, // Error if total size is larger than 2MB
};

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round((stats.size / 1024) * 100) / 100;
  } catch (error) {
    return 0;
  }
}

/**
 * Analyze JavaScript chunks
 */
function analyzeJSChunks() {
  const jsDir = path.join(DIST_DIR, 'assets', 'js');

  if (!fs.existsSync(jsDir)) {
    console.warn('⚠️  JavaScript assets directory not found');
    return [];
  }

  const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));

  return jsFiles
    .map(file => {
      const filePath = path.join(jsDir, file);
      const sizeKB = getFileSizeKB(filePath);

      let category = 'other';
      let chunkName = file.replace(/\.[^.]+$/, '');

      // Categorize chunks
      if (file.includes('react-vendor')) category = 'vendor-react';
      else if (file.includes('ui-vendor')) category = 'vendor-ui';
      else if (file.includes('utils-vendor')) category = 'vendor-utils';
      else if (file.includes('client')) category = 'supabase';
      else if (file.includes('index')) category = 'main';
      else if (file.includes('DashboardLayout')) category = 'layout';
      else if (file.includes('Legacy')) category = 'features';
      else if (file.includes('Family')) category = 'features';
      else if (file.includes('Vault')) category = 'features';
      else if (file.includes('Settings')) category = 'features';
      else if (chunkName.length < 15) category = 'components';

      return {
        file,
        chunkName,
        category,
        sizeKB,
        status:
          sizeKB > THRESHOLDS.CHUNK_ERROR
            ? 'error'
            : sizeKB > THRESHOLDS.CHUNK_WARNING
              ? 'warning'
              : 'ok',
      };
    })
    .sort((a, b) => b.sizeKB - a.sizeKB);
}

/**
 * Analyze CSS assets
 */
function analyzeCSSAssets() {
  const assetsDir = path.join(DIST_DIR, 'assets');

  if (!fs.existsSync(assetsDir)) {
    console.warn('⚠️  Assets directory not found');
    return [];
  }

  const cssFiles = fs
    .readdirSync(assetsDir)
    .filter(file => file.endsWith('.css'));

  return cssFiles
    .map(file => {
      const filePath = path.join(assetsDir, file);
      const sizeKB = getFileSizeKB(filePath);

      return {
        file,
        sizeKB,
        status: sizeKB > 200 ? 'warning' : 'ok',
      };
    })
    .sort((a, b) => b.sizeKB - a.sizeKB);
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(jsChunks, cssAssets) {
  const recommendations = [];

  // Check for oversized chunks
  const largeChunks = jsChunks.filter(
    chunk => chunk.sizeKB > THRESHOLDS.CHUNK_WARNING
  );
  if (largeChunks.length > 0) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'Large JavaScript Chunks Detected',
      description: `Found ${largeChunks.length} chunks larger than ${THRESHOLDS.CHUNK_WARNING}KB`,
      action: 'Consider code splitting or lazy loading for these components',
      chunks: largeChunks.map(c => `${c.file} (${c.sizeKB}KB)`),
    });
  }

  // Check vendor bundle size
  const vendorChunks = jsChunks.filter(chunk =>
    chunk.category.includes('vendor')
  );
  const totalVendorSize = vendorChunks.reduce(
    (sum, chunk) => sum + chunk.sizeKB,
    0
  );
  if (totalVendorSize > 300) {
    recommendations.push({
      type: 'bundling',
      priority: 'medium',
      title: 'Large Vendor Bundle',
      description: `Total vendor bundle size: ${totalVendorSize}KB`,
      action: 'Consider splitting vendor libraries or using dynamic imports',
    });
  }

  // Check for duplicate functionality
  const featureChunks = jsChunks.filter(chunk => chunk.category === 'features');
  if (featureChunks.length > 5) {
    recommendations.push({
      type: 'architecture',
      priority: 'low',
      title: 'Multiple Feature Chunks',
      description: `Found ${featureChunks.length} feature chunks`,
      action:
        'Consider consolidating related features or implementing lazy loading',
    });
  }

  // Check CSS bundle size
  const largeCSSFiles = cssAssets.filter(css => css.sizeKB > 100);
  if (largeCSSFiles.length > 0) {
    recommendations.push({
      type: 'styling',
      priority: 'medium',
      title: 'Large CSS Bundle',
      description: `CSS bundle size: ${largeCSSFiles[0]?.sizeKB}KB`,
      action: 'Consider CSS code splitting or removing unused styles',
    });
  }

  return recommendations;
}

/**
 * Main analysis function
 */
function analyzeBundlePerformance() {
  console.log('🔍 Analyzing LegacyGuard Bundle Performance...\n');

  // Analyze JavaScript chunks
  const jsChunks = analyzeJSChunks();
  const totalJSSize = jsChunks.reduce((sum, chunk) => sum + chunk.sizeKB, 0);

  // Analyze CSS assets
  const cssAssets = analyzeCSSAssets();
  const totalCSSSize = cssAssets.reduce((sum, css) => sum + css.sizeKB, 0);

  // Calculate totals
  const totalBundleSize = totalJSSize + totalCSSSize;

  // Generate analysis report
  const analysis = {
    timestamp: new Date().toISOString(),
    summary: {
      totalBundleSize: Math.round(totalBundleSize * 100) / 100,
      totalJSSize: Math.round(totalJSSize * 100) / 100,
      totalCSSSize: Math.round(totalCSSSize * 100) / 100,
      chunkCount: jsChunks.length,
      status:
        totalBundleSize > THRESHOLDS.TOTAL_ERROR
          ? 'error'
          : totalBundleSize > THRESHOLDS.TOTAL_WARNING
            ? 'warning'
            : 'good',
    },
    chunks: jsChunks,
    css: cssAssets,
    recommendations: generateRecommendations(jsChunks, cssAssets),
  };

  // Display summary
  console.log('📊 Bundle Size Summary:');
  console.log(`   Total Bundle Size: ${analysis.summary.totalBundleSize} KB`);
  console.log(`   JavaScript: ${analysis.summary.totalJSSize} KB`);
  console.log(`   CSS: ${analysis.summary.totalCSSSize} KB`);
  console.log(`   Chunks: ${analysis.summary.chunkCount}\n`);

  // Display status
  const statusIcon =
    analysis.summary.status === 'good'
      ? '✅'
      : analysis.summary.status === 'warning'
        ? '⚠️'
        : '❌';
  console.log(
    `${statusIcon} Bundle Status: ${analysis.summary.status.toUpperCase()}\n`
  );

  // Show top 5 largest chunks
  console.log('🏆 Top 5 Largest Chunks:');
  jsChunks.slice(0, 5).forEach((chunk, index) => {
    const statusIcon =
      chunk.status === 'ok' ? '✅' : chunk.status === 'warning' ? '⚠️' : '❌';
    console.log(
      `   ${index + 1}. ${chunk.chunkName} (${chunk.category}) - ${chunk.sizeKB} KB ${statusIcon}`
    );
  });
  console.log();

  // Show recommendations
  if (analysis.recommendations.length > 0) {
    console.log('💡 Performance Recommendations:');
    analysis.recommendations.forEach((rec, index) => {
      const priorityIcon =
        rec.priority === 'high'
          ? '🔴'
          : rec.priority === 'medium'
            ? '🟡'
            : '🔵';
      console.log(`   ${index + 1}. ${priorityIcon} ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Action: ${rec.action}\n`);
    });
  } else {
    console.log('✅ No performance issues detected!\n');
  }

  // Save detailed analysis
  fs.writeFileSync(BUNDLE_ANALYSIS_OUTPUT, JSON.stringify(analysis, null, 2));
  console.log(`📝 Detailed analysis saved to: ${BUNDLE_ANALYSIS_OUTPUT}`);

  // Return exit code based on status
  if (analysis.summary.status === 'error') {
    console.log(
      '\n❌ Bundle analysis failed - bundle size exceeds error threshold'
    );
    process.exit(1);
  } else if (analysis.summary.status === 'warning') {
    console.log('\n⚠️  Bundle analysis completed with warnings');
    process.exit(0);
  } else {
    console.log('\n✅ Bundle analysis completed successfully');
    process.exit(0);
  }
}

// Run analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeBundlePerformance();
}

export { analyzeBundlePerformance };
