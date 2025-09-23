#!/usr/bin/env node

/**
 * @description Mobile i18n validation script
 * Validates inline i18n resources in mobile app
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const I18N_FILE = join(ROOT, 'apps/mobile/src/i18n.ts');

class MobileI18nValidator {
  constructor() {
    this.results = { issues: [], warnings: [] };
  }

  async validate() {
    console.log('🔍 Starting mobile i18n validation...\n');

    try {
      const content = await readFile(I18N_FILE, 'utf-8');
      const resources = this.extractResources(content);

      this.validateStructure(resources);
      this.validateCompleteness(resources);
      this.validateConsistency(resources);

      this.reportResults();
    } catch (error) {
      console.error('❌ Failed to validate mobile i18n:', error.message);
      process.exit(1);
    }
  }

  extractResources(content) {
    // Extract the resources object from the i18n.ts file
    const resourcesMatch = content.match(/const resources = (\{[\s\S]*?\n\})/);
    if (!resourcesMatch) {
      throw new Error('Could not find resources object in i18n.ts');
    }

    // Simple extraction - in a real implementation, you'd want proper AST parsing
    try {
      // This is a simplified approach - eval is dangerous but works for this controlled case
      const resourcesStr = resourcesMatch[1];
      // Remove trailing comma and add proper closing
      const cleanStr = resourcesStr.replace(/,(\s*\})/g, '$1');
      return eval(`(${cleanStr})`);
    } catch (error) {
      throw new Error('Could not parse resources object');
    }
  }

  validateStructure(resources) {
    console.log('🔍 Validating i18n structure...');

    const requiredLanguages = ['en']; // Only require English for now
    const optionalLanguages = ['cs', 'sk']; // These are planned but not required yet
    const requiredNamespaces = ['navigation', 'auth', 'common', 'screens'];

    // Check required languages
    for (const lang of requiredLanguages) {
      if (!resources[lang]) {
        this.results.issues.push(`Missing required language: ${lang}`);
        continue;
      }

      for (const ns of requiredNamespaces) {
        if (!resources[lang][ns]) {
          this.results.issues.push(`Missing namespace '${ns}' in language '${lang}'`);
        }
      }
    }

    // Check optional languages (warnings only)
    for (const lang of optionalLanguages) {
      if (!resources[lang]) {
        this.results.warnings.push(`Optional language not implemented yet: ${lang}`);
      } else {
        // If it exists, check namespaces
        for (const ns of requiredNamespaces) {
          if (!resources[lang][ns]) {
            this.results.warnings.push(`Missing namespace '${ns}' in optional language '${lang}'`);
          }
        }
      }
    }
  }

  validateCompleteness(resources) {
    console.log('📊 Calculating translation completeness...');

    const englishKeys = this.extractAllKeys(resources.en);
    const totalKeys = englishKeys.size;

    console.log(`\n📈 Mobile i18n Coverage Report:`);
    console.log(`Total keys: ${totalKeys}\n`);

    for (const [lang, langResources] of Object.entries(resources)) {
      if (lang === 'en') continue;

      const langKeys = this.extractAllKeys(langResources);
      const translatedKeys = Array.from(englishKeys).filter(key => langKeys.has(key)).length;
      const coverage = totalKeys > 0 ? ((translatedKeys / totalKeys) * 100).toFixed(1) : '0.0';

      console.log(`${lang.toUpperCase()}: ${coverage}% (${translatedKeys}/${totalKeys} keys)`);

      if (translatedKeys < totalKeys) {
        this.results.warnings.push(`Language '${lang}' is missing ${totalKeys - translatedKeys} translations`);
      }
    }
  }

  validateConsistency(resources) {
    console.log('\n🔍 Validating translation consistency...');

    const englishKeys = this.extractAllKeys(resources.en);

    for (const [lang, langResources] of Object.entries(resources)) {
      if (lang === 'en') continue;

      const langKeys = this.extractAllKeys(langResources);

      // Check for extra keys not in English
      for (const key of langKeys) {
        if (!englishKeys.has(key)) {
          this.results.warnings.push(`Extra key in '${lang}': ${key}`);
        }
      }

      // Check for empty values
      this.checkForEmptyValues(langResources, lang, '');
    }
  }

  extractAllKeys(obj, prefix = '') {
    const keys = new Set();

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const nestedKey of this.extractAllKeys(value, fullKey)) {
          keys.add(nestedKey);
        }
      } else {
        keys.add(fullKey);
      }
    }

    return keys;
  }

  checkForEmptyValues(obj, lang, path) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        this.checkForEmptyValues(value, lang, currentPath);
      } else if (typeof value === 'string') {
        if (!value.trim()) {
          this.results.issues.push(`Empty translation value in '${lang}' at: ${currentPath}`);
        } else if (value.length < 2) {
          this.results.warnings.push(`Very short translation in '${lang}' at: ${currentPath}`);
        }
      }
    }
  }

  reportResults() {
    console.log('\n📋 Validation Results:\n');

    if (this.results.issues.length === 0 && this.results.warnings.length === 0) {
      console.log('✅ All mobile i18n validations passed!');
      return;
    }

    if (this.results.issues.length > 0) {
      console.log('❌ Issues:');
      for (const issue of this.results.issues) {
        console.log(`  - ${issue}`);
      }
    }

    if (this.results.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      for (const warning of this.results.warnings) {
        console.log(`  - ${warning}`);
      }
    }

    console.log(`\n📊 Summary: ${this.results.issues.length} issues, ${this.results.warnings.length} warnings`);

    if (this.results.issues.length > 0) {
      process.exit(1);
    }
  }
}

// Run validation
async function main() {
  const validator = new MobileI18nValidator();
  await validator.validate();
}

main().catch(console.error);