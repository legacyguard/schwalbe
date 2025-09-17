#!/usr/bin/env tsx
/**
 * Test i18n Configuration
 * Validates that all i18n components work correctly
 */

import * as fs from 'fs';
import * as path from 'path';

// Color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

interface TestResult {
  error?: string;
  name: string;
  passed: boolean;
}

class I18nTester {
  private results: TestResult[] = [];

  async runTests() {
    console.log('🧪 Running i18n configuration tests...\n');

    // Test 1: Check directory structure
    this.testDirectoryStructure();

    // Test 2: Validate JSON files
    this.testJSONFiles();

    // Test 3: Check file paths mapping
    this.testFilePathMapping();

    // Test 4: Validate namespace configuration
    this.testNamespaceConfiguration();

    // Test 5: Check for duplicate keys
    this.testDuplicateKeys();

    // Print results
    this.printResults();
  }

  private testDirectoryStructure() {
    const requiredDirs = [
      'locales/_shared/en',
      'locales/_shared/sk',
      'locales/legal/en',
      'locales/legal/sk',
      'locales/web/en',
      'locales/web/sk',
      'locales/mobile/en',
      'locales/mobile/sk',
      'locales/config',
    ];

    requiredDirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      const exists = fs.existsSync(fullPath);

      this.results.push({
        name: `Directory exists: ${dir}`,
        passed: exists,
        error: exists ? undefined : `Directory not found: ${fullPath}`,
      });
    });
  }

  private testJSONFiles() {
    const jsonFiles = [
      'locales/_shared/en/common/ui.json',
      'locales/_shared/sk/common/ui.json',
      'locales/config/languages.json',
    ];

    jsonFiles.forEach(file => {
      const fullPath = path.join(process.cwd(), file);

      if (!fs.existsSync(fullPath)) {
        this.results.push({
          name: `JSON file exists: ${file}`,
          passed: false,
          error: `File not found: ${fullPath}`,
        });
        return;
      }

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        JSON.parse(content);

        this.results.push({
          name: `JSON valid: ${file}`,
          passed: true,
        });
      } catch (error) {
        this.results.push({
          name: `JSON valid: ${file}`,
          passed: false,
          error: `Invalid JSON: ${error}`,
        });
      }
    });
  }

  private testFilePathMapping() {
    // Test namespace to file path mapping
    const testCases = [
      {
        namespace: 'common.ui',
        lang: 'en',
        expectedPath: '/locales/_shared/en/common/ui.json',
      },
      {
        namespace: 'features.vault.categories',
        lang: 'sk',
        expectedPath: '/locales/_shared/sk/features/vault/categories.json',
      },
      {
        namespace: 'web.landing.hero',
        lang: 'en',
        expectedPath: '/locales/web/en/web/landing/hero.json',
      },
    ];

    testCases.forEach(test => {
      const parts = test.namespace.split('.');
      let basePath = '/locales';

      if (
        parts[0] === 'common' ||
        parts[0] === 'features' ||
        parts[0] === 'auth' ||
        parts[0] === 'errors'
      ) {
        basePath = `/locales/_shared/${test.lang}`;
      } else if (parts[0] === 'web') {
        basePath = `/locales/web/${test.lang}`;
      } else if (parts[0] === 'mobile') {
        basePath = `/locales/mobile/${test.lang}`;
      } else if (parts[0] === 'legal') {
        basePath = `/locales/legal/${test.lang}`;
      }

      const filePath = parts.slice(1).join('/');
      const computed = `${basePath}/${parts[0]}/${filePath}.json`;

      this.results.push({
        name: `Path mapping: ${test.namespace}`,
        passed: computed === test.expectedPath,
        error:
          computed !== test.expectedPath
            ? `Expected: ${test.expectedPath}, Got: ${computed}`
            : undefined,
      });
    });
  }

  private testNamespaceConfiguration() {
    const configPath = path.join(
      process.cwd(),
      'locales/config/languages.json'
    );

    if (!fs.existsSync(configPath)) {
      this.results.push({
        name: 'Namespace configuration',
        passed: false,
        error: 'Config file not found',
      });
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Check required fields
      const requiredFields = [
        'supportedLanguages',
        'defaultLanguage',
        'namespaces',
      ];
      const missingFields = requiredFields.filter(field => !config[field]);

      this.results.push({
        name: 'Namespace configuration structure',
        passed: missingFields.length === 0,
        error:
          missingFields.length > 0
            ? `Missing fields: ${missingFields.join(', ')}`
            : undefined,
      });
    } catch (error) {
      this.results.push({
        name: 'Namespace configuration',
        passed: false,
        error: `Error reading config: ${error}`,
      });
    }
  }

  private testDuplicateKeys() {
    const enPath = path.join(
      process.cwd(),
      'locales/_shared/en/common/ui.json'
    );
    const skPath = path.join(
      process.cwd(),
      'locales/_shared/sk/common/ui.json'
    );

    if (!fs.existsSync(enPath) || !fs.existsSync(skPath)) {
      this.results.push({
        name: 'Key consistency',
        passed: false,
        error: 'Translation files not found',
      });
      return;
    }

    try {
      const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      const skContent = JSON.parse(fs.readFileSync(skPath, 'utf8'));

      const enKeys = this.extractKeys(enContent);
      const skKeys = this.extractKeys(skContent);

      const missingInSk = enKeys.filter(key => !skKeys.includes(key));
      const missingInEn = skKeys.filter(key => !enKeys.includes(key));

      const passed = missingInSk.length === 0 && missingInEn.length === 0;

      this.results.push({
        name: 'Key consistency EN/SK',
        passed,
        error: !passed
          ? `Missing in SK: ${missingInSk.length}, Missing in EN: ${missingInEn.length}`
          : undefined,
      });
    } catch (error) {
      this.results.push({
        name: 'Key consistency',
        passed: false,
        error: `Error checking keys: ${error}`,
      });
    }
  }

  private extractKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !key.includes('_')
      ) {
        keys = keys.concat(this.extractKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  private printResults() {
    console.log('\n📊 Test Results:\n');

    let passed = 0;
    let failed = 0;

    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const color = result.passed ? colors.green : colors.red;

      console.log(`${icon} ${color}${result.name}${colors.reset}`);

      if (result.error) {
        console.log(`   ${colors.yellow}${result.error}${colors.reset}`);
      }

      if (result.passed) passed++;
      else failed++;
    });

    console.log('\n' + '='.repeat(50));
    console.log(`Total: ${this.results.length} | `, (end = ''));
    console.log(
      `${colors.green}Passed: ${passed}${colors.reset} | `,
      (end = '')
    );
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! i18n configuration is ready.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }
}

// Run tests
async function main() {
  const tester = new I18nTester();
  await tester.runTests();
}

main().catch(console.error);

function end(str: string) {
  process.stdout.write(str);
}
