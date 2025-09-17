#!/usr/bin/env tsx
/**
 * Translation Migration Utility
 *
 * This script helps identify hardcoded strings in React components and provides
 * suggestions for replacing them with translation keys.
 *
 * Usage:
 *   npm run migrate-strings
 *   or
 *   npx tsx src/scripts/migration-utility.ts
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration
const SEARCH_PATTERNS = [
  // String literals in JSX content
  />\s*['"`]([A-Z][a-zA-Z\s,\.!?]{5,})['"`]\s*</g,

  // String literals in JSX attributes
  /(?:title|placeholder|aria-label|alt)\s*=\s*['"`]([A-Z][a-zA-Z\s,\.!?]{3,})['"`]/g,

  // String assignments with English text
  /const\s+\w+\s*=\s*['"`]([A-Z][a-zA-Z\s,\.!?]{5,})['"`]/g,

  // Object properties with English text
  /['"`]?(\w+)['"`]?\s*:\s*['"`]([A-Z][a-zA-Z\s,\.!?]{5,})['"`]/g,

  // Function calls with string literals
  /(?:alert|confirm|console\.(?:log|error|warn))\s*\(\s*['"`]([A-Z][a-zA-Z\s,\.!?]{5,})['"`]/g,
];

const EXCLUDE_PATTERNS = [
  // Already using translation functions
  /\bt\s*\(/,
  /useTranslation/,
  /i18n/,

  // CSS classes and IDs
  /className|class|id/,

  // URLs and paths
  /https?:\/\/|\/\w+/,

  // Technical terms (less likely to need translation)
  /API|URL|HTTP|JSON|XML|HTML|CSS|JS|TS|React|Next/,
];

interface HardcodedString {
  column: number;
  context: string;
  file: string;
  line: number;
  match: string;
  suggestion: string;
}

interface MigrationResult {
  filesWithHardcodedStrings: number;
  hardcodedStrings: HardcodedString[];
  suggestions: string[];
  totalFiles: number;
}

/**
 * Generate a translation key suggestion based on the string content
 */
function generateTranslationKey(text: string, context?: string): string {
  // Remove special characters and convert to camelCase
  const cleanText = text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');

  // Suggest category based on context or content
  let category = 'common';

  if (context?.includes('button') || text.match(/^(Save|Delete|Cancel|Submit|Continue|Back|Next|Close|Add|Edit|Create|Update)/i)) {
    category = 'common.buttons';
  } else if (context?.includes('error') || text.match(/error|fail|wrong|invalid/i)) {
    category = 'errors';
  } else if (context?.includes('success') || text.match(/success|complete|done|saved/i)) {
    category = 'success';
  } else if (context?.includes('warning') || text.match(/warning|careful|attention/i)) {
    category = 'warnings';
  } else if (context?.includes('form') || text.match(/enter|select|choose|required/i)) {
    category = 'forms';
  } else if (context?.includes('navigation') || text.match(/home|dashboard|settings|profile|menu/i)) {
    category = 'navigation';
  } else if (text.match(/loading|processing|saving|uploading/i)) {
    category = 'info';
  }

  return `${category}.${cleanText}`;
}

/**
 * Check if a line should be excluded from analysis
 */
function shouldExcludeFile(filePath: string): boolean {
  const excludePaths = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    'storybook-static',
    '.storybook',
    'public/locales', // Skip existing translation files
    'src/i18n', // Skip i18n setup files
  ];

  return excludePaths.some(excludePath => filePath.includes(excludePath));
}

/**
 * Check if a line should be excluded from analysis
 */
function shouldExcludeLine(line: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(line));
}

/**
 * Analyze a single file for hardcoded strings
 */
function analyzeFile(filePath: string): HardcodedString[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const results: HardcodedString[] = [];

  lines.forEach((line, lineIndex) => {
    if (shouldExcludeLine(line)) {
      return;
    }

    SEARCH_PATTERNS.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);

      while ((match = regex.exec(line)) !== null) {
        const matchedText = match[1] || match[2]; // Get the captured group
        if (matchedText && matchedText.length >= 3) {
          const suggestion = generateTranslationKey(matchedText, line);

          results.push({
            file: filePath,
            line: lineIndex + 1,
            column: match.index + 1,
            match: matchedText,
            suggestion,
            context: line.trim(),
          });
        }
      }
    });
  });

  return results;
}

/**
 * Generate suggestions for adding missing translation keys
 */
function generateTranslationSuggestions(hardcodedStrings: HardcodedString[]): string[] {
  const suggestions: string[] = [];
  const keyGroups: { [category: string]: { [key: string]: string } } = {};

  // Group suggestions by category
  hardcodedStrings.forEach(item => {
    const [category, ...keyParts] = item.suggestion.split('.');
    const key = keyParts.join('.');

    if (!keyGroups[category]) {
      keyGroups[category] = {};
    }

    keyGroups[category][key] = item.match;
  });

  // Generate JSON structure suggestions
  Object.entries(keyGroups).forEach(([category, keys]) => {
    suggestions.push(`\n// Add to ${category} section in en.json:`);
    suggestions.push(`"${category}": {`);

    Object.entries(keys).forEach(([key, value]) => {
      suggestions.push(`  "${key}": "${value}",`);
    });

    suggestions.push('},');
  });

  return suggestions;
}

