#!/usr/bin/env npx tsx

/**
 * @description Translation validation and coverage checker
 * Validates translation files for consistency and completeness
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

interface TranslationFile {
  path: string;
  namespace: string;
  language: string;
  keys: Set<string>;
  content: Record<string, any>;
}

interface ValidationResult {
  file: string;
  issues: string[];
  warnings: string[];
}

class TranslationValidator {
  private translationFiles: TranslationFile[] = [];
  private results: ValidationResult[] = [];

  async validateProject(): Promise<void> {
    console.log('🔍 Starting i18n validation...\n');

    // Find all translation files
    await this.findTranslationFiles();

    // Parse all files
    await this.parseTranslationFiles();

    // Run validations
    this.validateConsistency();
    this.validateCompleteness();
    this.validateSyntax();

    // Report results
    this.reportResults();
  }

  private async findTranslationFiles(): Promise<void> {
    const localesDir = 'apps/web/public/locales';

    async function walkDir(dir: string): Promise<string[]> {
      const files: string[] = [];
      const entries = await readdir(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          files.push(...await walkDir(fullPath));
        } else if (entry.endsWith('.json')) {
          files.push(fullPath);
        }
      }

      return files;
    }

    const allFiles = await walkDir(localesDir);
    console.log(`📁 Found ${allFiles.length} translation files`);
  }

  private async parseTranslationFiles(): Promise<void> {
    const localesDir = 'apps/web/public/locales';

    // Parse each file
    const files = await this.findTranslationFiles();

    for (const filePath of files) {
      try {
        const content = await readFile(filePath, 'utf-8');
        const parsed = JSON.parse(content);

        // Extract namespace and language from path
        const relativePath = relative(localesDir, filePath);
        const pathParts = relativePath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const [namespace, language] = fileName.replace('.json', '').split('.');

        const fullNamespace = pathParts.slice(0, -1).join('/') + '/' + namespace;

        this.translationFiles.push({
          path: filePath,
          namespace: fullNamespace,
          language: language || 'en',
          keys: this.extractKeys(parsed),
          content: parsed,
        });

      } catch (error) {
        this.results.push({
          file: filePath,
          issues: [`Failed to parse JSON: ${error}`],
          warnings: [],
        });
      }
    }

    console.log(`✅ Parsed ${this.translationFiles.length} valid translation files\n`);
  }

  private extractKeys(obj: Record<string, any>, prefix = ''): Set<string> {
    const keys = new Set<string>();

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively extract nested keys
        for (const nestedKey of this.extractKeys(value, fullKey)) {
          keys.add(nestedKey);
        }
      } else {
        keys.add(fullKey);
      }
    }

    return keys;
  }

  private validateConsistency(): void {
    console.log('🔍 Validating translation consistency...');

    // Group files by namespace
    const namespaceGroups = new Map<string, TranslationFile[]>();

    for (const file of this.translationFiles) {
      if (!namespaceGroups.has(file.namespace)) {
        namespaceGroups.set(file.namespace, []);
      }
      namespaceGroups.get(file.namespace)!.push(file);
    }

    // Check consistency within each namespace
    for (const [namespace, files] of namespaceGroups) {
      if (files.length < 2) continue; // Need at least 2 languages to compare

      const englishFile = files.find(f => f.language === 'en');
      if (!englishFile) {
        console.warn(`⚠️  No English translation found for namespace: ${namespace}`);
        continue;
      }

      // Compare other languages with English
      for (const file of files) {
        if (file.language === 'en') continue;

        const issues: string[] = [];
        const warnings: string[] = [];

        // Check for missing keys
        for (const englishKey of englishFile.keys) {
          if (!file.keys.has(englishKey)) {
            issues.push(`Missing translation key: ${englishKey}`);
          }
        }

        // Check for extra keys
        for (const fileKey of file.keys) {
          if (!englishFile.keys.has(fileKey)) {
            warnings.push(`Extra translation key not in English: ${fileKey}`);
          }
        }

        if (issues.length > 0 || warnings.length > 0) {
          this.results.push({
            file: file.path,
            issues,
            warnings,
          });
        }
      }
    }
  }

  private validateCompleteness(): void {
    console.log('📊 Calculating translation completeness...');

    const languages = new Set(this.translationFiles.map(f => f.language));
    const namespaces = new Set(this.translationFiles.map(f => f.namespace));

    console.log(`\n📈 Translation Coverage Report:`);
    console.log(`Languages: ${Array.from(languages).join(', ')}`);
    console.log(`Namespaces: ${namespaces.size}\n`);

    for (const language of languages) {
      if (language === 'en') continue; // Skip English as baseline

      const languageFiles = this.translationFiles.filter(f => f.language === language);
      const englishFiles = this.translationFiles.filter(f => f.language === 'en');

      let totalKeys = 0;
      let translatedKeys = 0;

      for (const englishFile of englishFiles) {
        const correspondingFile = languageFiles.find(f => f.namespace === englishFile.namespace);

        totalKeys += englishFile.keys.size;

        if (correspondingFile) {
          // Count keys that exist in both
          for (const key of englishFile.keys) {
            if (correspondingFile.keys.has(key)) {
              translatedKeys++;
            }
          }
        }
      }

      const coverage = totalKeys > 0 ? (translatedKeys / totalKeys * 100).toFixed(1) : '0.0';
      console.log(`${language.toUpperCase()}: ${coverage}% (${translatedKeys}/${totalKeys} keys)`);
    }
  }

  private validateSyntax(): void {
    console.log('\n🔍 Validating translation syntax...');

    for (const file of this.translationFiles) {
      const issues: string[] = [];
      const warnings: string[] = [];

      // Check for common issues
      this.checkForEmptyValues(file.content, '', issues, warnings);
      this.checkForHardcodedText(file, issues, warnings);

      if (issues.length > 0 || warnings.length > 0) {
        const existingResult = this.results.find(r => r.file === file.path);
        if (existingResult) {
          existingResult.issues.push(...issues);
          existingResult.warnings.push(...warnings);
        } else {
          this.results.push({
            file: file.path,
            issues,
            warnings,
          });
        }
      }
    }
  }

  private checkForEmptyValues(obj: any, path: string, issues: string[], warnings: string[]): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        this.checkForEmptyValues(value, currentPath, issues, warnings);
      } else if (typeof value === 'string') {
        if (!value.trim()) {
          issues.push(`Empty translation value at: ${currentPath}`);
        } else if (value.length < 2) {
          warnings.push(`Very short translation at: ${currentPath}`);
        }
      }
    }
  }

  private checkForHardcodedText(file: TranslationFile, issues: string[], warnings: string[]): void {
    // Check for English text in non-English files
    if (file.language !== 'en') {
      const content = JSON.stringify(file.content).toLowerCase();

      // Common English words that shouldn't appear in translations
      const englishWords = ['password', 'email', 'login', 'register', 'submit', 'cancel'];

      for (const word of englishWords) {
        if (content.includes(`"${word}"`)) {
          warnings.push(`Possible untranslated English word: "${word}"`);
        }
      }
    }
  }

  private reportResults(): void {
    console.log('\n📋 Validation Results:\n');

    if (this.results.length === 0) {
      console.log('✅ All translation files are valid!');
      return;
    }

    let totalIssues = 0;
    let totalWarnings = 0;

    for (const result of this.results) {
      console.log(`📄 ${result.file}`);

      if (result.issues.length > 0) {
        console.log('  ❌ Issues:');
        for (const issue of result.issues) {
          console.log(`    - ${issue}`);
          totalIssues++;
        }
      }

      if (result.warnings.length > 0) {
        console.log('  ⚠️  Warnings:');
        for (const warning of result.warnings) {
          console.log(`    - ${warning}`);
          totalWarnings++;
        }
      }

      console.log('');
    }

    console.log(`\n📊 Summary: ${totalIssues} issues, ${totalWarnings} warnings`);

    if (totalIssues > 0) {
      process.exit(1);
    }
  }

  private async findTranslationFiles(): Promise<string[]> {
    const localesDir = 'apps/web/public/locales';
    const files: string[] = [];

    async function walkDir(dir: string): Promise<void> {
      const entries = await readdir(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          await walkDir(fullPath);
        } else if (entry.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    }

    await walkDir(localesDir);
    return files;
  }
}

// Run validation
async function main() {
  const validator = new TranslationValidator();
  await validator.validateProject();
}

// ES module check for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}