#!/usr/bin/env node

/**
 * Translation Verification Script
 * Verifies that the English-only translation system is working correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load English translations
const translationsPath = path.join(__dirname, 'locale', 'en.json');
let translations;

try {
  const translationsContent = fs.readFileSync(translationsPath, 'utf8');
  translations = JSON.parse(translationsContent);
  // console.log('✅ Successfully loaded English translations');
} catch (error) {
  console.error('❌ Failed to load English translations:', error.message);
  process.exit(1);
}

// Test translation key access
function getTranslation(key) {
  const keys = key.split('.');
  let current = translations;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
}

// Test interpolation
function interpolate(text, params = {}) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

// console.log('\n📋 Running Translation Tests...\n');

// Test 1: Basic key access
const testKeys = [
  'common.buttons.save',
  'common.buttons.cancel',
  'accessibility.skipLinks.mainContent',
  'documents.uploader.fileSizeLimit',
  'family.roleAssignment.currentStatus',
  'navigation.home',
  'forms.validation.required'
];

let passedTests = 0;
let totalTests = 0;

// console.log('🧪 Test 1: Basic Key Access');
testKeys.forEach(key => {
  totalTests++;
  const translation = getTranslation(key);
  if (translation) {
    // console.log(`  ✅ ${key} → "${translation}"`);
    passedTests++;
  } else {
    // console.log(`  ❌ ${key} → undefined`);
  }
});

// Test 2: Interpolation
// console.log('\n🧪 Test 2: Interpolation');
const interpolationTests = [
  {
    key: 'accessibility.screenReader.pageOf',
    params: { current: '5', total: '20' },
    expected: 'Page 5 of 20'
  },
  {
    key: 'accessibility.screenReader.selectedItems',
    params: { count: '3' },
    expected: '3 items selected'
  },
  {
    key: 'forms.validation.minLength',
    params: { min: '8' },
    expected: 'Must be at least 8 characters'
  }
];

interpolationTests.forEach(test => {
  totalTests++;
  const template = getTranslation(test.key);
  if (template) {
    const result = interpolate(template, test.params);
    if (result === test.expected) {
      // console.log(`  ✅ ${test.key} with params → "${result}"`);
      passedTests++;
    } else {
      // console.log(`  ❌ ${test.key} → Expected: "${test.expected}", Got: "${result}"`);
    }
  } else {
    // console.log(`  ❌ ${test.key} → Template not found`);
  }
});

// Test 3: Category completeness
// console.log('\n🧪 Test 3: Category Completeness');
const expectedCategories = [
  'common',
  'accessibility', 
  'navigation',
  'forms',
  'documents',
  'family',
  'will',
  'security'
];

expectedCategories.forEach(category => {
  totalTests++;
  if (translations[category]) {
    // console.log(`  ✅ Category "${category}" exists`);
    passedTests++;
  } else {
    // console.log(`  ❌ Category "${category}" missing`);
  }
});

// Test 4: File structure
// console.log('\n🧪 Test 4: File Structure');
const expectedFiles = [
  'locale/en.json',
  'useTranslation.tsx',
  'README.md'
];

expectedFiles.forEach(file => {
  totalTests++;
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    // console.log(`  ✅ File "${file}" exists`);
    passedTests++;
  } else {
    // console.log(`  ❌ File "${file}" missing`);
  }
});

// Summary
// console.log('\n📊 Test Summary');
// console.log(`Total Tests: ${totalTests}`);
// console.log(`Passed: ${passedTests}`);
// console.log(`Failed: ${totalTests - passedTests}`);
// console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  // console.log('\n🎉 All tests passed! Translation system is working correctly.');
  process.exit(0);
} else {
  // console.log('\n❌ Some tests failed. Please check the implementation.');
  process.exit(1);
}
