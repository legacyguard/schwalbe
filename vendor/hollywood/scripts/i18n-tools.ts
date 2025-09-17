#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface TranslationModule {
  dependencies: string[];
  keys: Record<string, any>;
  language: string;
  lineCount: number;
  namespace: string;
  path: string;
}

interface TranslationReport {
  issues: TranslationIssue[];
  languages: string[];
  namespaces: string[];
  suggestions: string[];
  totalFiles: number;
  totalKeys: number;
  totalLines: number;
}

interface TranslationIssue {
  file?: string;
  key?: string;
  message: string;
  severity: 'error' | 'info' | 'warning';
  type: 'consistency' | 'duplicate' | 'missing' | 'size' | 'unused';
}

class TranslationOrganizer {
  private modules: Map<string, TranslationModule> = new Map();
  private readonly MAX_LINES = 500;
  private readonly MIN_LINES = 50;
  private readonly LOCALES_DIR = path.join(process.cwd(), 'public', 'locales');

  async analyzeCurrentStructure(): Promise<TranslationReport> {
    // 🔍 Analyzing translation structure...

    const files = await glob('**/*.json', {
      cwd: this.LOCALES_DIR,
      ignore: ['**/node_modules/**'],
    });

    const report: TranslationReport = {
      totalFiles: 0,
      totalKeys: 0,
      totalLines: 0,
      languages: new Set<string>(),
      namespaces: new Set<string>(),
      issues: [],
      suggestions: [],
    };

    for (const file of files) {
      const filePath = path.join(this.LOCALES_DIR, file);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const json = JSON.parse(content);

      const parts = file.split('/');
      const language = parts[0];
      const namespace =
        parts.slice(1, -1).join('/') || path.basename(file, '.json');

      const module: TranslationModule = {
        namespace,
        keys: json,
        lineCount: content.split('\n').length,
        dependencies: this.findDependencies(json),
        language,
        path: filePath,
      };

      this.modules.set(`${language}/${namespace}`, module);

      report.totalFiles++;
      report.totalKeys += this.countKeys(json);
      report.totalLines += module.lineCount;
      (report.languages as Set<string>).add(language);
      (report.namespaces as Set<string>).add(namespace);

      // Check for issues
      if (module.lineCount > this.MAX_LINES) {
        report.issues.push({
          type: 'size',
          severity: 'warning',
          message: `File too large (${module.lineCount} lines)`,
          file: file,
        });
        report.suggestions.push(
          `Consider splitting ${file} into smaller modules`
        );
      }

      if (module.lineCount < this.MIN_LINES && !file.includes('jurisdiction')) {
        report.issues.push({
          type: 'size',
          severity: 'info',
          message: `File too small (${module.lineCount} lines)`,
          file: file,
        });
        report.suggestions.push(
          `Consider merging ${file} with related modules`
        );
      }
    }

    // Convert Sets to arrays
    report.languages = Array.from(report.languages as Set<string>);
    report.namespaces = Array.from(report.namespaces as Set<string>);

    // Check for missing translations
    this.checkMissingTranslations(report);

    // Check for consistency
    this.checkConsistency(report);

    return report;
  }

