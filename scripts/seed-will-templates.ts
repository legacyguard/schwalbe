#!/usr/bin/env node

/**
 * Seed Will Templates Script
 * Loads and validates Slovak will templates into the template library
 */

// Import path needs to be adjusted for running from scripts directory
// We'll create the template library instance directly
import type { WillTemplate } from '../web/src/types/will-templates';

async function seedTemplates() {
  console.log('🌱 Seeding Slovak will templates...');

  const templateLibrary = new (TemplateLibraryImpl as any)();

  try {
    // Test loading Slovak templates
    console.log('📋 Testing template loading...');

    // 1. Test holographic template
    console.log('  - Loading holographic template...');
    const holographicTemplate = await templateLibrary.getTemplate('SK', 'holographic', 'sk');
    console.log(`    ✅ Loaded: ${holographicTemplate.metadata.name}`);

    // 2. Test witnessed template
    console.log('  - Loading witnessed template...');
    const witnessedTemplate = await templateLibrary.getTemplate('SK', 'witnessed', 'sk');
    console.log(`    ✅ Loaded: ${witnessedTemplate.metadata.name}`);

    // 3. Test notarial template
    console.log('  - Loading notarial template...');
    const notarialTemplate = await templateLibrary.getTemplate('SK', 'notarial', 'sk');
    console.log(`    ✅ Loaded: ${notarialTemplate.metadata.name}`);

    // Test jurisdiction configuration
    console.log('🏛️  Testing jurisdiction configuration...');
    const skConfig = await templateLibrary.getJurisdictionConfig('SK');
    console.log(`    ✅ Slovakia jurisdiction loaded: ${skConfig.countryName.sk}`);
    console.log(`    📝 Supported languages: ${skConfig.supportedLanguages.join(', ')}`);
    console.log(`    ⚖️  Witness requirements: ${skConfig.legalRequirements.witnessRequirements.minimumCount} witnesses for witnessed will`);

    // Test validation
    console.log('🔍 Testing template validation...');

    // Sample user data for testing
    const testUserData = {
      personal: {
        fullName: 'Ján Testovací',
        dateOfBirth: '1980-01-01',
        placeOfBirth: 'Bratislava',
        personalId: '800101/1234',
        citizenship: 'Slovak',
        maritalStatus: 'married' as const,
        address: {
          street: 'Testovacia 123',
          city: 'Bratislava',
          postalCode: '811 01',
          country: 'Slovakia'
        }
      },
      family: {
        spouse: {
          fullName: 'Mária Testovacia',
          dateOfBirth: '1982-05-15',
          placeOfBirth: 'Košice',
          citizenship: 'Slovak',
          maritalStatus: 'married' as const,
          address: {
            street: 'Testovacia 123',
            city: 'Bratislava',
            postalCode: '811 01',
            country: 'Slovakia'
          }
        },
        children: [
          {
            fullName: 'Peter Testovací',
            dateOfBirth: '2010-03-20',
            placeOfBirth: 'Bratislava',
            citizenship: 'Slovak',
            maritalStatus: 'single' as const,
            isMinor: true,
            address: {
              street: 'Testovacia 123',
              city: 'Bratislava',
              postalCode: '811 01',
              country: 'Slovakia'
            }
          }
        ]
      },
      beneficiaries: [
        {
          id: 'spouse',
          name: 'Mária Testovacia',
          relationship: 'spouse',
          share: {
            type: 'percentage' as const,
            value: 50
          },
          address: {
            street: 'Testovacia 123',
            city: 'Bratislava',
            postalCode: '811 01',
            country: 'Slovakia'
          }
        },
        {
          id: 'child1',
          name: 'Peter Testovací',
          relationship: 'child',
          share: {
            type: 'percentage' as const,
            value: 50
          },
          address: {
            street: 'Testovacia 123',
            city: 'Bratislava',
            postalCode: '811 01',
            country: 'Slovakia'
          }
        }
      ],
      assets: [],
      executors: [
        {
          id: 'primary',
          name: 'Jozef Testovací',
          relationship: 'brother',
          isProfessional: false,
          address: {
            street: 'Bratislavská 456',
            city: 'Bratislava',
            postalCode: '821 01',
            country: 'Slovakia'
          },
          contactInfo: {
            email: 'jozef@example.com'
          }
        }
      ],
      guardians: [],
      specialInstructions: []
    };

    // Validate holographic template
    const holographicValidation = await templateLibrary.validateWillData(testUserData, holographicTemplate);
    console.log(`    ✅ Holographic validation: ${holographicValidation.isValid ? 'VALID' : 'INVALID'}`);
    if (!holographicValidation.isValid) {
      console.log(`       Errors: ${holographicValidation.errors.length}`);
    }

    // Validate witnessed template
    const witnessedValidation = await templateLibrary.validateWillData(testUserData, witnessedTemplate);
    console.log(`    ⚠️  Witnessed validation: ${witnessedValidation.isValid ? 'VALID' : 'INVALID (expected - needs witnesses)'}`);
    if (!witnessedValidation.isValid) {
      console.log(`       Errors: ${witnessedValidation.errors.length} (expected - witness validation)`);
    }

    // Get all templates
    console.log('📚 Getting all available templates...');
    const allTemplates = await templateLibrary.getAllTemplates();
    console.log(`    ✅ Total templates loaded: ${allTemplates.length}`);

    allTemplates.forEach((template: WillTemplate) => {
      console.log(`       - ${template.id}: ${template.metadata.name}`);
    });

    console.log('🎉 Template seeding completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log(`   📋 Templates loaded: ${allTemplates.length}`);
    console.log(`   🏛️  Jurisdictions: Slovakia (SK)`);
    console.log(`   🗣️  Languages: Slovak (sk)`);
    console.log(`   ⚖️  Will types: holographic, witnessed (2 witnesses), notarial`);

  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
}

// Run the seeding
seedTemplates().catch((error) => {
  console.error('💥 Fatal error during seeding:', error);
  process.exit(1);
});

export { seedTemplates };
