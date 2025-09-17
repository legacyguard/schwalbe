#!/usr/bin/env tsx

/**
 * Sample Will Generator Script
 * Generates sample wills for all language-jurisdiction combinations
 * and exports them to test-results/ directory
 */

import fs from 'fs/promises';
import path from 'path';
import { type ExportOptions, type WillExportData, willExportService } from '../services/willExportService';
import type { JurisdictionCode, LanguageCode } from '../contexts/LocalizationContext';

// Sample data for Slovak testator
const sampleWillDataSK: WillExportData = {
  testatorName: 'Ján Novák',
  birthDate: '1970-05-15',
  birthPlace: 'Bratislava',
  personalId: '7005152345',
  address: 'Hlavná 123, 811 01 Bratislava',
  citizenship: 'slovenská',
  maritalStatus: 'married',

  spouseName: 'Mária Nováková',
  children: [
    {
      name: 'Peter Novák',
      birthDate: '2000-03-10',
      relationship: 'syn'
    },
    {
      name: 'Anna Nováková',
      birthDate: '2005-08-22',
      relationship: 'dcéra'
    }
  ],

  beneficiaries: [
    {
      name: 'Mária Nováková',
      relationship: 'manželka',
      percentage: 50,
      conditions: 'ak prežije poručiteľa aspoň o 30 dní'
    },
    {
      name: 'Peter Novák',
      relationship: 'syn',
      percentage: 25
    },
    {
      name: 'Anna Nováková',
      relationship: 'dcéra',
      percentage: 25
    }
  ],

  realEstate: [
    {
      description: 'Rodinný dom',
      address: 'Hlavná 123, 811 01 Bratislava',
      value: 250000
    },
    {
      description: 'Rekreačná chata',
      address: 'Horná 45, 059 60 Tatranská Lomnica',
      value: 80000
    }
  ],

  bankAccounts: [
    {
      bank: 'Slovenská sporiteľňa',
      accountNumber: 'SK31 0900 0000 0001 2345 6789',
      type: 'bežný účet'
    },
    {
      bank: 'Všeobecná úverová banka',
      accountNumber: 'SK89 0200 0000 0029 8765 4321',
      type: 'sporiaci účet'
    }
  ],

  vehicles: [
    {
      make: 'Škoda',
      model: 'Octavia',
      year: 2020,
      vin: 'TMBJF7NE0L0123456',
      value: 22000
    }
  ],

  personalProperty: [
    {
      description: 'Šperky a hodinky',
      value: 5000,
      recipient: 'Anna Nováková'
    },
    {
      description: 'Knižná zbierka',
      value: 2000,
      recipient: 'Peter Novák'
    }
  ],

  primaryExecutor: {
    name: 'JUDr. Milan Svoboda',
    address: 'Právnická 15, 811 01 Bratislava',
    relationship: 'právny zástupca'
  },

  backupExecutor: {
    name: 'Ing. Pavel Horák',
    address: 'Ekonomická 8, 811 01 Bratislava',
    relationship: 'priateľ'
  },

  primaryGuardian: {
    name: 'Eva Nováková',
    address: 'Rodinná 67, 811 01 Bratislava',
    relationship: 'sestra'
  },

  backupGuardian: {
    name: 'Michal Novák',
    address: 'Bratská 89, 811 01 Bratislava',
    relationship: 'brat'
  },

  funeralWishes: 'Požadujem kremáciu a rozptýlenie popola v Tatrách',
  organDonation: true,
  personalMessages: 'Ďakujem svojej rodine za lásku a podporu po celý život. Pamätajte si na mňa s úsmevom.',

  willType: 'witnessed',
  createdDate: new Date().toISOString().split('T')[0],
  city: 'Bratislava'
};

