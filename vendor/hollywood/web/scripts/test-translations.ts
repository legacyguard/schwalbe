#!/usr/bin/env node

/**
 * Translation Testing Script for LegacyGuard
 * Tests translation functionality and validates implementation
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  details?: string;
  message: string;
  status: 'FAIL' | 'PASS' | 'WARNING';
  test: string;
}

class TranslationTester {
  private results: TestResult[] = [];
  private translationFiles: Record<string, any> = {};

  constructor() {
    this.loadTranslationFiles();
  }

  private loadTranslationFiles(): void {
    const translationPaths = [
      'public/locales/ui/en.json',
      'public/locales/ui/sk.json',
      'public/locales/ui/landing-page.en.json',
      'public/locales/ui/landing-page.sk.json',
      'public/locales/ui/dashboard.en.json',
      'public/locales/ui/dashboard.sk.json',
      'public/locales/ui/vault.en.json',
      'public/locales/ui/vault.sk.json',
      'public/locales/ui/sidebar.en.json',
      'public/locales/ui/sidebar.sk.json'
    ];

    translationPaths.forEach(filePath => {
      const fullPath = path.join('/Users/luborfedak/Documents/Github/hollywood/web', filePath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          this.translationFiles[filePath] = content;
        } catch (error) {
          this.results.push({
            test: 'Translation File Loading',
            status: 'FAIL',
            message: `Failed to load ${filePath}`,
            details: String(error)
          });
        }
      } else {
        this.results.push({
          test: 'Translation File Existence',
          status: 'FAIL',
          message: `Translation file missing: ${filePath}`
        });
      }
    });
  }

  private testFileStructure(): void {
    const expectedFiles = [
      'public/locales/ui/landing-page.en.json',
      'public/locales/ui/landing-page.sk.json',
      'public/locales/ui/dashboard.en.json',
      'public/locales/ui/dashboard.sk.json',
      'public/locales/ui/vault.en.json',
      'public/locales/ui/vault.sk.json',
      'public/locales/ui/sidebar.en.json',
      'public/locales/ui/sidebar.sk.json'
    ];

    let existingFiles = 0;
    expectedFiles.forEach(file => {
      if (this.translationFiles[file]) {
        existingFiles++;
      }
    });

    this.results.push({
      test: 'Translation File Structure',
      status: existingFiles === expectedFiles.length ? 'PASS' : 'WARNING',
      message: `${existingFiles}/${expectedFiles.length} expected translation files exist`,
      details: existingFiles < expectedFiles.length ?
        `Missing: ${expectedFiles.filter(f => !this.translationFiles[f]).join(', ')}` : undefined
    });
  }

  private testI18nConfiguration(): void {
    const configPath = '/Users/luborfedak/Documents/Github/hollywood/web/src/lib/i18n/config.ts';

    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');

      // Test if configuration supports our languages
      const hasEnglish = content.includes("'en'") || content.includes('"en"');
      const hasSlovak = content.includes("'sk'") || content.includes('"sk"');

      if (hasEnglish && hasSlovak) {
        this.results.push({
          test: 'i18n Configuration',
          status: 'PASS',
          message: 'i18n config supports English and Slovak languages'
        });
      } else {
        this.results.push({
          test: 'i18n Configuration',
          status: 'FAIL',
          message: 'i18n config missing language support',
          details: `English: ${hasEnglish}, Slovak: ${hasSlovak}`
        });
      }
    } else {
      this.results.push({
        test: 'i18n Configuration',
        status: 'FAIL',
        message: 'i18n configuration file not found'
      });
    }
  }

  private testTranslationConsistency(): void {
    const pairs = [
      ['public/locales/ui/landing-page.en.json', 'public/locales/ui/landing-page.sk.json'],
      ['public/locales/ui/dashboard.en.json', 'public/locales/ui/dashboard.sk.json'],
      ['public/locales/ui/vault.en.json', 'public/locales/ui/vault.sk.json'],
      ['public/locales/ui/sidebar.en.json', 'public/locales/ui/sidebar.sk.json']
    ];

    pairs.forEach(([enFile, skFile]) => {
      const enContent = this.translationFiles[enFile];
      const skContent = this.translationFiles[skFile];

      if (!enContent || !skContent) {
        this.results.push({
          test: 'Translation Key Consistency',
          status: 'FAIL',
          message: `Missing translation files for comparison: ${enFile.split('/').pop()} / ${skFile.split('/').pop()}`
        });
        return;
      }

      const enKeys = this.extractKeys(enContent);
      const skKeys = this.extractKeys(skContent);

      const missingInSlovak = enKeys.filter(key => !skKeys.includes(key));
      const extraInSlovak = skKeys.filter(key => !enKeys.includes(key));

      if (missingInSlovak.length === 0 && extraInSlovak.length === 0) {
        this.results.push({
          test: 'Translation Key Consistency',
          status: 'PASS',
          message: `Perfect key consistency: ${enFile.split('/').pop()}`
        });
      } else {
        this.results.push({
          test: 'Translation Key Consistency',
          status: 'WARNING',
          message: `Key mismatch in ${enFile.split('/').pop()}`,
          details: `Missing in SK: ${missingInSlovak.length}, Extra in SK: ${extraInSlovak.length}`
        });
      }
    });
  }

  private extractKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.extractKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  private testComponentIntegration(): void {
    const componentsToTest = [
      {
        file: 'src/pages/LandingPage.tsx',
        expectedNamespace: 'ui/landing-page',
        expectedKeys: ['hero.title', 'hero.subtitle', 'features.title']
      },
      {
        file: 'src/components/DashboardContent.tsx',
        expectedNamespace: 'ui/dashboard',
        expectedKeys: ['header.title', 'metrics.totalDocuments']
      },
      {
        file: 'src/pages/Vault.tsx',
        expectedNamespace: 'ui/vault',
        expectedKeys: ['header.title', 'table.title']
      },
      {
        file: 'src/components/AppSidebar.tsx',
        expectedNamespace: 'ui/sidebar',
        expectedKeys: ['brand', 'items.dashboard']
      }
    ];

    componentsToTest.forEach(({ file, expectedNamespace, expectedKeys }) => {
      const fullPath = path.join('/Users/luborfedak/Documents/Github/hollywood/web', file);

      if (!fs.existsSync(fullPath)) {
        this.results.push({
          test: 'Component Integration',
          status: 'FAIL',
          message: `Component file not found: ${file}`
        });
        return;
      }

      const content = fs.readFileSync(fullPath, 'utf8');

      // Check if component uses useTranslation with correct namespace
      const hasUseTranslation = content.includes('useTranslation');
      const hasCorrectNamespace = content.includes(`'${expectedNamespace}'`) || content.includes(`"${expectedNamespace}"`);

      // Check if component uses expected translation keys
      const usedKeys = expectedKeys.filter(key =>
        content.includes(`t('${key}'`) || content.includes(`t("${key}"`)
      );

      if (hasUseTranslation && hasCorrectNamespace && usedKeys.length > 0) {
        this.results.push({
          test: 'Component Integration',
          status: 'PASS',
          message: `${file.split('/').pop()} properly integrated`,
          details: `Uses ${usedKeys.length}/${expectedKeys.length} expected keys`
        });
      } else {
        this.results.push({
          test: 'Component Integration',
          status: 'WARNING',
          message: `${file.split('/').pop()} integration issues`,
          details: `useTranslation: ${hasUseTranslation}, namespace: ${hasCorrectNamespace}, keys: ${usedKeys.length}/${expectedKeys.length}`
        });
      }
    });
  }

  private testFallbackMechanism(): void {
    // Test if main i18n config has proper fallback
    const configPath = '/Users/luborfedak/Documents/Github/hollywood/web/src/lib/i18n/config.ts';

    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');

      const hasFallbackLng = content.includes('fallbackLng') || content.includes('fallbackLanguage');
      const fallsBackToEn = content.includes("fallbackLng: 'en'") || content.includes('fallbackLng:"en"');

      if (hasFallbackLng && fallsBackToEn) {
        this.results.push({
          test: 'Fallback Mechanism',
          status: 'PASS',
          message: 'Proper fallback to English configured'
        });
      } else {
        this.results.push({
          test: 'Fallback Mechanism',
          status: 'WARNING',
          message: 'Fallback mechanism may not be properly configured',
          details: `Has fallback config: ${hasFallbackLng}, Falls back to EN: ${fallsBackToEn}`
        });
      }
    }
  }

  public runAllTests(): void {
    console.error('🧪 Running Translation Tests for LegacyGuard...\n');

    this.testFileStructure();
    this.testI18nConfiguration();
    this.testTranslationConsistency();
    this.testComponentIntegration();
    this.testFallbackMechanism();

    // Generate summary
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    console.error('📊 Test Results Summary:');
    console.error(`   ✅ PASSED: ${passed}`);
    console.error(`   ⚠️  WARNINGS: ${warnings}`);
    console.error(`   ❌ FAILED: ${failed}`);
    console.error(`   📝 TOTAL: ${this.results.length}\n`);

    // Display detailed results
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
      console.error(`${icon} ${result.test}: ${result.message}`);
      if (result.details) {
        console.error(`   Details: ${result.details}`);
      }
    });

    // Overall assessment
    if (failed === 0) {
      console.error('\n🎉 Translation system is working correctly!');
      if (warnings > 0) {
        console.error(`⚠️  Address ${warnings} warnings to improve the implementation.`);
      }
    } else {
      console.error(`\n🔧 ${failed} critical issues need to be addressed.`);
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: { passed, warnings, failed, total: this.results.length },
      results: this.results
    };

    fs.writeFileSync('/Users/luborfedak/Documents/Github/hollywood/web/translation-test-report.json', JSON.stringify(report, null, 2));
    console.error('\n📄 Detailed report saved to translation-test-report.json');
  }
}

// Run the tests
const tester = new TranslationTester();
tester.runAllTests();
