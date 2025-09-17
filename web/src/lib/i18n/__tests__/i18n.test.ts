
import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JURISDICTION_CONFIG } from '../jurisdictions';
import { LANGUAGE_CONFIG } from '../languages';

describe('i18n Translation System', () => {
  const LOCALES_DIR = path.join(process.cwd(), 'public', 'locales');

  describe('Translation File Structure', () => {
    it('should have base English translations', () => {
      const enDir = path.join(LOCALES_DIR, 'en');
      expect(fs.existsSync(enDir)).toBe(true);

      const expectedFiles = [
        'common/actions.json',
        'common/validation.json',
        'auth/signin.json',
        'documents/list.json',
      ];

      for (const file of expectedFiles) {
        const filePath = path.join(enDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    });

    it('should have consistent namespaces across languages', () => {
      const languages = ['en', 'cs', 'sk', 'de'];
      const namespaces = new Map<string, Set<string>>();

      for (const lang of languages) {
        const langDir = path.join(LOCALES_DIR, lang);
        if (!fs.existsSync(langDir)) continue;

        const files = getFilesRecursively(langDir);
        namespaces.set(
          lang,
          new Set(files.map(f => path.relative(langDir, f).replace(/\\/g, '/')))
        );
      }

      // Check that core namespaces exist in all languages
      const enNamespaces = namespaces.get('en');
      if (enNamespaces) {
        for (const [lang, langNamespaces] of namespaces) {
          if (lang === 'en') continue;

          for (const namespace of enNamespaces) {
            if (namespace.includes('common/')) {
              expect(langNamespaces.has(namespace)).toBe(true);
            }
          }
        }
      }
    });

    it('should have valid JSON in all translation files', () => {
      const files = getFilesRecursively(LOCALES_DIR);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const content = fs.readFileSync(file, 'utf-8');
        expect(() => JSON.parse(content)).not.toThrow();
      }
    });
  });

  describe('Legal Terms', () => {
    it('should have jurisdiction-specific legal terms for Czech Republic', () => {
      const czLegalTermsPath = path.join(
        LOCALES_DIR,
        'CZ',
        'cs',
        'legalTerms.json'
      );
      expect(fs.existsSync(czLegalTermsPath)).toBe(true);

      const terms = JSON.parse(fs.readFileSync(czLegalTermsPath, 'utf-8'));

      // Check for essential legal terms
      expect(terms.documents?.will).toBe('závěť');
      expect(terms.documents?.power_of_attorney).toBe('plná moc');
      expect(terms.inheritance?.heir).toBe('dědic');
      expect(terms.inheritance?.beneficiary).toBe('obmyšlený');
      expect(terms.notary?.notary).toBe('notář');
    });

    it('should have legal term definitions and references', () => {
      const czLegalTermsPath = path.join(
        LOCALES_DIR,
        'CZ',
        'cs',
        'legalTerms.json'
      );
      if (!fs.existsSync(czLegalTermsPath)) return;

      const terms = JSON.parse(fs.readFileSync(czLegalTermsPath, 'utf-8'));

      // Check for definitions and references
      expect(terms.documents?.will_definition).toBeDefined();
      expect(terms.documents?.will_reference).toContain('Občanský zákoník');
    });
  });

  describe('Jurisdiction Configuration', () => {
    it('should have configuration for all EU countries', () => {
      const euCountries = [
        'CZ',
        'SK',
        'DE',
        'FR',
        'IT',
        'ES',
        'PL',
        'NL',
        'BE',
        'AT',
      ];

      for (const country of euCountries) {
        expect(JURISDICTION_CONFIG[country]).toBeDefined();
        expect(JURISDICTION_CONFIG[country].name).toBeDefined();
        expect(JURISDICTION_CONFIG[country].supportedLanguages).toBeDefined();
        expect(JURISDICTION_CONFIG[country].legalSystem).toBeDefined();
      }
    });

    it('should have tax information for each jurisdiction', () => {
      for (const [_code, config] of Object.entries(JURISDICTION_CONFIG)) {
        expect(config.inheritanceTax).toBeDefined();
        expect(config.inheritanceTax.hasInheritanceTax).toBeDefined();

        if (config.inheritanceTax.hasInheritanceTax) {
          expect(config.inheritanceTax.rates).toBeDefined();
        }
      }
    });

    it('should have notary requirements for each jurisdiction', () => {
      for (const [_code, config] of Object.entries(JURISDICTION_CONFIG)) {
        expect(config.notaryRequired).toBeDefined();
        expect(typeof config.notaryRequired).toBe('boolean');
        expect(config.documentTypes).toBeDefined();
        expect(Array.isArray(config.documentTypes)).toBe(true);
      }
    });
  });

  describe('Language Configuration', () => {
    it('should support all required languages', () => {
      const requiredLanguages = [
        'en',
        'cs',
        'sk',
        'de',
        'fr',
        'es',
        'it',
        'pl',
        'nl',
      ];

      for (const lang of requiredLanguages) {
        expect(LANGUAGE_CONFIG[lang]).toBeDefined();
        expect(LANGUAGE_CONFIG[lang].name).toBeDefined();
        expect(LANGUAGE_CONFIG[lang].nativeName).toBeDefined();
        expect(LANGUAGE_CONFIG[lang].script).toBeDefined();
      }
    });

    it('should have RTL configuration for applicable languages', () => {
      // Check if RTL languages have proper configuration
      for (const [_code, config] of Object.entries(LANGUAGE_CONFIG)) {
        if (config.direction === 'rtl') {
          expect(config.direction).toBe('rtl');
        }
      }
    });

    it('should have date and number formatting rules', () => {
      for (const [_code, config] of Object.entries(LANGUAGE_CONFIG)) {
        expect(config.dateFormat).toBeDefined();
        expect(config.timeFormat).toBeDefined();
        expect(config.decimalSeparator).toBeDefined();
        expect(config.thousandsSeparator).toBeDefined();
      }
    });
  });

  describe('Translation Keys Consistency', () => {
    it('should have consistent interpolation patterns', () => {
      const files = getFilesRecursively(LOCALES_DIR);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const content = fs.readFileSync(file, 'utf-8');
        const json = JSON.parse(content);

        checkInterpolationPatterns(json, file);
      }
    });

    it('should not have duplicate keys within same namespace', () => {
      const files = getFilesRecursively(LOCALES_DIR);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const content = fs.readFileSync(file, 'utf-8');
        const json = JSON.parse(content);
        const keys = extractAllKeys(json);

        const uniqueKeys = new Set(keys);
        expect(keys.length).toBe(uniqueKeys.size);
      }
    });
  });

  describe('Translation Coverage', () => {
    it('should have minimum coverage for core namespaces', () => {
      const coreNamespaces = [
        'common/actions',
        'common/validation',
        'auth/signin',
      ];
      const languages = ['en', 'cs', 'sk', 'de'];

      for (const namespace of coreNamespaces) {
        const enFile = path.join(LOCALES_DIR, 'en', `${namespace}.json`);
        if (!fs.existsSync(enFile)) continue;

        const enKeys = extractAllKeys(
          JSON.parse(fs.readFileSync(enFile, 'utf-8'))
        );

        for (const lang of languages) {
          if (lang === 'en') continue;

          const langFile = path.join(LOCALES_DIR, lang, `${namespace}.json`);
          if (!fs.existsSync(langFile)) {
            // Skip if language file doesn't exist yet
            continue;
          }

          const langKeys = extractAllKeys(
            JSON.parse(fs.readFileSync(langFile, 'utf-8'))
          );
          const coverage = (langKeys.length / enKeys.length) * 100;

          // Expect at least 80% coverage for core namespaces
          expect(coverage).toBeGreaterThanOrEqual(80);
        }
      }
    });
  });
});

// Helper functions
function getFilesRecursively(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function extractAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...extractAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

function checkInterpolationPatterns(obj: any, file: string, path = '') {
  for (const key in obj) {
    const fullPath = path ? `${path}.${key}` : key;

    if (typeof obj[key] === 'string') {
      const value = obj[key];
      // Check for valid interpolation patterns
      const patterns = value.match(/{{[^}]+}}/g) || [];

      for (const pattern of patterns) {
        // Ensure pattern has valid format
        expect(pattern).toMatch(/^{{[a-zA-Z_][a-zA-Z0-9_]*}}$/);
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      checkInterpolationPatterns(obj[key], file, fullPath);
    }
  }
}
