#!/usr/bin/env node

/**
 * LegacyGuard Image Optimization Automation
 * Automatically converts images to WebP/AVIF and optimizes them
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class ImageOptimizer {
  constructor() {
    this.config = {
      inputFormats: ['png', 'jpg', 'jpeg', 'gif'],
      outputFormats: ['webp', 'avif'],
      quality: {
        webp: 80,
        avif: 75,
      },
      maxWidth: 1920,
      maxHeight: 1080,
      publicDir: path.join(projectRoot, 'public'),
      srcDir: path.join(projectRoot, 'src'),
      distDir: path.join(projectRoot, 'dist'),
    };

    this.stats = {
      processed: 0,
      webpGenerated: 0,
      avifGenerated: 0,
      optimized: 0,
      errors: 0,
    };
  }

  async run() {
    console.log('🖼️  Starting LegacyGuard Image Optimization...\n');

    try {
      // Check if Sharp is available
      await this.checkSharp();

      // Find all images
      const images = await this.findImages();
      console.log(`Found ${images.length} images to process\n`);

      // Process each image
      for (const image of images) {
        await this.processImage(image);
      }

      // Generate optimization report
      await this.generateReport();

      // Update package.json scripts
      await this.updatePackageScripts();

      console.log('\n✅ Image optimization completed successfully!');
      console.log(`\n📊 Summary:`);
      console.log(`   Images processed: ${this.stats.processed}`);
      console.log(`   WebP files generated: ${this.stats.webpGenerated}`);
      console.log(`   AVIF files generated: ${this.stats.avifGenerated}`);
      console.log(`   Images optimized: ${this.stats.optimized}`);
      console.log(`   Errors: ${this.stats.errors}`);
    } catch (error) {
      console.error('❌ Image optimization failed:', error.message);
      process.exit(1);
    }
  }

  async checkSharp() {
    try {
      require.resolve('sharp');
      console.log('✅ Sharp is available');
    } catch {
      console.log('📦 Installing Sharp...');
      execSync('npm install --save-dev sharp --legacy-peer-deps', {
        stdio: 'inherit',
      });
    }
  }

  async findImages() {
    const images = [];

    // Search in public directory
    try {
      const publicFiles = await this.recursiveReadDir(this.config.publicDir);
      for (const file of publicFiles) {
        if (this.isImageFile(file)) {
          images.push({
            path: file,
            type: 'public',
            relativePath: path.relative(this.config.publicDir, file),
          });
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not read public directory: ${error.message}`);
    }

    // Search in src directory for imported images
    try {
      const srcFiles = await this.recursiveReadDir(this.config.srcDir);
      for (const file of srcFiles) {
        if (this.isImageFile(file)) {
          images.push({
            path: file,
            type: 'src',
            relativePath: path.relative(this.config.srcDir, file),
          });
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not read src directory: ${error.message}`);
    }

    return images;
  }

  async recursiveReadDir(dir) {
    const files = [];

    try {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          const subFiles = await this.recursiveReadDir(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }

    return files;
  }

  isImageFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.config.inputFormats.includes(ext.slice(1));
  }

  async processImage(imageInfo) {
    try {
      console.log(`Processing: ${imageInfo.relativePath}`);

      const sharp = await import('sharp');
      const image = sharp.default(imageInfo.path);
      const metadata = await image.metadata();

      // Generate WebP version
      await this.generateWebP(image, imageInfo, metadata);

      // Generate AVIF version
      await this.generateAVIF(image, imageInfo, metadata);

      // Optimize original if it's large
      await this.optimizeOriginal(image, imageInfo, metadata);

      this.stats.processed++;
    } catch (error) {
      console.log(
        `   ❌ Error processing ${imageInfo.relativePath}: ${error.message}`
      );
      this.stats.errors++;
    }
  }

  async generateWebP(image, imageInfo, metadata) {
    try {
      const outputPath = this.getOutputPath(imageInfo.path, 'webp');
      const webpImage = image
        .clone()
        .webp({ quality: this.config.quality.webp });

      // Resize if too large
      if (
        metadata.width > this.config.maxWidth ||
        metadata.height > this.config.maxHeight
      ) {
        webpImage.resize(this.config.maxWidth, this.config.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      await webpImage.toFile(outputPath);
      console.log(`   ✅ Generated WebP: ${path.basename(outputPath)}`);
      this.stats.webpGenerated++;
    } catch (error) {
      console.log(`   ⚠️  Failed to generate WebP: ${error.message}`);
    }
  }

  async generateAVIF(image, imageInfo, metadata) {
    try {
      const outputPath = this.getOutputPath(imageInfo.path, 'avif');
      const avifImage = image
        .clone()
        .avif({ quality: this.config.quality.avif });

      // Resize if too large
      if (
        metadata.width > this.config.maxWidth ||
        metadata.height > this.config.maxHeight
      ) {
        avifImage.resize(this.config.maxWidth, this.config.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      await avifImage.toFile(outputPath);
      console.log(`   ✅ Generated AVIF: ${path.basename(outputPath)}`);
      this.stats.avifGenerated++;
    } catch (error) {
      console.log(`   ⚠️  Failed to generate AVIF: ${error.message}`);
    }
  }

  async optimizeOriginal(image, imageInfo, metadata) {
    try {
      const originalSize = (await fs.stat(imageInfo.path)).size;
      const optimizedPath = this.getOptimizedPath(imageInfo.path);

      let optimizedImage = image.clone();

      // Resize if too large
      if (
        metadata.width > this.config.maxWidth ||
        metadata.height > this.config.maxHeight
      ) {
        optimizedImage = optimizedImage.resize(
          this.config.maxWidth,
          this.config.maxHeight,
          {
            fit: 'inside',
            withoutEnlargement: true,
          }
        );
      }

      // Optimize based on format
      const ext = path.extname(imageInfo.path).toLowerCase();
      if (ext === '.png') {
        optimizedImage = optimizedImage.png({
          quality: 90,
          compressionLevel: 9,
        });
      } else if (['.jpg', '.jpeg'].includes(ext)) {
        optimizedImage = optimizedImage.jpeg({
          quality: 85,
          progressive: true,
        });
      }

      await optimizedImage.toFile(optimizedPath);

      const optimizedSize = (await fs.stat(optimizedPath)).size;
      const savings = (
        ((originalSize - optimizedSize) / originalSize) *
        100
      ).toFixed(1);

      if (savings > 0) {
        console.log(`   ✅ Optimized original: ${savings}% smaller`);
        this.stats.optimized++;

        // Replace original with optimized version
        await fs.unlink(imageInfo.path);
        await fs.rename(optimizedPath, imageInfo.path);
      } else {
        // Remove optimized version if no savings
        await fs.unlink(optimizedPath);
      }
    } catch (error) {
      console.log(`   ⚠️  Failed to optimize original: ${error.message}`);
    }
  }

  getOutputPath(originalPath, format) {
    const dir = path.dirname(originalPath);
    const name = path.basename(originalPath, path.extname(originalPath));
    return path.join(dir, `${name}.${format}`);
  }

  getOptimizedPath(originalPath) {
    const dir = path.dirname(originalPath);
    const name = path.basename(originalPath, path.extname(originalPath));
    const ext = path.extname(originalPath);
    return path.join(dir, `${name}_optimized${ext}`);
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      recommendations: this.generateRecommendations(),
      nextSteps: [
        'Update image imports to use WebP/AVIF formats',
        'Implement responsive image loading',
        'Add image lazy loading',
        'Set up automated image optimization in CI/CD',
      ],
    };

    const reportPath = path.join(projectRoot, 'image-optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Report saved to: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.stats.webpGenerated > 0) {
      recommendations.push(
        'Use WebP format for better compression and faster loading'
      );
    }

    if (this.stats.avifGenerated > 0) {
      recommendations.push(
        'Consider AVIF format for next-generation image compression'
      );
    }

    if (this.stats.optimized > 0) {
      recommendations.push(
        'Original images have been optimized for better performance'
      );
    }

    if (this.stats.errors > 0) {
      recommendations.push('Some images failed to process - check error logs');
    }

    return recommendations;
  }

  async updatePackageScripts() {
    try {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      // Add new scripts
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['optimize:images'] =
        'node scripts/image-optimizer.js';
      packageJson.scripts['optimize:performance'] =
        'node scripts/performance-automation.js';
      packageJson.scripts['build:optimized'] =
        'npm run optimize:images && npm run build';

      await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json with optimization scripts');
    } catch (error) {
      console.log(`⚠️  Failed to update package.json: ${error.message}`);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new ImageOptimizer();
  optimizer.run();
}

export default ImageOptimizer;
