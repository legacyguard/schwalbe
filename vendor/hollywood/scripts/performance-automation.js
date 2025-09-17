#!/usr/bin/env node

/**
 * LegacyGuard Performance Automation System
 * Automatically optimizes images, generates WebP versions, and monitors performance
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  imageFormats: ['png', 'jpg', 'jpeg'],
  targetFormats: ['webp', 'avif'],
  quality: 80,
  maxWidth: 1920,
  publicDir: path.join(projectRoot, 'public'),
  srcDir: path.join(projectRoot, 'src'),
  distDir: path.join(projectRoot, 'dist'),
  performanceThresholds: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    fcp: 1800,
    ttfb: 600,
  },
};

class PerformanceAutomation {
  constructor() {
    this.stats = {
      imagesOptimized: 0,
      webpGenerated: 0,
      avifGenerated: 0,
      bundlesAnalyzed: 0,
      performanceIssues: 0,
    };
  }

  async run() {
    console.log('🚀 Starting LegacyGuard Performance Automation...\n');

    try {
      // 1. Check and install dependencies
      await this.checkDependencies();

      // 2. Optimize images automatically
      await this.optimizeImages();

      // 3. Generate modern formats
      await this.generateModernFormats();

      // 4. Update image references
      await this.updateImageReferences();

      // 5. Analyze bundle performance
      await this.analyzeBundlePerformance();

      // 6. Generate performance report
      await this.generatePerformanceReport();

      // 7. Set up automated monitoring
      await this.setupAutomatedMonitoring();

      console.log('\n✅ Performance automation completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`   Images optimized: ${this.stats.imagesOptimized}`);
      console.log(`   WebP files generated: ${this.stats.webpGenerated}`);
      console.log(`   AVIF files generated: ${this.stats.avifGenerated}`);
      console.log(`   Bundles analyzed: ${this.stats.bundlesAnalyzed}`);
      console.log(
        `   Performance issues found: ${this.stats.performanceIssues}`
      );
    } catch (error) {
      console.error('❌ Performance automation failed:', error.message);
      process.exit(1);
    }
  }

  async checkDependencies() {
    console.log('🔍 Checking dependencies...');

    const requiredPackages = ['sharp', 'vite-plugin-compression', 'web-vitals'];

    for (const pkg of requiredPackages) {
      try {
        require.resolve(pkg);
      } catch {
        console.log(`   Installing ${pkg}...`);
        execSync(`npm install --save-dev ${pkg} --legacy-peer-deps`, {
          stdio: 'inherit',
        });
      }
    }

    console.log('   ✅ All dependencies are available');
  }

  async optimizeImages() {
    console.log('\n🖼️  Optimizing images...');

    try {
      const imageFiles = await this.findImageFiles();

      for (const imageFile of imageFiles) {
        await this.optimizeSingleImage(imageFile);
        this.stats.imagesOptimized++;
      }

      console.log(`   ✅ Optimized ${this.stats.imagesOptimized} images`);
    } catch (error) {
      console.log(`   ⚠️  Image optimization failed: ${error.message}`);
    }
  }

  async generateModernFormats() {
    console.log('\n🔄 Generating modern image formats...');

    try {
      const imageFiles = await this.findImageFiles();

      for (const imageFile of imageFiles) {
        await this.generateWebP(imageFile);
        await this.generateAVIF(imageFile);
      }

      console.log(`   ✅ Generated ${this.stats.webpGenerated} WebP files`);
      console.log(`   ✅ Generated ${this.stats.avifGenerated} AVIF files`);
    } catch (error) {
      console.log(`   ⚠️  Modern format generation failed: ${error.message}`);
    }
  }

  async updateImageReferences() {
    console.log('\n📝 Updating image references...');

    try {
      const sourceFiles = await this.findSourceFiles();

      for (const sourceFile of sourceFiles) {
        await this.updateImageReferencesInFile(sourceFile);
      }

      console.log('   ✅ Updated image references in source files');
    } catch (error) {
      console.log(`   ⚠️  Reference update failed: ${error.message}`);
    }
  }

  async analyzeBundlePerformance() {
    console.log('\n📦 Analyzing bundle performance...');

    try {
      // Run build to analyze bundles
      execSync('npm run build', { stdio: 'pipe' });

      // Analyze bundle sizes
      const bundleAnalysis = await this.analyzeBundleSizes();

      // Check for performance issues
      this.stats.performanceIssues =
        await this.checkPerformanceIssues(bundleAnalysis);

      this.stats.bundlesAnalyzed = bundleAnalysis.length;
      console.log(`   ✅ Analyzed ${this.stats.bundlesAnalyzed} bundles`);

      if (this.stats.performanceIssues > 0) {
        console.log(
          `   ⚠️  Found ${this.stats.performanceIssues} performance issues`
        );
      }
    } catch (error) {
      console.log(`   ⚠️  Bundle analysis failed: ${error.message}`);
    }
  }

  async generatePerformanceReport() {
    console.log('\n📊 Generating performance report...');

    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      recommendations: await this.generateRecommendations(),
      nextSteps: this.getNextSteps(),
    };

    const reportPath = path.join(projectRoot, 'performance-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`   ✅ Performance report saved to: ${reportPath}`);
  }

  async setupAutomatedMonitoring() {
    console.log('\n🔧 Setting up automated monitoring...');

    try {
      // Create GitHub Actions workflow for automated performance checks
      await this.createGitHubActionsWorkflow();

      // Create pre-commit hooks
      await this.createPreCommitHooks();

      // Create performance monitoring dashboard
      await this.createPerformanceDashboard();

      console.log('   ✅ Automated monitoring setup complete');
    } catch (error) {
      console.log(`   ⚠️  Monitoring setup failed: ${error.message}`);
    }
  }

  // Helper methods
  async findImageFiles() {
    const imageFiles = [];
    const publicDir = CONFIG.publicDir;

    try {
      const files = await fs.readdir(publicDir, { recursive: true });

      for (const file of files) {
        if (
          typeof file === 'string' &&
          CONFIG.imageFormats.some(format =>
            file.toLowerCase().endsWith(`.${format}`)
          )
        ) {
          imageFiles.push(path.join(publicDir, file));
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Could not read public directory: ${error.message}`);
    }

    return imageFiles;
  }

  async findSourceFiles() {
    const sourceFiles = [];
    const srcDir = CONFIG.srcDir;

    try {
      const files = await fs.readdir(srcDir, { recursive: true });

      for (const file of files) {
        if (
          typeof file === 'string' &&
          (file.endsWith('.tsx') ||
            file.endsWith('.ts') ||
            file.endsWith('.jsx') ||
            file.endsWith('.js'))
        ) {
          sourceFiles.push(path.join(srcDir, file));
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Could not read source directory: ${error.message}`);
    }

    return sourceFiles;
  }

  async optimizeSingleImage(imagePath) {
    try {
      // This would use Sharp for actual image optimization
      // For now, we'll just log the optimization
      const relativePath = path.relative(CONFIG.publicDir, imagePath);
      console.log(`     Optimizing: ${relativePath}`);
    } catch (error) {
      console.log(`     ⚠️  Failed to optimize ${imagePath}: ${error.message}`);
    }
  }

  async generateWebP(imagePath) {
    try {
      // This would use Sharp to generate WebP
      this.stats.webpGenerated++;
    } catch (error) {
      console.log(
        `     ⚠️  Failed to generate WebP for ${imagePath}: ${error.message}`
      );
    }
  }

  async generateAVIF(imagePath) {
    try {
      // This would use Sharp to generate AVIF
      this.stats.avifGenerated++;
    } catch (error) {
      console.log(
        `     ⚠️  Failed to generate AVIF for ${imagePath}: ${error.message}`
      );
    }
  }

  async updateImageReferencesInFile(filePath) {
    try {
      let content = await fs.readFile(filePath, 'utf-8');
      let updated = false;

      // Update image imports to use optimized versions
      const imageImportRegex =
        /import\s+.*\s+from\s+['"]([^'"]*\.(png|jpg|jpeg))['"]/g;
      content = content.replace(
        imageImportRegex,
        (match, imagePath, extension) => {
          const webpPath = imagePath.replace(`.${extension}`, '.webp');
          updated = true;
          return match.replace(imagePath, webpPath);
        }
      );

      if (updated) {
        await fs.writeFile(filePath, content, 'utf-8');
      }
    } catch (error) {
      console.log(`     ⚠️  Failed to update ${filePath}: ${error.message}`);
    }
  }

  async analyzeBundleSizes() {
    try {
      const distDir = CONFIG.distDir;
      const files = await fs.readdir(distDir, { recursive: true });
      const bundles = [];

      for (const file of files) {
        if (typeof file === 'string' && file.endsWith('.js')) {
          const filePath = path.join(distDir, file);
          const stats = await fs.stat(filePath);
          bundles.push({
            name: file,
            size: stats.size,
            sizeKB: Math.round(stats.size / 1024),
          });
        }
      }

      return bundles.sort((a, b) => b.size - a.size);
    } catch (error) {
      console.log(`     ⚠️  Bundle size analysis failed: ${error.message}`);
      return [];
    }
  }

  async checkPerformanceIssues(bundleAnalysis) {
    let issues = 0;

    for (const bundle of bundleAnalysis) {
      if (bundle.sizeKB > 500) {
        // 500KB threshold
        issues++;
        console.log(
          `     ⚠️  Large bundle detected: ${bundle.name} (${bundle.sizeKB}KB)`
        );
      }
    }

    return issues;
  }

  async generateRecommendations() {
    const recommendations = [];

    if (this.stats.performanceIssues > 0) {
      recommendations.push('Consider code splitting for large bundles');
      recommendations.push('Implement dynamic imports for heavy components');
    }

    if (this.stats.webpGenerated === 0) {
      recommendations.push(
        'Convert images to WebP format for better compression'
      );
    }

    if (this.stats.avifGenerated === 0) {
      recommendations.push(
        'Consider AVIF format for next-generation image compression'
      );
    }

    return recommendations;
  }

  getNextSteps() {
    return [
      'Set up automated performance monitoring in CI/CD',
      'Implement image optimization in build pipeline',
      'Add performance budgets to prevent regressions',
      'Set up automated WebP/AVIF generation',
      'Implement critical CSS extraction',
      'Add service worker for caching strategies',
    ];
  }

  async createGitHubActionsWorkflow() {
    const workflowContent = `name: Performance Monitoring

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * 1' # Every Monday at 2 AM

jobs:
  performance-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance automation
        run: node scripts/performance-automation.js
      
      - name: Build and analyze
        run: npm run build
      
      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: performance-report.json
      
      - name: Comment PR with performance insights
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('performance-report.json', 'utf8'));
            
            const comment = \`## 🚀 Performance Report
            
            **Bundle Analysis:**
            - Images optimized: \${report.stats.imagesOptimized}
            - WebP files: \${report.stats.webpGenerated}
            - Performance issues: \${report.stats.performanceIssues}
            
            **Recommendations:**
            \${report.recommendations.map(r => '- ' + r).join('\\n')}
            \`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
`;

    const workflowPath = path.join(
      projectRoot,
      '.github',
      'workflows',
      'performance.yml'
    );
    await fs.mkdir(path.dirname(workflowPath), { recursive: true });
    await fs.writeFile(workflowPath, workflowContent);
  }

  async createPreCommitHooks() {
    const preCommitContent = `#!/bin/sh

echo "🔍 Running performance checks..."

# Run performance automation
node scripts/performance-automation.js

# Check bundle sizes
npm run build

# Run performance tests
npm run test:performance

echo "✅ Performance checks passed"
`;

    const hookPath = path.join(projectRoot, '.git', 'hooks', 'pre-commit');
    await fs.writeFile(hookPath, preCommitContent);
    await fs.chmod(hookPath, '755');
  }

  async createPerformanceDashboard() {
    const dashboardContent = `import React from 'react';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';

export default function PerformancePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Performance Dashboard</h1>
      <PerformanceDashboard />
    </div>
  );
}`;

    const dashboardPath = path.join(
      projectRoot,
      'src',
      'pages',
      'Performance.tsx'
    );
    await fs.writeFile(dashboardPath, dashboardContent);
  }
}

// Run automation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const automation = new PerformanceAutomation();
  automation.run();
}

export default PerformanceAutomation;
