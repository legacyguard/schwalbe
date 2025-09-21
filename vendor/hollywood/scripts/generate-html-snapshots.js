#!/usr/bin/env node

/**
 * Simple HTML Snapshot Generator for Will Wizard Combinations
 * 
 * This script generates static HTML snapshots for each language-jurisdiction
 * combination by fetching the test page and creating documentation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMBINATIONS = [
  { language: 'sk', jurisdiction: 'SK', label: 'Slovenčina (Slovensko)', file: 'sk_SK.json' },
  { language: 'cs', jurisdiction: 'SK', label: 'Čeština (Slovensko)', file: 'cs_SK.json' },
  { language: 'en', jurisdiction: 'SK', label: 'English (Slovakia)', file: 'en_SK.json' },
  { language: 'de', jurisdiction: 'SK', label: 'Deutsch (Slowakei)', file: 'de_SK.json' },
  { language: 'sk', jurisdiction: 'CZ', label: 'Slovenčina (Česko)', file: 'sk_CZ.json' },
  { language: 'cs', jurisdiction: 'CZ', label: 'Čeština (Česko)', file: 'cs_CZ.json' },
  { language: 'en', jurisdiction: 'CZ', label: 'English (Czech Republic)', file: 'en_CZ.json' },
  { language: 'de', jurisdiction: 'CZ', label: 'Deutsch (Tschechien)', file: 'de_CZ.json' },
];

const SNAPSHOTS_DIR = path.join(__dirname, '../test-snapshots');

async function ensureSnapshotsDirectory() {
  try {
    await fs.promises.access(SNAPSHOTS_DIR);
  } catch {
    await fs.promises.mkdir(SNAPSHOTS_DIR, { recursive: true });
    console.log(`📁 Created snapshots directory: ${SNAPSHOTS_DIR}`);
  }
}

async function generateTestDocumentation() {
  console.log('📋 Generating HTML test documentation...');
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Will Wizard Language-Jurisdiction Test Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .combinations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .combination-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #3b82f6;
        }
        .combination-title {
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1e40af;
        }
        .combination-details {
            margin: 10px 0;
            padding: 15px;
            background-color: #f1f5f9;
            border-radius: 8px;
        }
        .section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .section h2 {
            color: #1e40af;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
        }
        .feature-list {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .feature-list li:before {
            content: "✅ ";
            margin-right: 8px;
        }
        .code-block {
            background-color: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            overflow-x: auto;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .badge-sk { background-color: #dcfce7; color: #166534; }
        .badge-cz { background-color: #dbeafe; color: #1d4ed8; }
        .badge-en { background-color: #fef3c7; color: #d97706; }
        .badge-de { background-color: #f3e8ff; color: #7c3aed; }
        .routing-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .routing-table th,
        .routing-table td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
        }
        .routing-table th {
            background-color: #f8fafc;
            font-weight: 600;
        }
        .timestamp {
            color: #64748b;
            font-size: 0.875rem;
            text-align: center;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ Will Wizard Language-Jurisdiction Test Suite</h1>
        <p>Comprehensive testing documentation for all supported language and jurisdiction combinations</p>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
    </div>

    <div class="section">
        <h2>📊 Test Combinations Overview</h2>
        <p>The system supports <strong>${COMBINATIONS.length} combinations</strong> of interface language and legal jurisdiction:</p>
        
        <div class="combinations-grid">
            ${COMBINATIONS.map(combo => `
                <div class="combination-card">
                    <div class="combination-title">
                        ${combo.language.toUpperCase()}-${combo.jurisdiction}
                    </div>
                    <div class="combination-details">
                        <strong>Label:</strong> ${combo.label}<br>
                        <strong>Translation File:</strong> <code>${combo.file}</code><br>
                        <strong>UI Language:</strong> <span class="badge badge-${combo.language}">${combo.language}</span><br>
                        <strong>Legal Jurisdiction:</strong> <span class="badge badge-${combo.jurisdiction.toLowerCase()}">${combo.jurisdiction}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>🎯 Implementation Features</h2>
        <ul class="feature-list">
            <li>Separation of UI language from legal jurisdiction</li>
            <li>Support for 4 languages: Slovak (sk), Czech (cs), English (en), German (de)</li>
            <li>Support for 2 jurisdictions: Slovakia (SK), Czech Republic (CZ)</li>
            <li>Dynamic translation file loading based on language-jurisdiction combination</li>
            <li>Enhanced CountrySelector with step-by-step language and jurisdiction selection</li>
            <li>LocalStorage persistence of user preferences</li>
            <li>Proper fallback handling for missing translations</li>
            <li>Responsive design with mobile optimization</li>
        </ul>
    </div>

    <div class="section">
        <h2>🗂️ File Routing Structure</h2>
        <p>Translation files are loaded according to this pattern:</p>
        <div class="code-block">
/web/public/locales/content/wills/[language]_[jurisdiction].json
        </div>
        
        <table class="routing-table">
            <thead>
                <tr>
                    <th>Combination</th>
                    <th>File Path</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${COMBINATIONS.map(combo => `
                    <tr>
                        <td><strong>${combo.language}-${combo.jurisdiction}</strong></td>
                        <td><code>${combo.file}</code></td>
                        <td>${combo.label}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>🔧 Testing Instructions</h2>
        <ol>
            <li><strong>Start Development Server:</strong>
                <div class="code-block">cd /Users/luborfedak/Documents/Github/hollywood/web && npm run dev</div>
            </li>
            <li><strong>Navigate to Test Page:</strong>
                <div class="code-block">http://localhost:8082/test/will-wizard-combinations</div>
            </li>
            <li><strong>Test Each Combination:</strong>
                <ul>
                    <li>Click each "Test [language]-[jurisdiction]" button</li>
                    <li>Verify the language selection step shows correctly</li>
                    <li>Verify the jurisdiction selection step shows correctly</li>
                    <li>Verify the confirmation step displays the correct combination</li>
                    <li>Click "Start Creating Will" to enter the wizard</li>
                    <li>Verify the wizard interface uses the selected language</li>
                    <li>Verify legal requirements match the selected jurisdiction</li>
                </ul>
            </li>
            <li><strong>HTML Snapshots:</strong>
                <ul>
                    <li>Use browser developer tools to save HTML snapshots</li>
                    <li>Test on different screen sizes (mobile, tablet, desktop)</li>
                    <li>Verify accessibility features work correctly</li>
                </ul>
            </li>
        </ol>
    </div>

    <div class="section">
        <h2>⚖️ Legal Compliance Verification</h2>
        <div class="combinations-grid">
            <div class="combination-card">
                <div class="combination-title">🇸🇰 Slovakia (SK)</div>
                <div class="combination-details">
                    <strong>Legal Framework:</strong> Slovak Civil Code § 476-478<br>
                    <strong>Currency:</strong> EUR<br>
                    <strong>Holographic:</strong> Dating recommended<br>
                    <strong>Witnessed:</strong> 2 witnesses (not beneficiaries or relatives)<br>
                    <strong>Minimum Age:</strong> 18 years
                </div>
            </div>
            <div class="combination-card">
                <div class="combination-title">🇨🇿 Czech Republic (CZ)</div>
                <div class="combination-details">
                    <strong>Legal Framework:</strong> Czech Civil Code § 1540-1542<br>
                    <strong>Currency:</strong> CZK<br>
                    <strong>Holographic:</strong> Dating MANDATORY<br>
                    <strong>Witnessed:</strong> 2 witnesses (not beneficiaries OR their spouses)<br>
                    <strong>Minimum Age:</strong> 15 years
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📋 Test Checklist</h2>
        <p>For each of the ${COMBINATIONS.length} combinations, verify:</p>
        <ul class="feature-list">
            <li>Language selection interface displays correctly</li>
            <li>Jurisdiction selection interface displays correctly</li>
            <li>Confirmation step shows accurate information</li>
            <li>Will wizard launches with correct language</li>
            <li>Legal requirements match selected jurisdiction</li>
            <li>Translation file loads properly</li>
            <li>Fallback behavior works if translation is missing</li>
            <li>LocalStorage saves preferences correctly</li>
            <li>Mobile responsive design works</li>
            <li>Accessibility features function properly</li>
        </ul>
    </div>

    <div class="timestamp">
        🚀 Will Wizard Testing Suite - ${new Date().getFullYear()} LegacyGuard
    </div>
</body>
</html>
`;

  const htmlPath = path.join(SNAPSHOTS_DIR, 'test-documentation.html');
  await fs.promises.writeFile(htmlPath, htmlContent);
  console.log(`📄 Test documentation saved to: ${htmlPath}`);
  
  return htmlPath;
}

async function generateSummaryReport() {
  console.log('📊 Generating test summary report...');
  
  const summaryData = {
    generated: new Date().toISOString(),
    totalCombinations: COMBINATIONS.length,
    combinations: COMBINATIONS,
    testUrls: {
      testPage: 'http://localhost:8082/test/will-wizard-combinations',
      devServer: 'http://localhost:8082',
    },
    fileRouting: COMBINATIONS.reduce((acc, combo) => {
      acc[`${combo.language}-${combo.jurisdiction}`] = `/web/public/locales/content/wills/${combo.file}`;
      return acc;
    }, {}),
    expectedFeatures: [
      'Language-Jurisdiction separation',
      'Enhanced CountrySelector with steps',
      'LocalStorage preference persistence',
      'German language support',
      'Slovak and Czech jurisdiction support',
      'Responsive mobile design',
      'Accessibility compliance'
    ],
    jurisdictionDifferences: {
      Slovakia: {
        code: 'SK',
        currency: 'EUR',
        legalBasis: '§ 476-478 Slovak Civil Code',
        holographicDating: 'recommended',
        witnessRestrictions: 'not beneficiaries or relatives',
        minimumAge: 18
      },
      CzechRepublic: {
        code: 'CZ',
        currency: 'CZK',
        legalBasis: '§ 1540-1542 Czech Civil Code',
        holographicDating: 'mandatory',
        witnessRestrictions: 'not beneficiaries or their spouses',
        minimumAge: 15
      }
    }
  };

  const reportPath = path.join(SNAPSHOTS_DIR, 'test-summary.json');
  await fs.promises.writeFile(reportPath, JSON.stringify(summaryData, null, 2));
  console.log(`📊 Test summary saved to: ${reportPath}`);
  
  return reportPath;
}

async function main() {
  console.log('🚀 Generating HTML snapshots and documentation...');
  console.log(`📍 Processing ${COMBINATIONS.length} language-jurisdiction combinations`);
  
  await ensureSnapshotsDirectory();
  
  const htmlDocPath = await generateTestDocumentation();
  const summaryPath = await generateSummaryReport();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 GENERATED FILES');
  console.log('='.repeat(60));
  console.log(`📄 Test Documentation: ${htmlDocPath}`);
  console.log(`📊 Summary Report: ${summaryPath}`);
  
  console.log('\n🎯 EXPECTED COMBINATIONS:');
  COMBINATIONS.forEach(combo => {
    console.log(`  • ${combo.language}-${combo.jurisdiction}: ${combo.label}`);
  });
  
  console.log('\n📁 All files saved to:');
  console.log(`   ${SNAPSHOTS_DIR}`);
  
  console.log('\n🌐 To test manually:');
  console.log('   1. Start dev server: npm run dev');
  console.log('   2. Open: http://localhost:8082/test/will-wizard-combinations');
  console.log(`   3. Open documentation: file://${htmlDocPath}`);
  
  console.log('\n✅ Documentation generation complete!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}