// Sample data for Czech testator
const sampleWillDataCZ: WillExportData = {
  testatorName: 'Karel Svoboda',
  birthDate: '1965-11-08',
  birthPlace: 'Praha',
  personalId: '6511085432',
  address: 'Václavské náměstí 28, 110 00 Praha 1',
  citizenship: 'česká',
  maritalStatus: 'married',

  spouseName: 'Helena Svobodová',
  children: [
    {
      name: 'Tomáš Svoboda',
      birthDate: '1995-07-14',
      relationship: 'syn'
    },
    {
      name: 'Klára Svobodová',
      birthDate: '2002-12-03',
      relationship: 'dcera'
    }
  ],

  beneficiaries: [
    {
      name: 'Helena Svobodová',
      relationship: 'manželka',
      percentage: 60,
      conditions: 'pokud přežije zůstavitele alespoň o 30 dní'
    },
    {
      name: 'Tomáš Svoboda',
      relationship: 'syn',
      percentage: 20
    },
    {
      name: 'Klára Svobodová',
      relationship: 'dcera',
      percentage: 20
    }
  ],

  realEstate: [
    {
      description: 'Byt 3+1',
      address: 'Václavské náměstí 28, 110 00 Praha 1',
      value: 8500000
    }
  ],

  bankAccounts: [
    {
      bank: 'Česká spořitelna',
      accountNumber: '123456789/0800',
      type: 'běžný účet'
    },
    {
      bank: 'Československá obchodní banka',
      accountNumber: '987654321/0300',
      type: 'spořicí účet'
    }
  ],

  vehicles: [
    {
      make: 'Škoda',
      model: 'Superb',
      year: 2019,
      vin: 'TMBJF7NE0K0654321',
      value: 450000
    }
  ],

  personalProperty: [
    {
      description: 'Umělecká sbírka',
      value: 150000,
      recipient: 'Klára Svobodová'
    },
    {
      description: 'Hudební nástroje',
      value: 80000,
      recipient: 'Tomáš Svoboda'
    }
  ],

  primaryExecutor: {
    name: 'JUDr. Václav Novotný',
    address: 'Právnická 10, 110 00 Praha 1',
    relationship: 'právní zástupce'
  },

  backupExecutor: {
    name: 'Ing. Jana Procházková',
    address: 'Ekonomická 5, 110 00 Praha 1',
    relationship: 'přítelkyně'
  },

  primaryGuardian: {
    name: 'Marie Svobodová',
    address: 'Rodinná 45, 120 00 Praha 2',
    relationship: 'sestra'
  },

  backupGuardian: {
    name: 'Josef Svoboda',
    address: 'Bratrská 67, 130 00 Praha 3',
    relationship: 'bratr'
  },

  funeralWishes: 'Požaduji pohřeb v rodinné hrobce na Olšanech',
  organDonation: false,
  personalMessages: 'Děkuji své rodině za krásný společný život. Buďte šťastní a pamatujte si na mě v dobrém.',

  willType: 'holographic',
  createdDate: new Date().toISOString().split('T')[0],
  city: 'Praha'
};

// All language-jurisdiction combinations
const combinations: Array<{
  jurisdiction: JurisdictionCode;
  label: string;
  language: LanguageCode;
  testatorData: WillExportData;
}> = [
  {
    language: 'sk',
    jurisdiction: 'SK',
    label: 'Slovak-Slovakia',
    testatorData: sampleWillDataSK
  },
  {
    language: 'cs',
    jurisdiction: 'SK',
    label: 'Czech-Slovakia',
    testatorData: sampleWillDataSK
  },
  {
    language: 'en',
    jurisdiction: 'SK',
    label: 'English-Slovakia',
    testatorData: sampleWillDataSK
  },
  {
    language: 'de',
    jurisdiction: 'SK',
    label: 'German-Slovakia',
    testatorData: sampleWillDataSK
  },
  {
    language: 'sk',
    jurisdiction: 'CZ',
    label: 'Slovak-Czech Republic',
    testatorData: sampleWillDataCZ
  },
  {
    language: 'cs',
    jurisdiction: 'CZ',
    label: 'Czech-Czech Republic',
    testatorData: sampleWillDataCZ
  },
  {
    language: 'en',
    jurisdiction: 'CZ',
    label: 'English-Czech Republic',
    testatorData: sampleWillDataCZ
  },
  {
    language: 'de',
    jurisdiction: 'CZ',
    label: 'German-Czech Republic',
    testatorData: sampleWillDataCZ
  }
];

