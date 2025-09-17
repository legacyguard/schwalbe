/**
 * Will Translation Showcase
 * Comprehensive demonstration of all language-jurisdiction combinations
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useJurisdictionAwareTranslation } from '@/lib/i18n/jurisdiction-aware-hooks';
import { willTranslationService } from '@/lib/i18n/will-translation-service';
import type { SupportedJurisdictionCode, SupportedLanguageCode } from '@/lib/i18n/config';

interface TestScenario {
  description: string;
  expectedFile: string;
  id: string;
  jurisdiction: SupportedJurisdictionCode;
  language: SupportedLanguageCode;
  name: string;
}

const WillTranslationShowcase: React.FC = () => {
  const { t } = useTranslation('components/will-translation-showcase');
  const [selectedScenario, setSelectedScenario] = useState<null | TestScenario>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Test scenarios covering all combinations - now with German
  const testScenarios: TestScenario[] = [
    // Czech Republic scenarios
    {
      id: 'cz-cs',
      name: t('testScenarios.csCZ.name'),
      language: 'cs',
      jurisdiction: 'CZ',
      description: t('testScenarios.csCZ.description'),
      expectedFile: 'cs_CZ.json'
    },
    {
      id: 'cz-sk',
      name: t('testScenarios.skCZ.name'),
      language: 'sk',
      jurisdiction: 'CZ',
      description: t('testScenarios.skCZ.description'),
      expectedFile: 'sk_CZ.json'
    },
    {
      id: 'cz-en',
      name: t('testScenarios.enCZ.name'),
      language: 'en',
      jurisdiction: 'CZ',
      description: t('testScenarios.enCZ.description'),
      expectedFile: 'en_CZ.json'
    },
    {
      id: 'cz-de',
      name: t('testScenarios.deCZ.name'),
      language: 'de',
      jurisdiction: 'CZ',
      description: t('testScenarios.deCZ.description'),
      expectedFile: 'de_CZ.json'
    },
    // Slovakia scenarios
    {
      id: 'sk-sk',
      name: t('testScenarios.skSK.name'),
      language: 'sk',
      jurisdiction: 'SK',
      description: t('testScenarios.skSK.description'),
      expectedFile: 'sk_SK.json'
    },
    {
      id: 'sk-cs',
      name: t('testScenarios.csSK.name'),
      language: 'cs',
      jurisdiction: 'SK',
      description: t('testScenarios.csSK.description'),
      expectedFile: 'cs_SK.json'
    },
    {
      id: 'sk-en',
      name: t('testScenarios.enSK.name'),
      language: 'en',
      jurisdiction: 'SK',
      description: t('testScenarios.enSK.description'),
      expectedFile: 'en_SK.json'
    },
    {
      id: 'sk-de',
      name: t('testScenarios.deSK.name'),
      language: 'de',
      jurisdiction: 'SK',
      description: t('testScenarios.deSK.description'),
      expectedFile: 'de_SK.json'
    }
  ];

  // Load scenario translations
  const loadScenario = async (scenario: TestScenario) => {
    setIsLoading(true);
    try {
      // Change UI language
      await i18n.changeLanguage(scenario.language);

      // Load jurisdiction-specific translations
      await willTranslationService.loadTranslations({
        jurisdiction: scenario.jurisdiction,
        language: scenario.language,
        fallbackLanguage: 'en' as SupportedLanguageCode
      });

      setSelectedScenario(scenario);
    } catch (error) {
      console.error('Failed to load scenario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use jurisdiction-aware translation hook for selected scenario
  const { t, isContentLoaded } = useJurisdictionAwareTranslation(
    selectedScenario?.jurisdiction || 'SK',
    'wills'
  );

  // Sample data for template filling
  const sampleData = {
    fullName: 'John Smith',
    dateOfBirth: '01.01.1970',
    address: selectedScenario?.jurisdiction === 'CZ' ? 'Prague, Czech Republic' : 'Bratislava, Slovakia',
    citizenship: selectedScenario?.jurisdiction === 'CZ' ? 'Czech' : 'Slovak',
    city: selectedScenario?.jurisdiction === 'CZ' ? 'Prague' : 'Bratislava',
    date: new Date().toLocaleDateString('en-GB'),
    amount: 10000
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
{t('title')}
      </h1>

      {/* Configuration Matrix */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('ui.availableConfigurations', { defaultValue: 'Available Configurations' })}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {testScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => loadScenario(scenario)}
              disabled={isLoading}
              className={`p-4 border rounded-lg transition-all ${
                selectedScenario?.id === scenario.id
                  ? 'bg-blue-50 border-blue-500 shadow-md'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-semibold text-sm">{scenario.name}</div>
              <div className="text-xs text-gray-600 mt-1">{scenario.description}</div>
              <div className="text-xs text-blue-600 mt-2 font-mono">{scenario.expectedFile}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Configuration Details */}
      {selectedScenario && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3">{t('ui.activeConfiguration', { defaultValue: 'Active Configuration' })}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t('ui.language', { defaultValue: 'Language:' })}</span>
              <span className="ml-2 font-semibold">
                {selectedScenario.language === 'en' ? 'English' :
                 selectedScenario.language === 'cs' ? 'Czech' :
                 selectedScenario.language === 'de' ? 'German' : 'Slovak'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">{t('ui.jurisdiction')}:</span>
              <span className="ml-2 font-semibold">
                {selectedScenario.jurisdiction === 'CZ' ? 'Czech Republic' : 'Slovakia'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">{t('ui.currency', { defaultValue: 'Currency:' })}</span>
              <span className="ml-2 font-semibold">
                {willTranslationService.formatCurrency(
                  sampleData.amount,
                  selectedScenario.jurisdiction,
                  selectedScenario.language
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-600">{t('ui.legalCode', { defaultValue: 'Legal Code:' })}</span>
              <span className="ml-2 font-semibold">
                {selectedScenario.jurisdiction === 'CZ' ? '89/2012' : '40/1964'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Translation Content Display */}
      {selectedScenario && isContentLoaded && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{String(t('title'))}</h2>

          {/* Legal Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm">{String(t('legalNotice'))}</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Testator Declaration */}
            <section>
              <h3 className="font-semibold text-lg mb-2">{String(t('sections.testator.title'))}</h3>
              <p className="mb-2">{String(t('sections.testator.declaration', sampleData))}</p>
              <p className="text-gray-700">{String(t('sections.testator.mentalCapacity'))}</p>
            </section>

            {/* Forced Heirs (Jurisdiction-specific) */}
            <section>
              <h3 className="font-semibold text-lg mb-2">{String(t('sections.forcedHeirs.title'))}</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="mb-3">{String(t('sections.forcedHeirs.notice'))}</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>{String(t('sections.forcedHeirs.minorChildren'))}</li>
                  <li>{String(t('sections.forcedHeirs.adultChildren'))}</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  {String(t('sections.forcedHeirs.disinheritance'))}
                </p>
              </div>
            </section>

            {/* Legal Requirements */}
            <section>
              <h3 className="font-semibold text-lg mb-2">Legal Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium mb-1">Holographic</h4>
                  <p className="text-sm">{String(t('legalRequirements.formTypes.holographic'))}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium mb-1">Allographic</h4>
                  <p className="text-sm">{String(t('legalRequirements.formTypes.allographic'))}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium mb-1">Notarial</h4>
                  <p className="text-sm">{String(t('legalRequirements.formTypes.notarial'))}</p>
                </div>
              </div>
            </section>

            {/* Specific Bequests Example */}
            <section>
              <h3 className="font-semibold text-lg mb-2">{String(t('sections.specificBequests.title'))}</h3>
              <p className="mb-2">{String(t('sections.specificBequests.introduction'))}</p>
              <div className="ml-4 text-gray-700">
                <p>• {String(t('sections.specificBequests.monetary', {
                  amount: willTranslationService.formatCurrency(
                    5000,
                    selectedScenario.jurisdiction,
                    selectedScenario.language
                  ),
                  recipient: 'Jane Doe'
                }))}</p>
              </div>
            </section>

            {/* International features for expats */}
            {(selectedScenario.language === 'en' || selectedScenario.language === 'de') && (
              <section className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold text-lg mb-2">
                  {selectedScenario.language === 'en' ? 'International Considerations' : 'Internationale Aspekte'}
                </h3>
                <p className="text-sm mb-2">
                  {selectedScenario.language === 'en'
                    ? 'This English version maintains legal accuracy while being accessible to international residents.'
                    : 'Diese deutsche Version gewährleistet rechtliche Genauigkeit für deutschsprachige Einwohner.'}
                </p>
                <ul className="list-disc ml-6 text-sm space-y-1">
                  <li>
                    {selectedScenario.language === 'en'
                      ? 'All legal references use official English translations'
                      : 'Alle rechtlichen Bezüge verwenden offizielle deutsche Übersetzungen'}
                  </li>
                  <li>Currency displays in local format ({selectedScenario.jurisdiction === 'CZ' ? 'CZK' : 'EUR'})</li>
                  <li>
                    {selectedScenario.language === 'en'
                      ? 'Dates follow international format (DD.MM.YYYY)'
                      : 'Datumsformat nach deutscher Norm (TT.MM.JJJJ)'}
                  </li>
                  <li>
                    {selectedScenario.language === 'en'
                      ? 'Legal terminology explained in common English terms'
                      : 'Rechtsterminologie in verständlichem Deutsch erklärt'}
                  </li>
                  {selectedScenario.language === 'de' && (
                    <li>EU-Erbrechtsverordnung berücksichtigt</li>
                  )}
                </ul>
              </section>
            )}
          </div>

          {/* Legal Reference */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600">
              <strong>Legal Reference:</strong> {willTranslationService.getLegalReference(
                selectedScenario.jurisdiction,
                selectedScenario.language
              )}
            </p>
          </div>
        </div>
      )}

      {/* Testing Summary */}
      <div className="mt-6 bg-gray-100 rounded-lg p-6">
        <h3 className="font-semibold mb-3">{t('ui.systemCapabilities', { defaultValue: 'System Capabilities' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">{t('ui.supportedCombinations', { defaultValue: 'Supported Combinations:' })}</h4>
            <ul className="list-check ml-4 space-y-1">
              <li>✅ Czech law in Czech language</li>
              <li>✅ Czech law in Slovak language</li>
              <li>✅ Czech law in English language</li>
              <li>✅ Czech law in German language</li>
              <li>✅ Slovak law in Slovak language</li>
              <li>✅ Slovak law in Czech language</li>
              <li>✅ Slovak law in English language</li>
              <li>✅ Slovak law in German language</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">{t('ui.keyFeatures', { defaultValue: 'Key Features:' })}</h4>
            <ul className="list-check ml-4 space-y-1">
              <li>✅ Jurisdiction-specific legal terms</li>
              <li>✅ Proper currency formatting</li>
              <li>✅ Correct forced heir rules</li>
              <li>✅ Language fallback chain</li>
              <li>✅ International user support</li>
              <li>✅ Legal reference accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WillTranslationShowcase;
