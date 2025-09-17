#!/usr/bin/env npx tsx

/**
 * i18n Matrix Health Check
 * 
 * Validates that the DOMAIN_LANGUAGES configuration complies with the i18n matrix rules:
 * 1. At least 4 languages per domain
 * 2. Total supported languages exactly 34
 * 3. Germany (legacyguard.de) must not include Russian
 * 4. Iceland (legacyguard.is) and Liechtenstein (legacyguard.li) must not include Ukrainian
 * 5. Baltic states (legacyguard.lt, legacyguard.lv, legacyguard.ee) should include Russian per matrix rules
 * 
 * This script is run in CI to ensure matrix compliance.
 */

import { DOMAIN_LANGUAGES, SUPPORTED_LANGUAGES_34 } from '../packages/shared/src/config/languages';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ ASSERTION FAILED: ${message}`);
  }
}

function main(): void {
  console.log('🔍 Running i18n matrix health check...\n');

  // Rule 1: Check total languages count is exactly 34
  console.log('📊 Checking total supported languages...');
  assert(
    SUPPORTED_LANGUAGES_34.length === 34,
    `Expected exactly 34 supported languages, got ${SUPPORTED_LANGUAGES_34.length}`
  );
  console.log(`✅ Total supported languages: ${SUPPORTED_LANGUAGES_34.length}\n`);

  // Rule 2: Check that each domain has at least 4 languages
  console.log('🌐 Checking minimum languages per domain...');
  for (const [host, languages] of Object.entries(DOMAIN_LANGUAGES)) {
    assert(
      languages.length >= 4,
      `Domain ${host} has only ${languages.length} languages (minimum: 4)`
    );
    console.log(`✅ ${host}: ${languages.length} languages [${languages.join(', ')}]`);
  }
  console.log();

  // Rule 3: Germany must not include Russian
  console.log('🇩🇪 Checking Germany-specific rule (no Russian)...');
  const germanyLanguages = DOMAIN_LANGUAGES['legacyguard.de'];
  assert(
    germanyLanguages && !germanyLanguages.includes('ru'),
    'Germany (legacyguard.de) must not include Russian (ru) language'
  );
  console.log(`✅ Germany does not include Russian: [${germanyLanguages?.join(', ')}]\n`);

  // Rule 4: Iceland and Liechtenstein must not include Ukrainian
  console.log('🇮🇸🇱🇮 Checking Iceland and Liechtenstein-specific rule (no Ukrainian)...');
  
  const icelandLanguages = DOMAIN_LANGUAGES['legacyguard.is'];
  assert(
    icelandLanguages && !icelandLanguages.includes('uk'),
    'Iceland (legacyguard.is) must not include Ukrainian (uk) language'
  );
  console.log(`✅ Iceland does not include Ukrainian: [${icelandLanguages?.join(', ')}]`);

  const liechtensteinLanguages = DOMAIN_LANGUAGES['legacyguard.li'];
  assert(
    liechtensteinLanguages && !liechtensteinLanguages.includes('uk'),
    'Liechtenstein (legacyguard.li) must not include Ukrainian (uk) language'
  );
  console.log(`✅ Liechtenstein does not include Ukrainian: [${liechtensteinLanguages?.join(', ')}]\n`);

  // Rule 5: Baltic states should include Russian per matrix rules
  console.log('🇱🇹🇱🇻🇪🇪 Checking Baltic states rule (include Russian)...');
  
  const balticStates = ['legacyguard.lt', 'legacyguard.lv', 'legacyguard.ee'];
  for (const host of balticStates) {
    const languages = DOMAIN_LANGUAGES[host];
    assert(
      languages && languages.includes('ru'),
      `${host} should include Russian (ru) as per matrix rules for Baltic states`
    );
    console.log(`✅ ${host} includes Russian: [${languages?.join(', ')}]`);
  }
  console.log();

  // Additional validation: Check that all languages in DOMAIN_LANGUAGES are in SUPPORTED_LANGUAGES_34
  console.log('🔄 Checking that all domain languages are supported...');
  for (const [host, languages] of Object.entries(DOMAIN_LANGUAGES)) {
    for (const lang of languages) {
      assert(
        SUPPORTED_LANGUAGES_34.includes(lang as any),
        `Domain ${host} uses unsupported language '${lang}'. All languages must be in SUPPORTED_LANGUAGES_34.`
      );
    }
  }
  console.log('✅ All domain languages are properly supported\n');

  // Additional validation: Check for required coverage of key domains
  console.log('🏛️ Checking coverage of key domains...');
  const requiredDomains = [
    'legacyguard.cz',  // Czech Republic (MVP)
    'legacyguard.sk',  // Slovakia (MVP)
    'legacyguard.de',  // Germany (Tier 1)
    'legacyguard.pl',  // Poland (Tier 1)
    'legacyguard.fr',  // France (Tier 1)
    'legacyguard.uk',  // United Kingdom (Tier 1)
  ];

  for (const domain of requiredDomains) {
    assert(
      DOMAIN_LANGUAGES[domain] !== undefined,
      `Required domain ${domain} is missing from DOMAIN_LANGUAGES configuration`
    );
    console.log(`✅ ${domain} is configured`);
  }
  console.log();

  // Summary statistics
  console.log('📈 Summary statistics:');
  const totalDomains = Object.keys(DOMAIN_LANGUAGES).length;
  const totalLanguageAssignments = Object.values(DOMAIN_LANGUAGES).flat().length;
  const avgLanguagesPerDomain = (totalLanguageAssignments / totalDomains).toFixed(1);
  
  console.log(`   • Total domains configured: ${totalDomains}`);
  console.log(`   • Total language assignments: ${totalLanguageAssignments}`);
  console.log(`   • Average languages per domain: ${avgLanguagesPerDomain}`);
  console.log(`   • Total supported languages: ${SUPPORTED_LANGUAGES_34.length}`);

  // Check unique languages used across all domains
  const uniqueLanguagesUsed = new Set(Object.values(DOMAIN_LANGUAGES).flat());
  console.log(`   • Unique languages actually used: ${uniqueLanguagesUsed.size}`);
  
  if (uniqueLanguagesUsed.size < SUPPORTED_LANGUAGES_34.length) {
    const unusedLanguages = SUPPORTED_LANGUAGES_34.filter(lang => !uniqueLanguagesUsed.has(lang));
    console.log(`   ⚠️  Unused languages: ${unusedLanguages.join(', ')}`);
  }

  console.log('\n🎉 All i18n matrix health checks passed!');
  console.log('   • ✅ 34 languages supported');
  console.log('   • ✅ Minimum 4 languages per domain');
  console.log('   • ✅ Germany excludes Russian');
  console.log('   • ✅ Iceland and Liechtenstein exclude Ukrainian');
  console.log('   • ✅ Baltic states include Russian');
  console.log('   • ✅ All domain languages are supported');
  console.log('   • ✅ Key domains are configured');
}

// Run the script if this file is executed directly
try {
  main();
  process.exit(0);
} catch (error) {
  console.error('\n💥 i18n matrix health check failed!');
  console.error(error instanceof Error ? error.message : String(error));
  console.error('\nPlease fix the language configuration in packages/shared/src/config/languages.ts');
  console.error('to match the requirements in docs/i18n/matrix.md');
  process.exit(1);
}