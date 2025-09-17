import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { CountrySelector } from '@/components/legacy/CountrySelector';
import {
  type JurisdictionCode,
  type LanguageCode,
  SUPPORTED_COMBINATIONS,
  useLocalization,
} from '@/contexts/LocalizationContext';

interface TestCombination {
  file: string;
  jurisdiction: JurisdictionCode;
  label: string;
  language: LanguageCode;
}

const TEST_COMBINATIONS: TestCombination[] = [
  { language: 'sk', jurisdiction: 'SK', label: 'Slovenčina (Slovensko)', file: 'sk_SK.json' },
  { language: 'cs', jurisdiction: 'SK', label: 'Čeština (Slovensko)', file: 'cs_SK.json' },
  { language: 'en', jurisdiction: 'SK', label: 'English (Slovakia)', file: 'en_SK.json' },
  { language: 'de', jurisdiction: 'SK', label: 'Deutsch (Slowakei)', file: 'de_SK.json' },
  { language: 'sk', jurisdiction: 'CZ', label: 'Slovenčina (Česko)', file: 'sk_CZ.json' },
  { language: 'cs', jurisdiction: 'CZ', label: 'Čeština (Česko)', file: 'cs_CZ.json' },
  { language: 'en', jurisdiction: 'CZ', label: 'English (Czech Republic)', file: 'en_CZ.json' },
  { language: 'de', jurisdiction: 'CZ', label: 'Deutsch (Tschechien)', file: 'de_CZ.json' },
];

type TestMode = 'overview' | 'stepByStep' | 'willWizard';

export const WillWizardCombinations: React.FC = () => {
  const [currentMode, setCurrentMode] = React.useState<TestMode>('overview');
  const [currentCombination, setCurrentCombination] = React.useState<null | TestCombination>(null);
  const {
    setLanguageCode,
    setJurisdictionCode,
    languageCode,
    jurisdictionCode,
    jurisdiction,
  } = useLocalization();

  const handleTestCombination = (combination: TestCombination) => {
    setCurrentCombination(combination);
    setLanguageCode(combination.language);
    setJurisdictionCode(combination.jurisdiction);
    setCurrentMode('stepByStep');
  };

  const handleWillWizardStart = () => {
    setCurrentMode('willWizard');
  };

  const handleBackToOverview = () => {
    setCurrentMode('overview');
    setCurrentCombination(null);
  };

  if (currentMode === 'stepByStep') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8 flex items-center justify-between">
            <Button
              onClick={handleBackToOverview}
              variant="outline"
            >
              <Icon name="arrow-left" className="w-4 h-4 mr-2" />
              Back to Overview
            </Button>
            <div className="text-sm text-muted-foreground">
              Testing: {currentCombination?.label}
            </div>
          </div>

          <CountrySelector
            onCountryConfirmed={handleWillWizardStart}
            showStepByStep={true}
          />
        </div>
      </div>
    );
  }

  if (currentMode === 'willWizard') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeIn duration={0.8}>
            <div className="mb-8">
              <Icon
                name="sparkles"
                className="w-16 h-16 text-primary mx-auto mb-6"
              />
              <h1 className="text-4xl font-bold mb-4">🎉 Will Wizard Started!</h1>
              <div className="space-y-2 text-lg text-muted-foreground">
                <p><strong>Language:</strong> {languageCode}</p>
                <p><strong>Jurisdiction:</strong> {jurisdiction}</p>
                <p><strong>Combination:</strong> {currentCombination?.label}</p>
                <p><strong>Translation File:</strong> <code>{currentCombination?.file}</code></p>
              </div>
            </div>

            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="check-circle" className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  ✅ Test Successful
                </h3>
              </div>
              <p className="text-green-700">
                The language-jurisdiction combination has been successfully selected and
                the will wizard would now load with:
              </p>
              <ul className="mt-4 text-left text-sm text-green-600 space-y-1">
                <li>• Interface in <strong>{languageCode}</strong></li>
                <li>• Legal requirements for <strong>{jurisdiction}</strong></li>
                <li>• Translation file: <code>{currentCombination?.file}</code></li>
                <li>• Currency and legal framework appropriate to jurisdiction</li>
              </ul>
            </Card>

            <div className="mt-8 space-x-4">
              <Button
                onClick={handleBackToOverview}
                variant="outline"
                size="lg"
              >
                <Icon name="arrow-left" className="w-4 h-4 mr-2" />
                Test Another Combination
              </Button>

              <Button
                onClick={() => setCurrentMode('stepByStep')}
                size="lg"
              >
                <Icon name="settings" className="w-4 h-4 mr-2" />
                Try Step-by-Step Again
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <FadeIn duration={0.6}>
          <div className="text-center mb-12">
            <Icon
              name="globe"
              className="w-16 h-16 text-primary mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4">
              🧪 Will Wizard Language-Jurisdiction Test Suite
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Test all {TEST_COMBINATIONS.length} supported language-jurisdiction combinations
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Icon name="languages" className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">4 Languages</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <Icon name="balance-scale" className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">2 Jurisdictions</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <Icon name="grid-3x3" className="w-5 h-5 text-purple-600" />
                <span className="text-purple-800 font-medium">8 Combinations</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {TEST_COMBINATIONS.map((combination, index) => (
              <FadeIn key={`${combination.language}-${combination.jurisdiction}`} duration={0.4} delay={0.1 * index}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {combination.language.toUpperCase()}-{combination.jurisdiction}
                      </h3>
                      <p className="text-muted-foreground">
                        {combination.label}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="px-2 py-1 bg-muted rounded text-muted-foreground font-mono text-xs">
                        {combination.file}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Icon name="globe" className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">
                        <strong>UI Language:</strong> {combination.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="balance-scale" className="w-4 h-4 text-green-500" />
                      <span className="text-sm">
                        <strong>Legal Jurisdiction:</strong> {combination.jurisdiction}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon name="file-text" className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">
                        <strong>Translation File:</strong> {combination.file}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleTestCombination(combination)}
                    className="w-full"
                    variant={
                      languageCode === combination.language &&
                      jurisdictionCode === combination.jurisdiction
                        ? "default"
                        : "outline"
                    }
                  >
                    <Icon name="play" className="w-4 h-4 mr-2" />
                    Test {combination.language}-{combination.jurisdiction}
                  </Button>
                </Card>
              </FadeIn>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Card className="p-8 max-w-3xl mx-auto bg-muted/30">
              <div className="flex items-start gap-4">
                <Icon
                  name="info"
                  className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                />
                <div className="text-left">
                  <h3 className="font-semibold text-lg mb-2">
                    🧪 Testing Instructions
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>1. <strong>Click any "Test" button</strong> to start the step-by-step selection process</p>
                    <p>2. <strong>Language Step:</strong> Verify the language selection interface works</p>
                    <p>3. <strong>Jurisdiction Step:</strong> Verify the jurisdiction selection interface works</p>
                    <p>4. <strong>Confirmation Step:</strong> Verify the combination is displayed correctly</p>
                    <p>5. <strong>Will Wizard:</strong> Verify the final confirmation shows correct details</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default WillWizardCombinations;