  private countKeys(obj: unknown, count = 0): number {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count = this.countKeys(obj[key], count);
      } else {
        count++;
      }
    }
    return count;
  }

  private findDependencies(json: any): string[] {
    const deps: string[] = [];
    const jsonStr = JSON.stringify(json);

    // Look for interpolation patterns that might reference other namespaces
    const matches = jsonStr.match(/{{[^}]+}}/g) || [];
    for (const match of matches) {
      if (match.includes(':')) {
        const ns = match.split(':')[0].replace('{{', '').trim();
        if (!deps.includes(ns)) {
          deps.push(ns);
        }
      }
    }

    return deps;
  }

  private checkMissingTranslations(report: TranslationReport) {
    const baseLanguage = 'en';
    const baseNamespaces = new Set<string>();

    // Collect all namespaces from base language
    for (const [, module] of this.modules) {
      if (module.language === baseLanguage) {
        baseNamespaces.add(module.namespace);
      }
    }

    // Check if all languages have all namespaces
    for (const language of report.languages) {
      if (language === baseLanguage) continue;

      for (const namespace of baseNamespaces) {
        const key = `${language}/${namespace}`;
        if (!this.modules.has(key)) {
          report.issues.push({
            type: 'missing',
            severity: 'error',
            message: `Missing translation file for ${namespace}`,
            file: `${language}/${namespace}.json`,
          });
        }
      }
    }
  }

  private checkConsistency(report: TranslationReport) {
    // Group modules by namespace
    const namespaceGroups = new Map<string, TranslationModule[]>();

    for (const [, module] of this.modules) {
      if (!namespaceGroups.has(module.namespace)) {
        namespaceGroups.set(module.namespace, []);
      }
      const group = namespaceGroups.get(module.namespace);
      if (group) {
        group.push(module);
      }
    }

    // Check key consistency within each namespace across languages
    for (const [namespace, modules] of namespaceGroups) {
      if (modules.length < 2) continue;

      const baseModule = modules.find(m => m.language === 'en') || modules[0];
      const baseKeys = this.extractKeys(baseModule.keys);

      for (const module of modules) {
        if (module === baseModule) continue;

        const keys = this.extractKeys(module.keys);

        // Check for missing keys
        for (const key of baseKeys) {
          if (!keys.has(key)) {
            report.issues.push({
              type: 'consistency',
              severity: 'warning',
              message: `Missing key "${key}" in ${module.language}`,
              file: `${module.language}/${namespace}`,
              key,
            });
          }
        }

        // Check for extra keys
        for (const key of keys) {
          if (!baseKeys.has(key)) {
            report.issues.push({
              type: 'unused',
              severity: 'info',
              message: `Extra key "${key}" in ${module.language}`,
              file: `${module.language}/${namespace}`,
              key,
            });
          }
        }
      }
    }
  }

  private extractKeys(obj: unknown, prefix = ''): Set<string> {
    const keys = new Set<string>();

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const subKeys = this.extractKeys(obj[key], fullKey);
        subKeys.forEach(k => keys.add(k));
      } else {
        keys.add(fullKey);
      }
    }

    return keys;
  }

  async suggestOptimalSplit(namespace: string, language = 'en') {
    const key = `${language}/${namespace}`;
    const module = this.modules.get(key);

    if (!module) {
      // console.error(`Module ${key} not found`);
      return;
    }

    if (module.lineCount <= this.MAX_LINES) {
      // console.log(`Module ${key} is already within size limits`);
      return;
    }

    // console.log(`\n📊 Suggested split for ${key}:`);

    // Analyze the structure and suggest splits
    const topLevelKeys = Object.keys(module.keys);
    const keyCounts = new Map<string, number>();

    for (const key of topLevelKeys) {
      const count = this.countKeys(module.keys[key]);
      keyCounts.set(key, count);
    }

    // Group keys into suggested files
    const suggestions: Array<{
      estimatedLines: number;
      file: string;
      keys: string[];
    }> = [];
    let currentSuggestion = { file: '', keys: [], estimatedLines: 0 };

    for (const [key, count] of keyCounts) {
      const estimatedLines = Math.ceil(count * 3); // Rough estimate

      if (currentSuggestion.estimatedLines + estimatedLines > this.MAX_LINES) {
        if (currentSuggestion.keys.length > 0) {
          suggestions.push({ ...currentSuggestion });
        }
        currentSuggestion = {
          file: `${namespace}/${key}`,
          keys: [key],
          estimatedLines,
        };
      } else {
        currentSuggestion.keys.push(key);
        currentSuggestion.estimatedLines += estimatedLines;
        if (!currentSuggestion.file) {
          currentSuggestion.file = `${namespace}/${key}`;
        }
      }
    }

    if (currentSuggestion.keys.length > 0) {
      suggestions.push(currentSuggestion);
    }

    for (const _suggestion of suggestions) {
      // console.log(`  - ${_suggestion.file}.json`);
      // console.log(`    Keys: ${_suggestion.keys.join(', ')}`);
      // console.log(`    Estimated lines: ${_suggestion.estimatedLines}`);
    }
  }

  async validate(): Promise<boolean> {
    const report = await this.analyzeCurrentStructure();

    // console.log('\n📊 Translation Structure Report');
    // console.log('================================');
    // console.log(`Total Files: ${report.totalFiles}`);
    // console.log(`Total Keys: ${report.totalKeys}`);
    // console.log(`Total Lines: ${report.totalLines}`);
    // console.log(`Languages: ${report.languages.join(', ')}`);
    // console.log(`Namespaces: ${report.namespaces.length}`);

    if (report.issues.length > 0) {
      // console.log('\n⚠️  Issues Found:');

      const errors = report.issues.filter(i => i.severity === 'error');
      const warnings = report.issues.filter(i => i.severity === 'warning');
      const info = report.issues.filter(i => i.severity === 'info');

      if (errors.length > 0) {
        // console.log('\n❌ Errors:');
        for (const issue of errors) {
          // console.log(`  - ${issue.message}`);
          if (issue.file) {
            // console.log(`    File: ${issue.file}`);
          }
        }
      }

      if (warnings.length > 0) {
        // console.log('\n⚠️  Warnings:');
        for (const issue of warnings) {
          // console.log(`  - ${issue.message}`);
          if (issue.file) {
            // console.log(`    File: ${issue.file}`);
          }
        }
      }

      if (info.length > 0) {
        // console.log('\nℹ️  Info:');
        for (const issue of info) {
          // console.log(`  - ${issue.message}`);
          if (issue.file) {
            // console.log(`    File: ${issue.file}`);
          }
        }
      }
    }

    if (report.suggestions.length > 0) {
      // console.log('\n💡 Suggestions:');
      for (const _suggestion of report.suggestions) {
        // console.log(`  - ${_suggestion}`);
      }
    }

    // Save report
    const reportPath = path.join(process.cwd(), 'i18n-report.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    // console.log(`\n📝 Detailed report saved to: ${reportPath}`);

    return report.issues.filter(i => i.severity === 'error').length === 0;
  }

  async generateCoverage() {
    const report = await this.analyzeCurrentStructure();

    const coverage: Record<string, Record<string, number>> = {};

    for (const namespace of report.namespaces) {
      coverage[namespace] = {};

      for (const language of report.languages) {
        const key = `${language}/${namespace}`;
        const module = this.modules.get(key);

        if (module) {
          const baseKey = `en/${namespace}`;
          const baseModule = this.modules.get(baseKey);

          if (baseModule) {
            const baseKeyCount = this.countKeys(baseModule.keys);
            const keyCount = this.countKeys(module.keys);
            coverage[namespace][language] = Math.round(
              (keyCount / baseKeyCount) * 100
            );
          } else {
            coverage[namespace][language] = 100;
          }
        } else {
          coverage[namespace][language] = 0;
        }
      }
    }

    // console.log('\n📊 Translation Coverage Report');
    // console.log('================================');

    // Print table header
    const languages = report.languages;
    // console.log(`Namespace${' '.repeat(20)}${languages.map(l => l.padEnd(10)).join('')}`);
    // console.log('-'.repeat(20 + languages.length * 10));

    for (const [namespace, langCoverage] of Object.entries(coverage)) {
      const _row = namespace.padEnd(20);
      const _values = languages
        .map(lang => {
          const percent = langCoverage[lang];
          const emoji = percent === 100 ? '✅' : percent >= 80 ? '🟡' : '❌';
          return `${percent}% ${emoji}`.padEnd(10);
        })
        .join('');
      // console.log(_row + _values);
    }

    // Calculate overall coverage
    const overallCoverage: Record<string, number> = {};
    for (const language of languages) {
      let total = 0;
      let count = 0;
      for (const langCoverage of Object.values(coverage)) {
        total += langCoverage[language];
        count++;
      }
      overallCoverage[language] = Math.round(total / count);
    }

    // console.log('-'.repeat(20 + languages.length * 10));
    // console.log(`${'OVERALL'.padEnd(20)}${languages.map(l => `${overallCoverage[l]}%`.padEnd(10)).join('')}`);
  }
}

// CLI
async function main() {
  const command = process.argv[2];
  const organizer = new TranslationOrganizer();

  switch (command) {
    case 'analyze': {
      const _report = await organizer.analyzeCurrentStructure();
      // console.log('\n✅ Analysis complete');
      break;
    }

    case 'validate': {
      const isValid = await organizer.validate();
      process.exit(isValid ? 0 : 1);
      break;
    }

    case 'coverage': {
      await organizer.generateCoverage();
      break;
    }

    case 'split': {
      const namespace = process.argv[3];
      const language = process.argv[4] || 'en';
      if (!namespace) {
        // console.error('Usage: npm run i18n:split <namespace> [language]');
        process.exit(1);
      }
      await organizer.suggestOptimalSplit(namespace, language);
      break;
    }

    default:
      // console.log('Usage: npm run i18n:<command>');
      // console.log('Commands:');
      // console.log('  analyze   - Analyze current translation structure');
      // console.log('  validate  - Validate translations for consistency');
      // console.log('  coverage  - Generate coverage report');
      // console.log('  split     - Suggest optimal file splits');
      process.exit(1);
  }
}

main().catch(console.error);
