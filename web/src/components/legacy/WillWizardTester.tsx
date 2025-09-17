import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  type JurisdictionCode,
  type LanguageCode,
  SUPPORTED_COMBINATIONS,
  useLocalization
} from '@/contexts/LocalizationContext';
import { EnhancedWillWizard } from './EnhancedWillWizard';
import { useTranslation } from 'react-i18next';

interface TestConfiguration {
  jurisdiction: string;  // Changed from JurisdictionCode to string
  label: string;
  language: string;  // Changed from LanguageCode to string
}

export const WillWizardTester: React.FC = () => {
  const { t } = useTranslation('ui/will-wizard-tester');
  const { setLanguageCode, setJurisdictionCode, languageCode, jurisdictionCode } = useLocalization();
  const [showWizard, setShowWizard] = useState(false);
  const [currentTest, setCurrentTest] = useState<null | TestConfiguration>(null);

  const runTest = (config: TestConfiguration) => {
    setLanguageCode(config.language as LanguageCode);
    setJurisdictionCode(config.jurisdiction as JurisdictionCode);
    setCurrentTest(config);
    setShowWizard(true);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    setCurrentTest(null);
  };

  const handleWizardComplete = (willData: any) => {
    console.log('Will completed for:', currentTest, willData);
    // Create a simple HTML snapshot for testing
    const snapshot = {
      combination: `${currentTest?.language}-${currentTest?.jurisdiction}`,
      timestamp: new Date().toISOString(),
      willData,
      success: true,
    };

    // Save to localStorage for inspection
    const testResults = JSON.parse(localStorage.getItem('willWizardTests') || '[]');
    testResults.push(snapshot);
    localStorage.setItem('willWizardTests', JSON.stringify(testResults));

    alert(t('alerts.testCompleted', { label: currentTest?.label }));
    handleWizardClose();
  };

  const getStatusBadge = (config: TestConfiguration) => {
    const testResults = JSON.parse(localStorage.getItem('willWizardTests') || '[]');
    const hasTest = testResults.some((result: any) =>
      result.combination === `${config.language}-${config.jurisdiction}`
    );

    return hasTest ? (
      <Badge className="bg-green-100 text-green-800">{t('status.tested')}</Badge>
    ) : (
      <Badge variant="outline">{t('status.pending')}</Badge>
    );
  };

  const clearTestResults = () => {
    localStorage.removeItem('willWizardTests');
    window.location.reload();
  };

  const getTestResults = () => {
    const testResults = JSON.parse(localStorage.getItem('willWizardTests') || '[]');
    return testResults;
  };

  if (showWizard && currentTest) {
    return (
      <div className="fixed inset-0 z-50">
        <EnhancedWillWizard
          onClose={handleWizardClose}
          onComplete={handleWizardComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {t('subtitle')}
          </p>

          <div className="flex justify-center gap-4 mb-6">
            <div className="text-sm">
              <strong>{t('currentLabel')}</strong> {languageCode}-{jurisdictionCode}
            </div>
            <Button variant="outline" size="sm" onClick={clearTestResults}>
              {t('buttons.clearTestResults')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log('Test Results:', getTestResults())}
            >
              {t('buttons.viewTestResults')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {SUPPORTED_COMBINATIONS.map((config) => (
            <Card key={`${config.language}-${config.jurisdiction}`} className="p-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg mb-2">
                  {config.language.toUpperCase()}-{config.jurisdiction}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {config.label}
                </p>
                {getStatusBadge(config as TestConfiguration)}
              </div>

              <Button
                className="w-full"
                onClick={() => runTest(config as TestConfiguration)}
              >
                {t('buttons.testCombination', {
                  language: config.language,
                  jurisdiction: config.jurisdiction
                })}
              </Button>

              <div className="mt-3 text-xs text-muted-foreground">
                <div><strong>{t('labels.ui')}</strong> {config.language}</div>
                <div><strong>{t('labels.law')}</strong> {config.jurisdiction}</div>
                <div><strong>{t('labels.file')}</strong> {config.language}_{config.jurisdiction}.json</div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('sections.expectedCombinations')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">{t('sections.slovakiaJurisdiction')}</h3>
              <ul className="text-sm space-y-1">
                <li>• 🇸🇰 sk-SK: {t('combinations.sk-SK')}</li>
                <li>• 🇨🇿 cs-SK: {t('combinations.cs-SK')}</li>
                <li>• 🇬🇧 en-SK: {t('combinations.en-SK')}</li>
                <li>• 🇩🇪 de-SK: {t('combinations.de-SK')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">{t('sections.czechJurisdiction')}</h3>
              <ul className="text-sm space-y-1">
                <li>• 🇸🇰 sk-CZ: {t('combinations.sk-CZ')}</li>
                <li>• 🇨🇿 cs-CZ: {t('combinations.cs-CZ')}</li>
                <li>• 🇬🇧 en-CZ: {t('combinations.en-CZ')}</li>
                <li>• 🇩🇪 de-CZ: {t('combinations.de-CZ')}</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6 mt-4">
          <h2 className="text-xl font-semibold mb-4">{t('sections.testInstructions')}</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            {(t('instructions', { returnObjects: true }) as string[]).map((instruction: string, index: number) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </Card>

        <Card className="p-6 mt-4">
          <h2 className="text-xl font-semibold mb-4">{t('sections.expectedFileRouting')}</h2>
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm mb-2">
              {t('fileRouting.description')}
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                {t('fileRouting.path')}
              </code>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              {SUPPORTED_COMBINATIONS.map((config) => (
                <div key={`${config.language}-${config.jurisdiction}`}>
                  {config.language}_{config.jurisdiction}.json
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
