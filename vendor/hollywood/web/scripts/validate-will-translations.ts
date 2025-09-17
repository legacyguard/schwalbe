#!/usr/bin/env ts-node

/**
 * Validation script for Will translations
 * Tests all 8 language-jurisdiction combinations
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  combination: string;
  exists: boolean;
  file: string;
  hasRequiredKeys: boolean;
  issues: string[];
  missingKeys: string[];
}

// Required top-level keys for will translations
const REQUIRED_KEYS = [
  'title',
  'jurisdiction',
  'language',
  'legalNotice',
  'sections',
  'legalRequirements',
  'validation'
];

// Required section keys
const REQUIRED_SECTIONS = [
  'testator',
  'revocation',
  'beneficiaries',
  'forcedHeirs',
  'specificBequests',
  'executor',
  'guardianship',
  'finalWishes',
  'residuary',
  'signature'
];

// All expected combinations
const EXPECTED_COMBINATIONS = [
  { lang: 'cs', jurisdiction: 'CZ', file: 'cs_CZ.json' },
  { lang: 'sk', jurisdiction: 'CZ', file: 'sk_CZ.json' },
  { lang: 'en', jurisdiction: 'CZ', file: 'en_CZ.json' },
  { lang: 'de', jurisdiction: 'CZ', file: 'de_CZ.json' },
  { lang: 'sk', jurisdiction: 'SK', file: 'sk_SK.json' },
  { lang: 'cs', jurisdiction: 'SK', file: 'cs_SK.json' },
  { lang: 'en', jurisdiction: 'SK', file: 'en_SK.json' },
  { lang: 'de', jurisdiction: 'SK', file: 'de_SK.json' }
];

function validateTranslationFile(filePath: string): ValidationResult {
  const fileName = path.basename(filePath);
  const combination = fileName.replace('.json', '');

  const result: ValidationResult = {
    combination,
    file: fileName,
    exists: false,
    hasRequiredKeys: false,
    missingKeys: [],
    issues: []
  };

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    result.issues.push('File does not exist');
    return result;
  }

  result.exists = true;

  try {
    // Parse JSON
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Check required top-level keys
    const missingTopKeys = REQUIRED_KEYS.filter(key => !(key in content));
    if (missingTopKeys.length > 0) {
      result.missingKeys.push(...missingTopKeys);
      result.issues.push(`Missing top-level keys: ${missingTopKeys.join(', ')}`);
    }

    // Check sections
    if (content.sections) {
      const missingSections = REQUIRED_SECTIONS.filter(section => !(section in content.sections));
      if (missingSections.length > 0) {
        result.missingKeys.push(...missingSections.map(s => `sections.${s}`));
        result.issues.push(`Missing sections: ${missingSections.join(', ')}`);
      }
    } else {
      result.issues.push('No sections object found');
    }

    // Validate jurisdiction matches filename
    const [lang, jurisdiction] = combination.split('_');
    if (content.jurisdiction) {
      const expectedJurisdiction = jurisdiction === 'CZ' ? 'Czech Republic' : 'Slovak Republic';
      const expectedJurisdictionCz = jurisdiction === 'CZ' ? 'Česká republika' : 'Slovenská republika';
      const expectedJurisdictionSk = jurisdiction === 'CZ' ? 'Česká republika' : 'Slovenská republika';
      const expectedJurisdictionDe = jurisdiction === 'CZ' ? 'Tschechische Republik' : 'Slowakische Republik';

      const validJurisdictions = [expectedJurisdiction, expectedJurisdictionCz, expectedJurisdictionSk, expectedJurisdictionDe];

      if (!validJurisdictions.includes(content.jurisdiction)) {
        result.issues.push(`Jurisdiction mismatch: expected one of ${validJurisdictions.join(', ')}, got ${content.jurisdiction}`);
      }
    }

    // Validate language matches filename
    if (content.language) {
      const expectedLanguages: Record<string, string[]> = {
        'cs': ['Czech', 'Čeština'],
        'sk': ['Slovak', 'Slovenčina', 'Slovensky'],
        'en': ['English'],
        'de': ['German', 'Deutsch']
      };

      if (!expectedLanguages[lang]?.includes(content.language)) {
        result.issues.push(`Language mismatch: expected ${expectedLanguages[lang]?.join(' or ')}, got ${content.language}`);
      }
    }

    // Check for forced heir rules (jurisdiction-specific)
    if (content.sections?.forcedHeirs) {
      const forcedHeirs = content.sections.forcedHeirs;

      if (jurisdiction === 'CZ') {
        // Czech Republic: 3/4 for minors, 1/4 for adults
        if (!forcedHeirs.minorChildren?.includes('3/4') && !forcedHeirs.minorChildren?.includes('three-quarters') &&
            !forcedHeirs.minorChildren?.includes('tri štvrtiny') && !forcedHeirs.minorChildren?.includes('tři čtvrtiny') &&
            !forcedHeirs.minorChildren?.includes('drei Viertel')) {
          result.issues.push('Czech forced heir rule for minors should mention 3/4');
        }
      } else if (jurisdiction === 'SK') {
        // Slovakia: 100% for minors, 50% for adults
        if (!forcedHeirs.minorChildren?.includes('100%') && !forcedHeirs.minorChildren?.includes('full') &&
            !forcedHeirs.minorChildren?.includes('celý') && !forcedHeirs.minorChildren?.includes('vollen')) {
          result.issues.push('Slovak forced heir rule for minors should mention full share');
        }
      }
    }

    result.hasRequiredKeys = result.missingKeys.length === 0;

  } catch (error) {
    result.issues.push(`JSON parsing error: ${error}`);
  }

  return result;
}

function main() {
  // console.log('🔍 Validating Will Translation Files\n');
  // console.log('=' .repeat(60));

  const baseDir = path.join(process.cwd(), 'public', 'locales', 'content', 'wills');
  const results: ValidationResult[] = [];

  // Validate each expected combination
  for (const combo of EXPECTED_COMBINATIONS) {
    const filePath = path.join(baseDir, combo.file);
    const result = validateTranslationFile(filePath);
    results.push(result);

    // Print result
    const status = result.exists && result.hasRequiredKeys && result.issues.length === 0 ? '✅' : '❌';
    // console.log(`${status} ${combo.lang.toUpperCase()}_${combo.jurisdiction}: ${combo.file}`);

    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        // console.log(`   ⚠️  ${issue}`);
      });
    }
  }

  // console.log('\n' + '=' .repeat(60));
  // console.log('📊 Summary:\n');

  const totalFiles = results.length;
  const existingFiles = results.filter(r => r.exists).length;
  const validFiles = results.filter(r => r.exists && r.hasRequiredKeys && r.issues.length === 0).length;

  // console.log(`Total expected combinations: ${totalFiles}`);
  // console.log(`Files found: ${existingFiles}/${totalFiles}`);
  // console.log(`Valid files: ${validFiles}/${totalFiles}`);

  if (validFiles === totalFiles) {
    // console.log('\n✅ All translation files are valid and complete!');
  } else {
    // console.log('\n❌ Some translation files have issues. Please review above.');
  }

  // Check language coverage
  // console.log('\n📚 Language Coverage:');
  const languages = ['cs', 'sk', 'en', 'de'];
  for (const lang of languages) {
    const langFiles = results.filter(r => r.combination.startsWith(lang) && r.exists);
    // console.log(`  ${lang.toUpperCase()}: ${langFiles.length}/2 jurisdictions`);
  }

  // Check jurisdiction coverage
  // console.log('\n🏛️ Jurisdiction Coverage:');
  const jurisdictions = ['CZ', 'SK'];
  for (const jur of jurisdictions) {
    const jurFiles = results.filter(r => r.combination.endsWith(jur) && r.exists);
    // console.log(`  ${jur}: ${jurFiles.length}/4 languages`);
  }

  // Test configuration matrix
  // console.log('\n📋 Configuration Matrix:');
  // console.log('     CZ   SK');
  for (const lang of languages) {
    const czExists = results.find(r => r.combination === `${lang}_CZ`)?.exists ? '✅' : '❌';
    const skExists = results.find(r => r.combination === `${lang}_SK`)?.exists ? '✅' : '❌';
    // console.log(`${lang.toUpperCase().padEnd(4)} ${czExists}   ${skExists}`);
  }
}

// Run validation
main();
