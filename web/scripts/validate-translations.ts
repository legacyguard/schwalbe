#!/usr/bin/env node

/**
 * Translation Validation Script for LegacyGuard
 * Detects remaining hardcoded strings and unused translation keys
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  file: string;
  hardcodedStrings: Array<{
    content: string;
    line: number;
    suggestion?: string;
  }>;
  missingKeys: string[];
  unusedKeys: string[];
}

class TranslationValidator {
  private results: ValidationResult[] = [];
  private translationKeys = new Set<string>();
  private usedKeys = new Set<string>();

  private componentPaths = [
    'src/components',
    'src/pages',
  ];

  constructor() {
    this.loadTranslationKeys();
  }

  private loadTranslationKeys(): void {
    const translationFiles = [
      'public/locales/ui/en.json',
      'public/locales/ui/landing-page.en.json',
      'public/locales/ui/sk.json',
      'public/locales/ui/landing-page.sk.json'
    ];

    translationFiles.forEach(filePath => {
      const fullPath = path.join('/Users/luborfedak/Documents/Github/hollywood/web', filePath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          this.extractKeys(content, '');
        } catch (error) {
          console.warn(`Failed to parse ${filePath}:`, error);
        }
      }
    });

    // console.log(`Loaded ${this.translationKeys.size} translation keys`);
  }

  private extractKeys(obj: any, prefix: string): void {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.extractKeys(obj[key], fullKey);
      } else {
        this.translationKeys.add(fullKey);
      }
    });
  }

  private scanFileForHardcodedStrings(filePath: string): ValidationResult {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const hardcodedStrings: ValidationResult['hardcodedStrings'] = [];

    // Track t() function usage
    const tFunctionRegex = /t\(['"`]([^'"`]+)['"`]\)/g;
    let match;
    while ((match = tFunctionRegex.exec(content)) !== null) {
      this.usedKeys.add(match[1]);
    }

    lines.forEach((line, index) => {
      // Skip imports, comments, and console statements
      if (
        line.trim().startsWith('//') ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*') ||
        line.includes('import ') ||
        line.includes('console.') ||
        line.includes('className=') ||
        line.includes('style=') ||
        line.includes('fill=') ||
        line.includes('stroke=') ||
        line.includes('viewBox=') ||
        line.includes('d=') ||
        line.includes('preserveAspectRatio=') ||
        line.includes('clipPath=')
      ) {
        return;
      }

      // Find potential hardcoded strings
      const stringRegex = /(['"`])([^'"`\n]{3,})\1/g;
      let stringMatch;

      while ((stringMatch = stringRegex.exec(line)) !== null) {
        const stringValue = stringMatch[2];

        // Skip if it's a translation function call
        if (line.includes(`t('${stringValue}')`) || line.includes(`t("${stringValue}")`)) {
          continue;
        }

        // Skip technical strings
        if (
          /^[a-zA-Z-]+$/.test(stringValue) && stringValue.length < 5 || // Short technical terms
          /^(flex|grid|absolute|relative|fixed|static|inline|block|hidden|visible|opacity|duration|ease|spring|linear)/.test(stringValue) || // CSS classes
          /^(rgba|rgb|hsl)\(/.test(stringValue) || // Color values
          /^[0-9.]+(%|px|rem|em|vh|vw|ms|s)$/.test(stringValue) || // CSS units
          /^[A-Z_]+$/.test(stringValue) || // Constants
          /^[a-z][a-zA-Z0-9]*$/.test(stringValue) && stringValue.length < 8 // Short camelCase
        ) {
          continue;
        }

        // Check if it looks like user-facing text
        if (
          stringValue.includes(' ') || // Contains spaces
          /^[A-Z]/.test(stringValue) || // Starts with capital
          stringValue.includes('!') || stringValue.includes('?') || stringValue.includes('.') || // Contains punctuation
          stringValue.length > 15 // Longer strings
        ) {
          hardcodedStrings.push({
            line: index + 1,
            content: stringValue,
            suggestion: this.suggestTranslationKey(stringValue)
          });
        }
      }
    });

    return {
      file: filePath,
      hardcodedStrings,
      unusedKeys: [],
      missingKeys: []
    };
  }

  private suggestTranslationKey(text: string): string {
    const cleanText = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.')
      .substring(0, 40);

    return `common.${cleanText}`;
  }

  private scanDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      console.warn(`Directory ${dir} does not exist`);
      return;
    }

    const entries = fs.readdirSync(dir);

    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        this.scanDirectory(fullPath);
      } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.ts'))) {
        // Skip test files and stories
        if (!entry.includes('.test.') && !entry.includes('.spec.') && !entry.includes('.stories.')) {
          const result = this.scanFileForHardcodedStrings(fullPath);
          if (result.hardcodedStrings.length > 0) {
            this.results.push(result);
          }
        }
      }
    });
  }

  private findUnusedKeys(): string[] {
    const unusedKeys: string[] = [];

    this.translationKeys.forEach(key => {
      if (!this.usedKeys.has(key)) {
        unusedKeys.push(key);
      }
    });

    return unusedKeys;
  }

  public validate(): void {
    // console.log('🔍 Validating translations in LegacyGuard components...\n');

    this.componentPaths.forEach(componentPath => {
      const fullPath = path.join('/Users/luborfedak/Documents/Github/hollywood/web', componentPath);
      // console.log(`📂 Scanning ${componentPath}...`);
      this.scanDirectory(fullPath);
    });

    const unusedKeys = this.findUnusedKeys();

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesScanned: this.results.length,
        totalHardcodedStrings: this.results.reduce((acc, r) => acc + r.hardcodedStrings.length, 0),
        unusedKeys: unusedKeys.length,
        translationKeysTotal: this.translationKeys.size,
        keysInUse: this.usedKeys.size
      },
      hardcodedStringsByFile: this.results.map(r => ({
        file: r.file.replace('/Users/luborfedak/Documents/Github/hollywood/web/', ''),
        count: r.hardcodedStrings.length,
        strings: r.hardcodedStrings
      })),
      unusedKeys: unusedKeys.sort(),
      topFiles: this.results
        .sort((a, b) => b.hardcodedStrings.length - a.hardcodedStrings.length)
        .slice(0, 10)
        .map(r => ({
          file: r.file.replace('/Users/luborfedak/Documents/Github/hollywood/web/', ''),
          count: r.hardcodedStrings.length
        }))
    };

    fs.writeFileSync('/Users/luborfedak/Documents/Github/hollywood/web/translation-validation-report.json', JSON.stringify(report, null, 2));

    // console.log('\n📊 Validation Report:');
    // console.log(`   📝 Files with hardcoded strings: ${report.summary.filesScanned}`);
    // console.log(`   🔤 Total hardcoded strings found: ${report.summary.totalHardcodedStrings}`);
    // console.log(`   📚 Translation keys available: ${report.summary.translationKeysTotal}`);
    // console.log(`   ✅ Translation keys in use: ${report.summary.keysInUse}`);
    // console.log(`   🗑️  Unused translation keys: ${report.summary.unusedKeys}`);

    if (report.topFiles.length > 0) {
      // console.log('\n🔥 Top files needing attention:');
      report.topFiles.forEach(file => {
        // console.log(`   ${file.file}: ${file.count} hardcoded strings`);
      });
    }

    if (report.summary.totalHardcodedStrings === 0) {
      // console.log('\n✨ Congratulations! No hardcoded strings found!');
    } else {
      // console.log('\n📄 Check translation-validation-report.json for detailed analysis.');
    }
  }
}

// Run the validator
const validator = new TranslationValidator();
validator.validate();