/**
 * Main migration analysis function
 */
async function analyzeMigration(): Promise<MigrationResult> {
  // console.log('🔍 Scanning for hardcoded strings...\n');

  const patterns = [
    'src/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx}',
    'pages/**/*.{ts,tsx,js,jsx}',
  ];

  const files: string[] = [];
  for (const pattern of patterns) {
    const matchedFiles = await glob(pattern, { ignore: 'node_modules/**' });
    files.push(...matchedFiles);
  }

  // Filter out excluded files
  const validFiles = files.filter(file => !shouldExcludeFile(file));

  // console.log(`📁 Found ${validFiles.length} files to analyze`);

  const hardcodedStrings: HardcodedString[] = [];
  let filesWithHardcodedStrings = 0;

  validFiles.forEach(file => {
    const fileResults = analyzeFile(file);
    if (fileResults.length > 0) {
      filesWithHardcodedStrings++;
      hardcodedStrings.push(...fileResults);
      // console.log(`🔍 ${file}: ${fileResults.length} hardcoded strings found`);
    }
  });

  const suggestions = generateTranslationSuggestions(hardcodedStrings);

  return {
    totalFiles: validFiles.length,
    filesWithHardcodedStrings,
    hardcodedStrings,
    suggestions,
  };
}

/**
 * Generate a detailed migration report
 */
function generateReport(result: MigrationResult): void {
  const reportPath = path.join(process.cwd(), 'translation-migration-report.md');

  let report = `# Translation Migration Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Files Analyzed:** ${result.totalFiles}\n`;
  report += `- **Files with Hardcoded Strings:** ${result.filesWithHardcodedStrings}\n`;
  report += `- **Total Hardcoded Strings Found:** ${result.hardcodedStrings.length}\n\n`;

  if (result.hardcodedStrings.length > 0) {
    report += `## Hardcoded Strings by File\n\n`;

    // Group by file
    const fileGroups: { [file: string]: HardcodedString[] } = {};
    result.hardcodedStrings.forEach(item => {
      if (!fileGroups[item.file]) {
        fileGroups[item.file] = [];
      }
      fileGroups[item.file].push(item);
    });

    Object.entries(fileGroups).forEach(([file, strings]) => {
      report += `### ${file}\n\n`;
      strings.forEach(str => {
        report += `- **Line ${str.line}:** \`${str.match}\`\n`;
        report += `  - **Suggested Key:** \`${str.suggestion}\`\n`;
        report += `  - **Context:** \`${str.context}\`\n\n`;
      });
    });

    report += `## Suggested Translation Keys\n\n`;
    report += `Add these keys to your English locale file (\`src/i18n/locale/en.json\`):\n\n`;
    report += '```json\n';
    result.suggestions.forEach(suggestion => {
      report += `${suggestion}\n`;
    });
    report += '```\n\n';
  }

  report += `## Migration Instructions\n\n`;
  report += `1. **Add Translation Keys**: Copy the suggested keys to your \`en.json\` file\n`;
  report += `2. **Import Translation Hook**: Add \`import { useTranslation } from '@/i18n/useTranslation';\` to components\n`;
  report += `3. **Add Hook Usage**: Add \`const { t } = useTranslation();\` inside components\n`;
  report += `4. **Replace Strings**: Replace hardcoded strings with \`{t('suggested.key')}\`\n`;
  report += `5. **Test**: Verify that all translations display correctly\n\n`;

  fs.writeFileSync(reportPath, report);
  // console.log(`📄 Report generated: ${reportPath}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    // console.log('🌐 Translation Migration Utility\n');

    const result = await analyzeMigration();

    // console.log('\n📊 Results:');
    // console.log(`   📁 Files analyzed: ${result.totalFiles}`);
    // console.log(`   🔍 Files with hardcoded strings: ${result.filesWithHardcodedStrings}`);
    // console.log(`   📝 Total hardcoded strings: ${result.hardcodedStrings.length}\n`);

    if (result.hardcodedStrings.length > 0) {
      // console.log('📋 Top 10 files with most hardcoded strings:');

      // Count strings per file
      const fileCount: { [file: string]: number } = {};
      result.hardcodedStrings.forEach(item => {
        fileCount[item.file] = (fileCount[item.file] || 0) + 1;
      });

      // Sort and display top 10
      Object.entries(fileCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([file, count]) => {
          // console.log(`   ${count.toString().padStart(3)} strings in ${file}`);
        });

      // console.log('\n🔧 Generating detailed report...');
      generateReport(result);

      // console.log('\n✅ Migration analysis complete!');
      // console.log('📖 Check the generated report for detailed migration instructions.');
    } else {
      // console.log('🎉 No hardcoded strings found! Your codebase is well internationalized.');
    }

  } catch (error) {
    console.error('❌ Error during migration analysis:', error);
    process.exit(1);
  }
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeMigration, generateTranslationKey, HardcodedString, MigrationResult };