/**
 * Generate sample wills for all combinations
 */
async function generateSampleWills() {
  // console.log('🚀 Starting sample will generation for all language-jurisdiction combinations...\n');

  const testResultsDir = path.join(process.cwd(), '../../test-results');

  // Ensure test-results directory exists
  try {
    await fs.access(testResultsDir);
  } catch {
    await fs.mkdir(testResultsDir, { recursive: true });
    // console.log(`📁 Created test-results directory: ${testResultsDir}`);
  }

  let successCount = 0;
  let errorCount = 0;
  const results: string[] = [];

  for (const combination of combinations) {
    // console.log(`\n📝 Generating will for ${combination.label} (${combination.language}-${combination.jurisdiction})...`);

    const exportOptions: ExportOptions = {
      format: 'pdf',
      language: combination.language,
      jurisdiction: combination.jurisdiction,
      includeExecutionInstructions: true,
      includeJurisdictionInfo: true
    };

    try {
      // Generate PDF
      const pdfBlob = await willExportService.exportWill(combination.testatorData, exportOptions);
      const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());
      const pdfFilename = `Sample-Will-${combination.language}-${combination.jurisdiction}-${new Date().toISOString().split('T')[0]}.pdf`;
      const pdfPath = path.join(testResultsDir, pdfFilename);

      await fs.writeFile(pdfPath, pdfBuffer);
      // console.log(`✅ PDF saved: ${pdfFilename}`);

      // Generate DOCX
      const docxOptions: ExportOptions = { ...exportOptions, format: 'docx' };
      const docxBlob = await willExportService.exportWill(combination.testatorData, docxOptions);
      const docxBuffer = Buffer.from(await docxBlob.arrayBuffer());
      const docxFilename = `Sample-Will-${combination.language}-${combination.jurisdiction}-${new Date().toISOString().split('T')[0]}.docx`;
      const docxPath = path.join(testResultsDir, docxFilename);

      await fs.writeFile(docxPath, docxBuffer);
      // console.log(`✅ DOCX saved: ${docxFilename}`);

      // Generate Markdown
      const mdOptions: ExportOptions = { ...exportOptions, format: 'markdown' };
      const mdBlob = await willExportService.exportWill(combination.testatorData, mdOptions);
      const mdBuffer = Buffer.from(await mdBlob.arrayBuffer());
      const mdFilename = `Sample-Will-${combination.language}-${combination.jurisdiction}-${new Date().toISOString().split('T')[0]}.md`;
      const mdPath = path.join(testResultsDir, mdFilename);

      await fs.writeFile(mdPath, mdBuffer);
      // console.log(`✅ MD saved: ${mdFilename}`);

      successCount++;
      results.push(`✅ ${combination.label}: PDF, DOCX, MD generated successfully`);

    } catch (error) {
      console.error(`❌ Error generating will for ${combination.label}:`, error);
      errorCount++;
      results.push(`❌ ${combination.label}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate summary report
  const summaryReport = {
    generatedAt: new Date().toISOString(),
    totalCombinations: combinations.length,
    successfulGenerations: successCount,
    failedGenerations: errorCount,
    combinations: combinations.map(c => ({
      language: c.language,
      jurisdiction: c.jurisdiction,
      label: c.label,
      testatorName: c.testatorData.testatorName,
      willType: c.testatorData.willType
    })),
    results,
    files: {
      pattern: 'Sample-Will-{language}-{jurisdiction}-{date}.{format}',
      formats: ['pdf', 'docx', 'md'],
      location: testResultsDir
    },
    legalFrameworks: {
      SK: '§ 476-478 Slovak Civil Code',
      CZ: '§ 1540-1542 Czech Civil Code'
    },
    testingInstructions: [
      '1. Open each PDF file and verify proper formatting',
      '2. Check that headers show correct jurisdiction',
      '3. Verify that legal requirements are correctly stated for each jurisdiction',
      '4. Confirm that witness requirements differ between SK and CZ',
      '5. Check that holographic will dating requirements are correct (optional for SK, mandatory for CZ)',
      '6. Verify language consistency throughout each document',
      '7. Test DOCX files in Microsoft Word',
      '8. Review Markdown files in a text editor or Markdown viewer'
    ]
  };

  const reportPath = path.join(testResultsDir, 'generation-summary.json');
  await fs.writeFile(reportPath, JSON.stringify(summaryReport, null, 2));

  // Generate detailed README
  const readmeContent = `# Will Export Test Results

Generated on: ${new Date().toLocaleString()}

## Summary
- **Total Combinations**: ${combinations.length}
- **Successful Generations**: ${successCount}
- **Failed Generations**: ${errorCount}

## Generated Files

All files follow the pattern: \`Sample-Will-{language}-{jurisdiction}-{date}.{format}\`

### Language-Jurisdiction Combinations

${combinations.map(c => `
#### ${c.label} (${c.language}-${c.jurisdiction})
- **Testator**: ${c.testatorData.testatorName}
- **Will Type**: ${c.testatorData.willType}
- **Legal Framework**: ${c.jurisdiction === 'SK' ? '§ 476-478 Slovak Civil Code' : '§ 1540-1542 Czech Civil Code'}
- **Files**: PDF, DOCX, MD
`).join('')}

## Key Differences Between Jurisdictions

### Slovakia (SK)
- **Currency**: EUR
- **Minimum Age**: 18 years
- **Holographic Dating**: Recommended but not mandatory
- **Witness Requirements**: 2 witnesses, cannot be heirs or their relatives
- **Legal Basis**: § 476-478 Slovak Civil Code

### Czech Republic (CZ) 
- **Currency**: CZK
- **Minimum Age**: 15 years
- **Holographic Dating**: MANDATORY
- **Witness Requirements**: 2 witnesses, cannot be heirs or their spouses
- **Legal Basis**: § 1540-1542 Czech Civil Code

## Testing Checklist

${summaryReport.testingInstructions.map(instruction => `- [ ] ${instruction}`).join('\n')}

## Results

${results.map(result => `- ${result}`).join('\n')}

---

*Generated by LegacyGuard Will Export Service - Testing all language-jurisdiction combinations*
`;

  const readmePath = path.join(testResultsDir, 'README.md');
  await fs.writeFile(readmePath, readmeContent);

  // Final summary
  // console.log('\n' + '='.repeat(80));
  // console.log('📋 GENERATION COMPLETE');
  // console.log('='.repeat(80));
  // console.log(`✅ Successfully generated: ${successCount}/${combinations.length} combinations`);
  // console.log(`❌ Failed generations: ${errorCount}`);
  // console.log(`📁 Files saved to: ${testResultsDir}`);
  // console.log(`📊 Summary report: ${reportPath}`);
  // console.log(`📖 Documentation: ${readmePath}`);

  if (errorCount === 0) {
    // console.log('\n🎉 All language-jurisdiction combinations generated successfully!');
  } else {
    // console.log(`\n⚠️  ${errorCount} combinations failed. Check the error messages above.`);
  }

  // console.log('\n🔍 Manual Testing Instructions:');
  summaryReport.testingInstructions.forEach((instruction, index) => {
    // console.log(`   ${index + 1}. ${instruction}`);
  });

  // console.log('\n✨ Export functionality is ready for production use!');
}

// Run the generator if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSampleWills().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

export { generateSampleWills };
