
import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Eye,
  Globe,
  Heart,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import type { WillData } from '@/types/will';
import { ValidationIndicator } from './ValidationIndicator';
import { FamilyTreeVisualization } from './FamilyTreeVisualization';
import { WillTemplateLibrary } from './WillTemplateLibrary';
import { EmotionalGuidanceSystem } from './EmotionalGuidanceSystem';
import { ProfessionalReviewNetwork } from './ProfessionalReviewNetwork';
import { useWillValidation } from '@/hooks/useWillValidation';
import { useMultiLangGenerator } from '@/hooks/useMultiLangGenerator';
import { ValidationLevel } from '@/lib/will-legal-validator';
import { useProfessionalReviewWorkflow } from '@/hooks/useProfessionalNetwork';
import type { WillType } from './WillTypeSelector';

interface WillUpgradeIntegrationProps {
  jurisdiction: string;
  onUpgradeComplete?: (upgradedWillData: WillData) => void;
  onWillDataUpdate: (updatedWillData: WillData) => void;
  willData: WillData;
  willType: WillType;
}

export const WillUpgradeIntegration: React.FC<WillUpgradeIntegrationProps> = ({
  willData,
  willType,
  jurisdiction,
  onWillDataUpdate,
  onUpgradeComplete,
}) => {
  const [activeUpgrade, setActiveUpgrade] = useState<null | string>(null);
  const [completedUpgrades, setCompletedUpgrades] = useState<Set<string>>(
    new Set()
  );
  const [isUpgradeMode, setIsUpgradeMode] = useState(false);
  const [upgradeProgress, setUpgradeProgress] = useState(0);

  // Integration with validation system
  const {
    complianceReport: _complianceReport,
    fieldValidations: _fieldValidations,
    isValidating: _isValidating,
    validationSummary,
    isWillValid,
    getValidationMessages,
  } = useWillValidation({
    willData: willData as any,
    willType,
    jurisdiction,
    enableRealTime: true,
  });

  // Multi-language generation
  const { generateTranslations, isGenerating } = useMultiLangGenerator();

  // Professional review integration
  const professionalReview = useProfessionalReviewWorkflow(
    willData,
    jurisdiction
  );

  // Upgrade features configuration
  const upgradeFeatures = [
    {
      id: 'legal-validation',
      title: 'Real-Time Legal Validation',
      description:
        'Advanced legal compliance checking with jurisdiction-specific rules',
      icon: Shield,
      status: isWillValid
        ? 'completed'
        : validationSummary.errors > 0
          ? 'needs-attention'
          : 'available',
      component: 'validation',
    },
    {
      id: 'multi-language',
      title: 'Multi-Language Generation',
      description:
        'Generate will documents in Slovak, Czech, English, and German',
      icon: Globe,
      status: completedUpgrades.has('multi-language')
        ? 'completed'
        : 'available',
      component: 'multi-language',
    },
    {
      id: 'family-tree',
      title: 'Family Tree Visualization',
      description:
        'Visual inheritance flow mapping with drag-and-drop assignment',
      icon: Users,
      status: completedUpgrades.has('family-tree') ? 'completed' : 'available',
      component: 'family-tree',
    },
    {
      id: 'template-library',
      title: 'Template Library & Comparison',
      description: 'Curated will templates with version comparison',
      icon: Eye,
      status: completedUpgrades.has('template-library')
        ? 'completed'
        : 'available',
      component: 'template-library',
    },
    {
      id: 'emotional-guidance',
      title: 'Emotional Guidance & Legacy Messages',
      description: 'Memory prompts and time capsule creation for loved ones',
      icon: Heart,
      status: completedUpgrades.has('emotional-guidance')
        ? 'completed'
        : 'available',
      component: 'emotional-guidance',
    },
    {
      id: 'professional-review',
      title: 'Professional Review Network',
      description: 'Connect with attorneys, estate planners, and notaries',
      icon: Star,
      status:
        professionalReview.reviewHistory.length > 0 ? 'completed' : 'available',
      component: 'professional-review',
    },
  ];

  // Calculate upgrade progress
  useEffect(() => {
    const totalFeatures = upgradeFeatures.length;
    const completedCount = upgradeFeatures.filter(
      feature =>
        feature.status === 'completed' || completedUpgrades.has(feature.id)
    ).length;
    setUpgradeProgress((completedCount / totalFeatures) * 100);
  }, [completedUpgrades, upgradeFeatures]);

  const handleUpgradeComplete = useCallback(
    (upgradeId: string, updatedData?: WillData) => {
      setCompletedUpgrades(prev => new Set([...prev, upgradeId]));
      setActiveUpgrade(null);

      if (updatedData) {
        onWillDataUpdate(updatedData);
      }

      // Check if all upgrades are completed
      if (completedUpgrades.size === upgradeFeatures.length - 1) {
        setTimeout(() => {
          onUpgradeComplete?.(updatedData || willData);
        }, 1000);
      }
    },
    [
      completedUpgrades,
      upgradeFeatures.length,
      onWillDataUpdate,
      onUpgradeComplete,
      willData,
    ]
  );

  const renderUpgradeOverview = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold mb-2'>Will Upgrade Features</h2>
        <p className='text-gray-600 mb-6'>
          Enhance your will with professional-grade features for complete peace
          of mind
        </p>

        <div className='mb-8'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>Upgrade Progress</span>
            <span className='text-sm text-gray-600'>
              {Math.round(upgradeProgress)}% Complete
            </span>
          </div>
          <Progress value={upgradeProgress} className='h-3' />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {upgradeFeatures.map(feature => {
          const IconComponent = feature.icon;

          return (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                feature.status === 'completed'
                  ? 'border-green-200 bg-green-50'
                  : feature.status === 'needs-attention'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'hover:border-blue-200'
              }`}
              onClick={() => setActiveUpgrade(feature.id)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <IconComponent
                    className={`h-8 w-8 ${
                      feature.status === 'completed'
                        ? 'text-green-600'
                        : feature.status === 'needs-attention'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                    }`}
                  />

                  {feature.status === 'completed' && (
                    <CheckCircle className='h-5 w-5 text-green-600' />
                  )}
                </div>

                <CardTitle className='text-lg'>{feature.title}</CardTitle>
              </CardHeader>

              <CardContent>
                <CardDescription className='text-sm mb-4'>
                  {feature.description}
                </CardDescription>

                <div className='flex items-center justify-between'>
                  <Badge
                    variant={
                      feature.status === 'completed'
                        ? 'default'
                        : feature.status === 'needs-attention'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {feature.status === 'completed'
                      ? 'Completed'
                      : feature.status === 'needs-attention'
                        ? 'Needs Attention'
                        : 'Available'}
                  </Badge>

                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-blue-600 hover:text-blue-700'
                  >
                    {feature.status === 'completed' ? 'Review' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className='text-center pt-6'>
        <Button
          onClick={() => setIsUpgradeMode(true)}
          size='lg'
          className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
        >
          Start Comprehensive Upgrade
        </Button>
      </div>
    </div>
  );

  const renderActiveUpgrade = () => {
    if (!activeUpgrade) return null;

    const feature = upgradeFeatures.find(f => f.id === activeUpgrade);
    if (!feature) return null;

    switch (feature.component) {
      case 'validation':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-2xl font-bold'>Real-Time Legal Validation</h3>
              <Button variant='outline' onClick={() => setActiveUpgrade(null)}>
                Back to Overview
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
              <Card className='p-4 text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {validationSummary.successes}
                </div>
                <div className='text-sm text-gray-600'>Validations Passed</div>
              </Card>
              <Card className='p-4 text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {validationSummary.warnings}
                </div>
                <div className='text-sm text-gray-600'>Warnings</div>
              </Card>
              <Card className='p-4 text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {validationSummary.errors}
                </div>
                <div className='text-sm text-gray-600'>Critical Issues</div>
              </Card>
            </div>

            <div className='space-y-4'>
              {getValidationMessages(ValidationLevel.ERROR).map(
                (validation, index) => (
                  <ValidationIndicator
                    key={`error-${index}`}
                    validation={validation}
                    showDetails
                  />
                )
              )}

              {getValidationMessages(ValidationLevel.WARNING).map(
                (validation, index) => (
                  <ValidationIndicator
                    key={`warning-${index}`}
                    validation={validation}
                    showDetails
                  />
                )
              )}
            </div>

            {isWillValid && (
              <Alert>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>
                  Your will meets all legal requirements for {jurisdiction}.
                  Ready for professional review or finalization.
                </AlertDescription>
              </Alert>
            )}

            <div className='flex justify-end space-x-4'>
              {isWillValid && (
                <Button
                  onClick={() => handleUpgradeComplete('legal-validation')}
                >
                  Mark Validation Complete
                </Button>
              )}
            </div>
          </div>
        );

      case 'multi-language':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-2xl font-bold'>
                Multi-Language Document Generation
              </h3>
              <Button variant='outline' onClick={() => setActiveUpgrade(null)}>
                Back to Overview
              </Button>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {[
                {
                  code: 'sk',
                  name: 'Slovak',
                  flag: '🇸🇰',
                  jurisdiction: 'Slovakia',
                },
                {
                  code: 'cs',
                  name: 'Czech',
                  flag: '🇨🇿',
                  jurisdiction: 'Czech Republic',
                },
                {
                  code: 'en',
                  name: 'English',
                  flag: '🇺🇸',
                  jurisdiction: 'International',
                },
                {
                  code: 'de',
                  name: 'German',
                  flag: '🇩🇪',
                  jurisdiction: 'Germany',
                },
              ].map(
                (lang: {
                  code: string;
                  flag: string;
                  jurisdiction: string;
                  name: string;
                }) => (
                  <Card
                    key={lang.code}
                    className='p-4 text-center cursor-pointer hover:bg-gray-50'
                  >
                    <div className='text-2xl mb-2'>{lang.flag}</div>
                    <div className='font-medium'>{lang.name}</div>
                    <div className='text-sm text-gray-600'>
                      {lang.jurisdiction}
                    </div>

                    <Button
                      className='mt-3 w-full'
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        generateTranslations(JSON.stringify(willData), {
                          sourceLanguage: 'sk',
                          targetLanguages: [lang.code],
                          documentType: 'will',
                          jurisdiction,
                          includeGlossary: false,
                          preserveLegalTerms: true,
                        })
                      }
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                  </Card>
                )
              )}
            </div>

            <div className='flex justify-end'>
              <Button onClick={() => handleUpgradeComplete('multi-language')}>
                Complete Multi-Language Setup
              </Button>
            </div>
          </div>
        );

      case 'family-tree':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-2xl font-bold'>
                Family Tree & Inheritance Visualization
              </h3>
              <Button variant='outline' onClick={() => setActiveUpgrade(null)}>
                Back to Overview
              </Button>
            </div>

            <FamilyTreeVisualization
              willData={willData as any}
              onUpdateWillData={data => onWillDataUpdate(data as any)}
            />
          </div>
        );

      case 'template-library':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-2xl font-bold'>
                Template Library & Will Comparison
              </h3>
              <Button variant='outline' onClick={() => setActiveUpgrade(null)}>
                Back to Overview
              </Button>
            </div>

            <WillTemplateLibrary
              currentWillData={willData as any}
              onTemplateSelect={() => {
                /* no-op for now; selection handled within library */
              }}
              onComparisonComplete={() =>
                handleUpgradeComplete('template-library')
              }
            />
          </div>
        );

      case 'emotional-guidance':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-2xl font-bold'>
                Emotional Guidance & Legacy Messages
              </h3>
              <Button variant='outline' onClick={() => setActiveUpgrade(null)}>
                Back to Overview
              </Button>
            </div>

            <EmotionalGuidanceSystem
              willData={willData as any}
              currentStage='starting'
              onMessagesCreated={() =>
                handleUpgradeComplete('emotional-guidance')
              }
            />
          </div>
        );

      case 'professional-review':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-2xl font-bold'>
                Professional Review Network
              </h3>
              <Button variant='outline' onClick={() => setActiveUpgrade(null)}>
                Back to Overview
              </Button>
            </div>

            <ProfessionalReviewNetwork
              willData={willData}
              jurisdiction={jurisdiction}
              onReviewComplete={() =>
                handleUpgradeComplete('professional-review')
              }
            />
          </div>
        );

      default:
        return <div>Upgrade feature not implemented</div>;
    }
  };

  const renderUpgradeWorkflow = () => (
    <div className='space-y-6'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold mb-2'>Comprehensive Will Upgrade</h2>
        <p className='text-gray-600 mb-6'>
          We'll guide you through all upgrade features systematically
        </p>

        <div className='mb-8'>
          <Progress value={upgradeProgress} className='h-4' />
          <div className='text-sm text-gray-600 mt-2'>
            {completedUpgrades.size} of {upgradeFeatures.length} upgrades
            completed
          </div>
        </div>
      </div>

      <Tabs
        value={activeUpgrade || upgradeFeatures[0].id}
        onValueChange={setActiveUpgrade}
      >
        <TabsList className='grid w-full grid-cols-3 lg:grid-cols-6'>
          {upgradeFeatures.map(feature => (
            <TabsTrigger
              key={feature.id}
              value={feature.id}
              className='text-xs'
            >
              {completedUpgrades.has(feature.id) && (
                <CheckCircle className='w-3 h-3 mr-1' />
              )}
              {feature.title.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {upgradeFeatures.map(feature => (
          <TabsContent key={feature.id} value={feature.id}>
            {renderActiveUpgrade()}
          </TabsContent>
        ))}
      </Tabs>

      <div className='flex justify-between items-center pt-6 border-t'>
        <Button variant='outline' onClick={() => setIsUpgradeMode(false)}>
          Exit Upgrade Mode
        </Button>

        <div className='text-sm text-gray-600'>
          Complete all upgrades for the ultimate will experience
        </div>

        {upgradeProgress === 100 && (
          <Button
            className='bg-gradient-to-r from-green-600 to-emerald-600'
            onClick={() => onUpgradeComplete?.(willData)}
          >
            Finalize Upgraded Will
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {isUpgradeMode
        ? renderUpgradeWorkflow()
        : activeUpgrade
          ? renderActiveUpgrade()
          : renderUpgradeOverview()}
    </div>
  );
};
