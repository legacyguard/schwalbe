
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import type { WillType } from './WillTypeSelector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LiveWillPreview } from './LiveWillPreview';
import { FocusModeWrapper } from './FocusModeWrapper';
import { FocusModeToggle } from './FocusModeToggle';
import { VaultAssetSelector } from './VaultAssetSelector';
import {
  ComplianceStatus,
  FieldValidation,
  ValidationIndicator,
} from './ValidationIndicator';
import { useFocusMode } from '@/contexts/FocusModeContext';
import { useWillValidation } from '@/hooks/useWillValidation';
import type { WillData } from './WillWizard';
import { ValidationLevel } from '@/lib/will-legal-validator';

interface EnhancedWillWizardWithValidationProps {
  initialData?: null | WillData;
  onBack?: () => void;
  onClose: () => void;
  onComplete: (willData: WillData) => void;
  willType: WillType;
}

// Steps will be dynamically translated using t() function

// Jurisdictions will be dynamically translated using t() function

// Relationships will be dynamically translated using t() function

export const EnhancedWillWizardWithValidation: React.FC<
  EnhancedWillWizardWithValidationProps
> = ({ onClose, onComplete, onBack, willType, initialData }) => {
  useAuth();
  const { user } = useUser();
  const { isFocusMode } = useFocusMode();
  const { t } = useTranslation('ui/will-wizard');

  // Dynamic translated arrays
  const STEPS = [
    { id: 'personal', title: t('steps.personal.title'), description: t('steps.personal.description') },
    { id: 'beneficiaries', title: t('steps.beneficiaries.title'), description: t('steps.beneficiaries.description') },
    { id: 'assets', title: t('steps.assets.title'), description: t('steps.assets.description') },
    { id: 'executor', title: t('steps.executor.title'), description: t('steps.executor.description') },
    { id: 'guardianship', title: t('steps.guardianship.title'), description: t('steps.guardianship.description') },
    { id: 'wishes', title: t('steps.wishes.title'), description: t('steps.wishes.description') },
    { id: 'legal_validation', title: t('steps.legal_validation.title'), description: t('steps.legal_validation.description') },
    { id: 'sofia_check', title: t('steps.sofia_check.title'), description: t('steps.sofia_check.description') },
    { id: 'review', title: t('steps.review.title'), description: t('steps.review.description') },
  ];

  const JURISDICTIONS = [
    { value: 'Slovakia', label: t('jurisdictions.Slovakia') },
    { value: 'Czech-Republic', label: t('jurisdictions.Czech-Republic') },
    { value: 'US-General', label: t('jurisdictions.US-General') },
    { value: 'US-California', label: t('jurisdictions.US-California') },
    { value: 'US-Texas', label: t('jurisdictions.US-Texas') },
    { value: 'US-Florida', label: t('jurisdictions.US-Florida') },
    { value: 'US-NewYork', label: t('jurisdictions.US-NewYork') },
    { value: 'UK', label: t('jurisdictions.UK') },
    { value: 'Canada', label: t('jurisdictions.Canada') },
    { value: 'Australia', label: t('jurisdictions.Australia') },
  ];

  const RELATIONSHIPS = [
    { value: 'spouse', label: t('relationships.spouse') },
    { value: 'child', label: t('relationships.child') },
    { value: 'parent', label: t('relationships.parent') },
    { value: 'sibling', label: t('relationships.sibling') },
    { value: 'grandchild', label: t('relationships.grandchild') },
    { value: 'friend', label: t('relationships.friend') },
    { value: 'charity', label: t('relationships.charity') },
    { value: 'other', label: t('relationships.other') },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  const [vaultSelectorType] = useState<
    'all' | 'bankAccounts' | 'personalProperty' | 'realEstate' | 'vehicles'
  >('all');

  // Initialize with draft data if provided, otherwise use empty data
  const [willData, setWillData] = useState<WillData>(
    initialData || {
      testator_data: {
        fullName: user?.fullName || '',
      },
      beneficiaries: [],
      assets: {},
      executor_data: {},
      guardianship_data: {},
      special_instructions: {},
      legal_data: {
        jurisdiction: 'Slovakia',
      },
      review_eligibility: true,
      family_protection_level: 'standard',
      completeness_score: 0,
    }
  );

  // Real-time validation
  const {
    complianceReport,
    fieldValidations,
    isValidating,
    validationSummary,
    isWillValid,
    getFieldValidation,
    hasFieldError,
    hasFieldWarning,
    getValidationMessages,
    getJurisdictionGuidance,
    triggerValidation,
  } = useWillValidation({
    willData,
    willType,
    jurisdiction: willData.legal_data?.jurisdiction || 'Slovakia',
    enableRealTime: true,
  });

  const currentStepId = STEPS[currentStep].id;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateWillData = useCallback((section: keyof WillData, data: any) => {
    setWillData(prev => ({
      ...prev,
      [section]: { ...(prev[section] as any), ...data },
    }));
  }, []);

  // Trigger validation when jurisdiction changes
  useEffect(() => {
    if (willData.legal_data?.jurisdiction) {
      triggerValidation();
    }
  }, [willData.legal_data?.jurisdiction, triggerValidation]);

  const handleComplete = useCallback(() => {
    if (!isWillValid) {
      toast.error(t('validation.resolveErrors'));
      return;
    }
    onComplete(willData);
  }, [willData, onComplete, isWillValid]);

  const handleNext = useCallback(() => {
    // Check for critical errors in current step
    const currentStepHasErrors = Array.from(fieldValidations.entries()).some(
      ([field, validation]) =>
        validation.level === 'error' && field.includes(currentStepId)
    );

    if (currentStepHasErrors && currentStep < STEPS.length - 1) {
      toast.warning(t('validation.resolveStepErrors'));
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete, fieldValidations, currentStepId]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  }, [currentStep, onBack]);

  // const __goToStep = useCallback((stepId: string) => { // Unused
  // const stepIndex = STEPS.findIndex(step => step.id === stepId);
  // if (stepIndex !== -1) {
  // setCurrentStep(stepIndex);
  // }
  // }, []);

  const addBeneficiary = useCallback(() => {
    const newBeneficiary = {
      id: crypto.randomUUID(),
      name: '',
      relationship: 'child' as const,
      percentage: 0,
      specificGifts: [] as string[],
      conditions: '',
    };
    setWillData(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, newBeneficiary],
    }));
  }, []);

  const updateBeneficiary = useCallback(
    (id: string, field: string, value: number | string | string[]) => {
      setWillData(prev => ({
        ...prev,
        beneficiaries: prev.beneficiaries.map(b =>
          b.id === id ? { ...b, [field]: value } : b
        ),
      }));
    },
    []
  );

  const removeBeneficiary = useCallback((id: string) => {
    setWillData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter(b => b.id !== id),
    }));
  }, []);

  const renderStepContent = () => {
    switch (currentStepId) {
      case 'personal':
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FieldValidation
                fieldName='testator_data.fullName'
                validation={getFieldValidation('testator_data.fullName')}
              >
                <div>
                  <Label htmlFor='fullName'>{t('personal.fullName.label')}</Label>
                  <Input
                    id='fullName'
                    value={willData.testator_data.fullName || ''}
                    onChange={e =>
                      updateWillData('testator_data', {
                        fullName: e.target.value,
                      })
                    }
                    placeholder={t('personal.fullName.placeholder')}
                    className={
                      hasFieldError('testator_data.fullName')
                        ? 'border-red-300'
                        : hasFieldWarning('testator_data.fullName')
                          ? 'border-yellow-300'
                          : ''
                    }
                  />
                </div>
              </FieldValidation>

              <FieldValidation
                fieldName='testator_data.dateOfBirth'
                validation={getFieldValidation('testator_data.dateOfBirth')}
              >
                <div>
                  <Label htmlFor='dateOfBirth'>{t('personal.dateOfBirth.label')}</Label>
                  <Input
                    id='dateOfBirth'
                    type='date'
                    value={willData.testator_data.dateOfBirth || ''}
                    onChange={e =>
                      updateWillData('testator_data', {
                        dateOfBirth: e.target.value,
                      })
                    }
                    className={
                      hasFieldError('testator_data.dateOfBirth')
                        ? 'border-red-300'
                        : ''
                    }
                  />
                </div>
              </FieldValidation>
            </div>

            <FieldValidation
              fieldName='testator_data.address'
              validation={getFieldValidation('testator_data.address')}
            >
              <div>
                <Label htmlFor='address'>{t('personal.address.label')}</Label>
                <Textarea
                  id='address'
                  value={willData.testator_data.address || ''}
                  onChange={e =>
                    updateWillData('testator_data', { address: e.target.value })
                  }
                  placeholder={t('personal.address.placeholder')}
                  rows={3}
                  className={
                    hasFieldError('testator_data.address')
                      ? 'border-red-300'
                      : ''
                  }
                />
              </div>
            </FieldValidation>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='citizenship'>{t('personal.citizenship.label')}</Label>
                <Input
                  id='citizenship'
                  value={willData.testator_data.citizenship || ''}
                  onChange={e =>
                    updateWillData('testator_data', {
                      citizenship: e.target.value,
                    })
                  }
                  placeholder={t('personal.citizenship.placeholder')}
                />
              </div>

              <div>
                <Label htmlFor='jurisdiction'>{t('personal.jurisdiction.label')}</Label>
                <Select
                  value={willData.legal_data?.jurisdiction || 'Slovakia'}
                  onValueChange={value =>
                    updateWillData('legal_data', { jurisdiction: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('personal.jurisdiction.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICTIONS.map(jurisdiction => (
                      <SelectItem
                        key={jurisdiction.value}
                        value={jurisdiction.value}
                      >
                        {jurisdiction.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor='maritalStatus'>{t('personal.maritalStatus.label')}</Label>
              <Select
                value={willData.testator_data.maritalStatus}
                onValueChange={value =>
                  updateWillData('testator_data', {
                    maritalStatus: value as
                      | 'divorced'
                      | 'married'
                      | 'single'
                      | 'widowed',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('personal.maritalStatus.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='single'>{t('personal.maritalStatus.single')}</SelectItem>
                  <SelectItem value='married'>{t('personal.maritalStatus.married')}</SelectItem>
                  <SelectItem value='divorced'>{t('personal.maritalStatus.divorced')}</SelectItem>
                  <SelectItem value='widowed'>{t('personal.maritalStatus.widowed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'beneficiaries':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                {t('beneficiaries.title')}
                {getFieldValidation('beneficiaries') && (
                  <ValidationIndicator
                    validation={getFieldValidation('beneficiaries')!}
                  />
                )}
              </h3>
              <Button onClick={addBeneficiary} variant='outline' size='sm'>
                <Icon name="add" className='w-4 h-4 mr-2' />
                {t('beneficiaries.addBeneficiary')}
              </Button>
            </div>

            {/* Beneficiary percentage warning */}
            {complianceReport?.forcedHeirsIssues &&
              complianceReport.forcedHeirsIssues.length > 0 && (
                <div className='space-y-2'>
                  {complianceReport.forcedHeirsIssues.map((issue, index) => (
                    <ValidationIndicator
                      key={index}
                      validation={issue}
                      showDetails
                    />
                  ))}
                </div>
              )}

            {willData.beneficiaries.length === 0 ? (
              <Card className='p-8 text-center'>
                <Icon
                  name="users"
                  className='w-12 h-12 text-muted-foreground mx-auto mb-4'
                />
                <p className='text-muted-foreground'>
                  {t('beneficiaries.noBeneficiaries')}
                </p>
                <p className='text-sm text-muted-foreground mt-2'>
                  {t('beneficiaries.clickToStart')}
                </p>
              </Card>
            ) : (
              <div className='space-y-4'>
                {willData.beneficiaries.map((beneficiary, index) => (
                  <Card key={beneficiary.id} className='p-4'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='secondary'>
                          {t('beneficiaries.beneficiaryNumber', { number: index + 1 })}
                        </Badge>
                        {hasFieldError(`beneficiaries[${index}]`) && (
                          <ValidationIndicator
                            validation={
                              getFieldValidation(`beneficiaries[${index}]`)!
                            }
                          />
                        )}
                      </div>
                      <Button
                        onClick={() => removeBeneficiary(beneficiary.id)}
                        variant='ghost'
                        size='sm'
                        className='text-red-600 hover:text-red-700'
                      >
                        <Icon name="trash" className='w-4 h-4' />
                      </Button>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      <div>
                        <Label>{t('beneficiaries.fields.name.label')}</Label>
                        <Input
                          value={beneficiary.name}
                          onChange={e =>
                            updateBeneficiary(
                              beneficiary.id,
                              'name',
                              e.target.value
                            )
                          }
                          placeholder={t('beneficiaries.fields.name.placeholder')}
                        />
                      </div>
                      <div>
                        <Label>{t('beneficiaries.fields.relationship.label')}</Label>
                        <Select
                          value={beneficiary.relationship}
                          onValueChange={value =>
                            updateBeneficiary(
                              beneficiary.id,
                              'relationship',
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIPS.map(rel => (
                              <SelectItem key={rel.value} value={rel.value}>
                                {rel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('beneficiaries.fields.percentage.label')}</Label>
                        <Input
                          type='number'
                          min='0'
                          max='100'
                          value={beneficiary.percentage}
                          onChange={e =>
                            updateBeneficiary(
                              beneficiary.id,
                              'percentage',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder={t('beneficiaries.fields.percentage.placeholder')}
                        />
                      </div>
                    </div>
                    <div className='mt-4'>
                      <Label>{t('beneficiaries.fields.conditions.label')}</Label>
                      <Input
                        value={beneficiary.conditions || ''}
                        onChange={e =>
                          updateBeneficiary(
                            beneficiary.id,
                            'conditions',
                            e.target.value
                          )
                        }
                        placeholder={t('beneficiaries.fields.conditions.placeholder')}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Show jurisdiction-specific guidance */}
            <Card className='p-4 bg-blue-50 border-blue-200'>
              <div className='flex items-start gap-3'>
                <Icon
                  name="info"
                  className='w-5 h-5 text-blue-600 flex-shrink-0 mt-1'
                />
                <div>
                  <h4 className='font-semibold text-blue-900 mb-2'>
                    {t('beneficiaries.guidance.title', { jurisdiction: willData.legal_data?.jurisdiction })}
                  </h4>
                  <p className='text-sm text-blue-800'>
                    {getJurisdictionGuidance().forcedHeirs}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'legal_validation':
        return (
          <div className='space-y-6'>
            <div className='text-center mb-8'>
              <Icon
                name="shield-check"
                className='w-12 h-12 text-primary mx-auto mb-4'
              />
              <h3 className='text-2xl font-semibold mb-2'>
                {t('legalValidation.title')}
              </h3>
              <p className='text-muted-foreground'>
                {t('legalValidation.description', { jurisdiction: willData.legal_data?.jurisdiction || 'Slovak' })}
              </p>
            </div>

            {/* Compliance Status */}
            <ComplianceStatus validationResults={getValidationMessages()} />

            {/* Validation Messages */}
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

              {getValidationMessages(ValidationLevel.SUCCESS).map(
                (validation, index) => (
                  <ValidationIndicator
                    key={`success-${index}`}
                    validation={validation}
                    showDetails
                  />
                )
              )}
            </div>

            {/* Jurisdiction Guidance */}
            <Card className='p-6'>
              <h4 className='font-semibold mb-4 flex items-center gap-2'>
                <Icon name="book" className='w-5 h-5' />
                {t('legalValidation.requirements.title', { jurisdiction: willData.legal_data?.jurisdiction })}
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                <div>
                  <h5 className='font-medium mb-2'>{t('legalValidation.requirements.forcedHeirs.title')}</h5>
                  <p className='text-muted-foreground'>
                    {getJurisdictionGuidance().forcedHeirs}
                  </p>
                </div>
                <div>
                  <h5 className='font-medium mb-2'>{t('legalValidation.requirements.witnesses.title')}</h5>
                  <p className='text-muted-foreground'>
                    {getJurisdictionGuidance().witnesses}
                  </p>
                </div>
                <div>
                  <h5 className='font-medium mb-2'>{t('legalValidation.requirements.revocation.title')}</h5>
                  <p className='text-muted-foreground'>
                    {getJurisdictionGuidance().revocation}
                  </p>
                </div>
                <div>
                  <h5 className='font-medium mb-2'>{t('legalValidation.requirements.notarization.title')}</h5>
                  <p className='text-muted-foreground'>
                    {getJurisdictionGuidance().notarization}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      // ... other step cases would be implemented similarly with validation integration

      default:
        return <div>{t('common.notImplemented')}</div>;
    }
  };

  return (
    <FocusModeWrapper
      currentStepTitle={STEPS[currentStep].title}
      currentStepIndex={currentStep}
      totalSteps={STEPS.length}
      onExitWizard={onClose}
    >
      <div className='min-h-screen bg-background flex flex-col'>
        {/* Header - Hidden in Focus Mode */}
        {!isFocusMode && (
          <header className='bg-card border-b border-card-border sticky top-0 z-50'>
            <div className='max-w-4xl mx-auto px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <Button
                    onClick={onClose}
                    variant='ghost'
                    size='sm'
                    className='flex items-center gap-2'
                  >
                    <Icon name="arrow-left" className='w-4 h-4' />
                    Back to Legacy Planning
                  </Button>
                </div>
                <div className='text-center'>
                  <h1 className='text-xl font-semibold'>
                    Enhanced Will Creator
                  </h1>
                  <p className='text-sm text-muted-foreground'>
                    Step {currentStep + 1} of {STEPS.length}:{' '}
                    {STEPS[currentStep].title}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  {/* Validation status indicator */}
                  {validationSummary.total > 0 && (
                    <div className='flex items-center gap-2 text-sm'>
                      {validationSummary.errors > 0 && (
                        <Badge variant='destructive' className='text-xs'>
                          {validationSummary.errors} error
                          {validationSummary.errors !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {validationSummary.warnings > 0 && (
                        <Badge variant='secondary' className='text-xs'>
                          {validationSummary.warnings} warning
                          {validationSummary.warnings !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {isValidating && (
                        <Icon
                          name="loader"
                          className='w-4 h-4 animate-spin text-primary'
                        />
                      )}
                    </div>
                  )}
                  <FocusModeToggle />
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Progress Bar - Hidden in Focus Mode */}
        {!isFocusMode && (
          <div className='bg-card border-b border-card-border'>
            <div className='max-w-4xl mx-auto px-6 py-4'>
              <Progress value={progress} className='h-2' />
              <div className='flex justify-between mt-2 text-xs text-muted-foreground'>
                {STEPS.map((step, index) => (
                  <span
                    key={step.id}
                    className={
                      index <= currentStep ? 'text-primary font-medium' : ''
                    }
                  >
                    {step.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Draft Data Indicator */}
        {initialData && !isFocusMode && (
          <div className='bg-primary/5 border-b border-primary/20'>
            <div className='max-w-4xl mx-auto px-6 py-3'>
              <div className='flex items-center gap-3 text-sm'>
                <Icon
                  name="sparkles"
                  className='w-4 h-4 text-primary'
                />
                <span className='text-primary font-medium'>
                  Sofia's Intelligent Draft Active
                </span>
                <span className='text-muted-foreground'>
                  Pre-filled with legal validation - Review and modify as needed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <main className='flex-1 flex overflow-hidden'>
          {/* Left Panel - Form */}
          <div className='w-2/5 flex flex-col border-r border-card-border'>
            <div className='p-6 overflow-y-auto'>
              <FadeIn key={currentStep} duration={0.3}>
                <div className='mb-6'>
                  <h2 className='text-2xl font-semibold mb-2'>
                    {STEPS[currentStep].title}
                  </h2>
                  <p className='text-muted-foreground'>
                    {STEPS[currentStep].description}
                  </p>
                </div>

                {renderStepContent()}
              </FadeIn>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className='w-3/5 flex flex-col'>
            <LiveWillPreview
              willData={willData}
              willType={willType}
              currentStep={currentStepId}
            />
          </div>
        </main>

        {/* Navigation */}
        <footer className='bg-card border-t border-card-border'>
          <div className='px-6 py-4'>
            <div className='flex justify-between items-center'>
              <Button
                onClick={handleBack}
                variant='outline'
                disabled={currentStep === 0 && !onBack}
              >
                <Icon name="arrow-left" className='w-4 h-4 mr-2' />
                {currentStep === 0 ? t('navigation.changeWillType') : t('navigation.back')}
              </Button>

              <div className='flex items-center gap-4'>
                {!isFocusMode && (
                  <div className='text-sm text-muted-foreground'>
                    {t('navigation.stepIndicator', { current: currentStep + 1, total: STEPS.length })}
                  </div>
                )}
                <Button
                  onClick={handleNext}
                  className='bg-primary hover:bg-primary-hover text-primary-foreground'
                  disabled={
                    validationSummary.errors > 0 &&
                    currentStep === STEPS.length - 1
                  }
                >
                  {currentStep === STEPS.length - 1
                    ? t('navigation.createWill')
                    : t('navigation.continue')}
                  {currentStep !== STEPS.length - 1 && (
                    <Icon
                      name="arrow-right"
                      className='w-4 h-4 ml-2'
                    />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Vault Asset Selector Modal */}
      {showVaultSelector && (
        <VaultAssetSelector
          onAssetsSelected={() => setShowVaultSelector(false)}
          onClose={() => setShowVaultSelector(false)}
          assetType={vaultSelectorType}
        />
      )}
    </FocusModeWrapper>
  );
};
