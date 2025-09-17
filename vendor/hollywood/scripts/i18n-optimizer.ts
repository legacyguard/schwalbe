#!/usr/bin/env tsx
/**
 * i18n Translation Files Optimizer
 * Monitors and automatically splits translation files that exceed size limits
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Configuration
const CONFIG = {
  MAX_LINES: 700,
  WARNING_THRESHOLD: 600,
  MIN_LINES: 50, // Don't create files smaller than this
  LOCALES_DIR: './locales',
  BACKUP_DIR: './locales/_backups',
  REPORT_FILE: './locales/_health-report.json',

  // Splitting strategies
  SPLIT_STRATEGIES: {
    BY_PREFIX: ['common', 'features', 'legal'],
    BY_DEPTH: 3, // Max nesting depth before splitting
    BY_CATEGORY: true,
  },
};

interface TranslationFile {
  depth: number;
  keys: number;
  lines: number;
  namespace: string;
  path: string;
  size: number;
}

interface SplitSuggestion {
  file: string;
  reason: string;
  suggestedSplits: {
    estimatedLines: number;
    keys: string[];
    newFile: string;
  }[];
}

class I18nOptimizer {
  private files: TranslationFile[] = [];
  private issues: SplitSuggestion[] = [];

  async analyze(): Promise<void> {
    console.log('🔍 Analyzing translation files...\n');

    const pattern = path.join(CONFIG.LOCALES_DIR, '**/*.json');
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/_*'],
    });

    for (const file of files) {
      await this.analyzeFile(file);
    }

    this.generateReport();
  }

  private async analyzeFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      const json = JSON.parse(content);
      const keys = this.countKeys(json);
      const depth = this.getMaxDepth(json);
      const size = Buffer.byteLength(content, 'utf8');
      const namespace = this.extractNamespace(filePath);

      const fileInfo: TranslationFile = {
        path: filePath,
        lines,
        keys,
        size,
        depth,
        namespace,
      };

      this.files.push(fileInfo);

      // Check if file needs optimization
      if (lines > CONFIG.MAX_LINES) {
        console.log(`❌ ${filePath}: ${lines} lines (EXCEEDS LIMIT)`);
        this.generateSplitSuggestion(fileInfo, json);
      } else if (lines > CONFIG.WARNING_THRESHOLD) {
        console.log(`⚠️  ${filePath}: ${lines} lines (approaching limit)`);
      } else {
        console.log(`✅ ${filePath}: ${lines} lines`);
      }
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error);
    }
  }

  private countKeys(obj: any, count = 0): number {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count = this.countKeys(obj[key], count);
      } else {
        count++;
      }
    }
    return count;
  }

  private getMaxDepth(obj: any, currentDepth = 0): number {
    if (typeof obj !== 'object' || obj === null) return currentDepth;

    let maxDepth = currentDepth;
    for (const key in obj) {
      const depth = this.getMaxDepth(obj[key], currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
    return maxDepth;
  }

  private extractNamespace(filePath: string): string {
    const relative = path.relative(CONFIG.LOCALES_DIR, filePath);
    return relative
      .replace(/\\/g, '/')
      .replace('.json', '')
      .replace(/\//g, '.');
  }

  private generateSplitSuggestion(file: TranslationFile, content: any): void {
    const suggestion: SplitSuggestion = {
      file: file.path,
      reason: `File exceeds ${CONFIG.MAX_LINES} lines (current: ${file.lines})`,
      suggestedSplits: [],
    };

    // Strategy 1: Split by top-level keys
    const topLevelKeys = Object.keys(content);
    if (topLevelKeys.length > 1) {
      const keysPerFile = Math.ceil(
        topLevelKeys.length / Math.ceil(file.lines / CONFIG.MAX_LINES)
      );

      for (let i = 0; i < topLevelKeys.length; i += keysPerFile) {
        const keys = topLevelKeys.slice(i, i + keysPerFile);
        const estimatedLines = Math.floor(
          file.lines * (keys.length / topLevelKeys.length)
        );

        suggestion.suggestedSplits.push({
          newFile: this.generateNewFileName(file.path, keys[0]),
          keys,
          estimatedLines,
        });
      }
    }

    // Strategy 2: Split by common prefixes
    const prefixGroups = this.groupByPrefix(content);
    if (prefixGroups.size > 1) {
      prefixGroups.forEach((keys, prefix) => {
        const estimatedLines = this.estimateLines(content, keys);
        if (estimatedLines > CONFIG.MIN_LINES) {
          suggestion.suggestedSplits.push({
            newFile: this.generateNewFileName(file.path, prefix),
            keys,
            estimatedLines,
          });
        }
      });
    }

    this.issues.push(suggestion);
  }

  private groupByPrefix(obj: any): Map<string, string[]> {
    const groups = new Map<string, string[]>();

    for (const key in obj) {
      const prefix = key.split(/[._-]/)[0];
      if (!groups.has(prefix)) {
        groups.set(prefix, []);
      }
      groups.get(prefix)!.push(key);
    }

    return groups;
  }

  private estimateLines(fullContent: any, keys: string[]): number {
    let lineCount = 2; // For opening and closing braces

    keys.forEach(key => {
      const value = fullContent[key];
      const stringified = JSON.stringify(value, null, 2);
      lineCount += stringified.split('\n').length;
    });

    return lineCount;
  }

  private generateNewFileName(originalPath: string, suffix: string): string {
    const dir = path.dirname(originalPath);
    const ext = path.extname(originalPath);
    const base = path.basename(originalPath, ext);

    // Clean suffix to be filename-safe
    const safeSuffix = suffix.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();

    return path.join(dir, `${base}-${safeSuffix}${ext}`);
  }

  async autoSplit(dryRun = true): Promise<void> {
    console.log(`\n🔄 ${dryRun ? 'Simulating' : 'Executing'} auto-split...\n`);

    for (const issue of this.issues) {
      console.log(`Processing: ${issue.file}`);

      if (!dryRun) {
        await this.executeSplit(issue);
      } else {
        console.log('  Suggested splits:');
        issue.suggestedSplits.forEach(split => {
          console.log(
            `    - ${split.newFile} (~${split.estimatedLines} lines)`
          );
          console.log(`      Keys: ${split.keys.join(', ')}`);
        });
      }
    }
  }

  private async executeSplit(suggestion: SplitSuggestion): Promise<void> {
    // Backup original file
    const backupPath = path.join(
      CONFIG.BACKUP_DIR,
      `${Date.now()}_${path.basename(suggestion.file)}`
    );
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.copyFileSync(suggestion.file, backupPath);

    // Read original content
    const originalContent = JSON.parse(
      fs.readFileSync(suggestion.file, 'utf8')
    );

    // Create new files
    for (const split of suggestion.suggestedSplits) {
      const newContent: any = {};

      split.keys.forEach(key => {
        newContent[key] = originalContent[key];
        delete originalContent[key]; // Remove from original
      });

      // Write new file
      fs.writeFileSync(split.newFile, JSON.stringify(newContent, null, 2));
      console.log(`  ✅ Created: ${split.newFile}`);
    }

    // Update original file with remaining content
    if (Object.keys(originalContent).length > 0) {
      fs.writeFileSync(
        suggestion.file,
        JSON.stringify(originalContent, null, 2)
      );
      console.log(`  ✅ Updated: ${suggestion.file}`);
    } else {
      // If nothing remains, delete the original
      fs.unlinkSync(suggestion.file);
      console.log(`  🗑️  Removed empty: ${suggestion.file}`);
    }
  }

  private generateReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.files.length,
        oversizedFiles: this.issues.length,
        warningFiles: this.files.filter(
          f => f.lines > CONFIG.WARNING_THRESHOLD && f.lines <= CONFIG.MAX_LINES
        ).length,
        healthyFiles: this.files.filter(
          f => f.lines <= CONFIG.WARNING_THRESHOLD
        ).length,
        totalLines: this.files.reduce((sum, f) => sum + f.lines, 0),
        totalKeys: this.files.reduce((sum, f) => sum + f.keys, 0),
        totalSize: this.files.reduce((sum, f) => sum + f.size, 0),
      },
      files: this.files.sort((a, b) => b.lines - a.lines),
      issues: this.issues,
      recommendations: this.generateRecommendations(),
    };

    fs.writeFileSync(CONFIG.REPORT_FILE, JSON.stringify(report, null, 2));
    console.log(`\n📊 Report saved to: ${CONFIG.REPORT_FILE}`);

    // Print summary
    console.log('\n📈 Summary:');
    console.log(`  Total files: ${report.summary.totalFiles}`);
    console.log(`  Oversized: ${report.summary.oversizedFiles} ❌`);
    console.log(`  Warning: ${report.summary.warningFiles} ⚠️`);
    console.log(`  Healthy: ${report.summary.healthyFiles} ✅`);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for very small files that could be merged
    const smallFiles = this.files.filter(f => f.lines < CONFIG.MIN_LINES);
    if (smallFiles.length > 1) {
      recommendations.push(
        `Consider merging ${smallFiles.length} files with less than ${CONFIG.MIN_LINES} lines`
      );
    }

    // Check for files approaching limit
    const warningFiles = this.files.filter(
      f => f.lines > CONFIG.WARNING_THRESHOLD && f.lines <= CONFIG.MAX_LINES
    );
    if (warningFiles.length > 0) {
      recommendations.push(
        `${warningFiles.length} files are approaching the line limit and should be refactored soon`
      );
    }

    // Check for deep nesting
    const deeplyNested = this.files.filter(
      f => f.depth > CONFIG.SPLIT_STRATEGIES.BY_DEPTH
    );
    if (deeplyNested.length > 0) {
      recommendations.push(
        `${deeplyNested.length} files have deep nesting (>${CONFIG.SPLIT_STRATEGIES.BY_DEPTH} levels) and could benefit from flattening`
      );
    }

    return recommendations;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const optimizer = new I18nOptimizer();

  switch (command) {
    case 'analyze':
      await optimizer.analyze();
      break;

    case 'split':
      await optimizer.analyze();
      await optimizer.autoSplit(false);
      break;

    case 'dry-run':
    default:
      await optimizer.analyze();
      await optimizer.autoSplit(true);
      break;
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { CONFIG, I18nOptimizer };
