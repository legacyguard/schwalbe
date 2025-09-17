#!/usr/bin/env node

/**
 * Advanced Hardcoded String Extraction Script for LegacyGuard
 * Extracts hardcoded strings from TypeScript/React files and generates translation keys
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExtractedString {
  category: 'action' | 'content' | 'error' | 'label' | 'ui';
  context: string;
  file: string;
  line: number;
  suggestedKey: string;
  value: string;
}

class HardcodedStringExtractor {
  private extractedStrings: ExtractedString[] = [];
  private excludePatterns = [
    /^[0-9]+$/, // Pure numbers
    /^[a-zA-Z]$/, // Single letters
    /^[.,:;!?-]+$/, // Punctuation only
    /^(true|false|null|undefined)$/, // JavaScript literals
    /^\s*$/, // Empty or whitespace only
    /^(px|rem|em|%|vh|vw)$/, // CSS units
    /^#[0-9a-fA-F]{3,6}$/, // Hex colors
    /^rgb\(/, // RGB colors
    /^https?:\/\//, // URLs
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Email addresses
    /^[A-Z_]+$/, // Constants (all caps with underscores)
    /^[a-z][a-zA-Z0-9]*$/, // Variable names (camelCase)
    /^\/[^/]/, // File paths
    /^\$\{/, // Template literals
    /console\.(log|error|warn|info)/, // Console statements
    /import\s+/, // Import statements
    /export\s+/, // Export statements
  ];

  private componentPaths = [
    'src/components',
    'src/pages',
    'src/hooks',
    'src/contexts',
  ];

  private isHardcodedString(str: string): boolean {
    // Skip if matches exclude patterns
    if (this.excludePatterns.some(pattern => pattern.test(str))) {
      return false;
    }

    // Must be at least 3 characters
    if (str.length < 3) {
      return false;
    }

    // Should contain at least one letter or space
    if (!/[a-zA-Z\s]/.test(str)) {
      return false;
    }

    return true;
  }

  private categorizeString(str: string, context: string): ExtractedString['category'] {
    const lowerStr = str.toLowerCase();
    const lowerContext = context.toLowerCase();

    if (lowerStr.includes('error') || lowerStr.includes('failed') || lowerStr.includes('invalid')) {
      return 'error';
    }

    if (lowerStr.match(/^(save|cancel|delete|create|update|submit|continue|back|next|finish|close|open)$/i)) {
      return 'action';
    }

    if (lowerContext.includes('label') || lowerContext.includes('placeholder') || lowerStr.endsWith(':')) {
      return 'label';
    }

    if (str.length > 50 || str.includes('.') || str.includes('!')) {
      return 'content';
    }

    return 'ui';
  }

  private generateTranslationKey(str: string, category: string, file: string): string {
    // Get component/page name from file path
    const fileName = path.basename(file, '.tsx').toLowerCase();
    // Clean and convert string to key format
    const cleanStr = str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);

    // Create hierarchical key
    if (category === 'action') {
      return `common.actions.${cleanStr}`;
    }

    if (category === 'error') {
      return `common.errors.${cleanStr}`;
    }

    if (category === 'label') {
      return `common.labels.${cleanStr}`;
    }

    // Component-specific key
    const component = fileName.replace(/page$/, '').replace(/component$/, '');
    return `${component}.${cleanStr}`;
  }

  private extractStringsFromFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Regex patterns for different string contexts
      const patterns = [
        // JSX text content
        {
          regex: />[^<]*?(['"`])([^'"`\n]{3,})\1[^<]*?</g,
          context: 'jsx_text'
        },
        // JSX attributes
        {
          regex: /\s+\w+\s*=\s*(['"`])([^'"`\n]{3,})\1/g,
          context: 'jsx_attribute'
        },
        // Object properties
        {
          regex: /['"`]([^'"`\n]{3,})['"`]\s*:\s*['"`]([^'"`\n]{3,})['"`]/g,
          context: 'object_property'
        },
        // Function arguments
        {
          regex: /\(\s*(['"`])([^'"`\n]{3,})\1\s*[,)]/g,
          context: 'function_argument'
        },
        // Variable assignments
        {
          regex: /=\s*(['"`])([^'"`\n]{3,})\1/g,
          context: 'variable_assignment'
        }
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(content)) !== null) {
          const stringValue = pattern.context === 'object_property' ? match[2] : match[2];
          if (this.isHardcodedString(stringValue)) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const category = this.categorizeString(stringValue, pattern.context);
            const suggestedKey = this.generateTranslationKey(stringValue, category, filePath);

            // Check if already exists
            if (!this.extractedStrings.some(s => s.value === stringValue && s.file === filePath)) {
              this.extractedStrings.push({
                value: stringValue,
                file: filePath,
                line: lineNumber,
                context: pattern.context,
                suggestedKey,
                category
              });
            }
          }
        }
      });

    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
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
          this.extractStringsFromFile(fullPath);
        }
      }
    });
  }

  private generateTranslationFiles(): void {
    // Group by category and component
    const groupedStrings: Record<string, Record<string, string>> = {};

    this.extractedStrings.forEach(str => {
      const keyParts = str.suggestedKey.split('.');
      let current = groupedStrings;

      // Create nested structure
      keyParts.slice(0, -1).forEach(part => {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as Record<string, string>;
      });

      const lastKey = keyParts[keyParts.length - 1];
      current[lastKey] = str.value;
    });

    // Write English translation file
    const enTranslations = JSON.stringify(groupedStrings, null, 2);
    fs.writeFileSync('/Users/luborfedak/Documents/Github/hollywood/web/public/locales/ui/en.json', enTranslations);

    // Generate Slovak template (keys only for manual translation)
    const skTemplate = this.generateSkeletonTranslations(groupedStrings);
    fs.writeFileSync('/Users/luborfedak/Documents/Github/hollywood/web/public/locales/ui/sk.json', JSON.stringify(skTemplate, null, 2));

    // console.log(`✅ Generated translation files:`);
    // console.log(`   📁 public/locales/ui/en.json (${Object.keys(this.extractedStrings).length} strings)`);
    // console.log(`   📁 public/locales/ui/sk.json (template for translation)`);
  }

  private generateSkeletonTranslations(obj: any): any {
    if (typeof obj === 'string') {
      return `[TO_TRANSLATE] ${obj}`;
    }

    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.generateSkeletonTranslations(value);
      }
      return result;
    }

    return obj;
  }

  private generateReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      totalStrings: this.extractedStrings.length,
      byCategory: this.extractedStrings.reduce((acc, str) => {
        acc[str.category] = (acc[str.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byFile: this.extractedStrings.reduce((acc, str) => {
        const relativePath = str.file.replace('/Users/luborfedak/Documents/Github/hollywood/web/', '');
        acc[relativePath] = (acc[relativePath] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      topFiles: Object.entries(
        this.extractedStrings.reduce((acc, str) => {
          const relativePath = str.file.replace('/Users/luborfedak/Documents/Github/hollywood/web/', '');
          acc[relativePath] = (acc[relativePath] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
    };

    fs.writeFileSync('/Users/luborfedak/Documents/Github/hollywood/web/hardcoded-strings-report.json', JSON.stringify(report, null, 2));

    // console.log('\n📊 Extraction Report:');
    // console.log(`   📝 Total hardcoded strings found: ${report.totalStrings}`);
    // console.log(`   📂 Files processed: ${Object.keys(report.byFile).length}`);
    // console.log('\n📋 By Category:');
    Object.entries(report.byCategory).forEach(([category, count]) => {
      // console.log(`   ${category}: ${count}`);
    });
    // console.log('\n🔥 Top files with most hardcoded strings:');
    report.topFiles.forEach(([file, count]) => {
      // console.log(`   ${file}: ${count}`);
    });
  }

  public run(): void {
    // console.log('🔍 Extracting hardcoded strings from LegacyGuard components...\n');

    this.componentPaths.forEach(componentPath => {
      const fullPath = path.join('/Users/luborfedak/Documents/Github/hollywood/web', componentPath);
      // console.log(`📂 Scanning ${componentPath}...`);
      this.scanDirectory(fullPath);
    });

    this.generateTranslationFiles();
    this.generateReport();

    // console.log('\n✨ Hardcoded string extraction completed successfully!');
    // console.log('📄 Check hardcoded-strings-report.json for detailed analysis.');
  }
}

// Run the extractor
const extractor = new HardcodedStringExtractor();
extractor.run();
