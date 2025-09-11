/**
 * Professional Reviewer Onboarding Flow
 * Multi-step onboarding process for attorneys and legal professionals
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle,
  Scale,
  Shield,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@schwalbe/ui/card';
import { Button } from '@schwalbe/ui/button';
import { Input } from '@schwalbe/ui/input';
import { Label } from '@schwalbe/ui/label';
import { Textarea } from '@schwalbe/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@schwalbe/ui/select';
import { Checkbox } from '@schwalbe/ui/checkbox';
import { Badge } from '@schwalbe/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@schwalbe/lib/utils';
import type { ProfessionalOnboarding } from '@schwalbe/types/professional';

interface ProfessionalOnboardingFlowProps {
  className?: string;
  onCancel?: () => void;
  onComplete: (
    data: Omit<
      ProfessionalOnboarding,
      'created_at' | 'id' | 'status' | 'updated_at'
    >
  ) => void;
}

interface OnboardingStep {
  description: string;
  icon: React.ComponentType<any>;
  id: number;
  isActive: boolean;
  isCompleted: boolean;
  title: string;
}

const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
  'District of Columbia',
];

const getSpecializations = (t: any) => [
  {
    id: 'estate_planning',
    name: t('specializations.estate_planning'),
    category: 'estate_planning',
  },
  { id: 'wills_trusts', name: t('specializations.wills_trusts'), category: 'estate_planning' },
  { id: 'probate', name: t('specializations.probate'), category: 'estate_planning' },
  { id: 'family_law', name: t('specializations.family_law'), category: 'family_law' },
  { id: 'elder_law', name: t('specializations.elder_law'), category: 'estate_planning' },
  { id: 'tax_law', name: t('specializations.tax_law'), category: 'tax_law' },
  { id: 'business_law', name: t('specializations.business_law'), category: 'business_law' },
  { id: 'real_estate', name: t('specializations.real_estate'), category: 'real_estate' },
  {
    id: 'guardianship',
    name: t('specializations.guardianship'),
    category: 'family_law',
  },
  {
    id: 'asset_protection',
    name: t('specializations.asset_protection'),
    category: 'estate_planning',
  },
];

export function ProfessionalOnboardingFlow({
  onComplete,
  onCancel,
  className,
}: ProfessionalOnboardingFlowProps) {
  const { t } = useTranslation('ui/professional-onboarding');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    professional_title: '',
    law_firm_name: '',
    bar_number: '',
    licensed_states: [] as string[],
    specializations: [] as string[],
    experience_years: 0,
    hourly_rate: undefined as number | undefined,
    bio: '',
    motivation: '',
    referral_source: '',
  });

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: t('steps.personal_information.title'),
      description: t('steps.personal_information.description'),
      icon: Users,
      isCompleted: currentStep > 1,
      isActive: currentStep === 1,
    },
    {
      id: 2,
      title: t('steps.professional_credentials.title'),
      description: t('steps.professional_credentials.description'),
      icon: Award,
      isCompleted: currentStep > 2,
      isActive: currentStep === 2,
    },
    {
      id: 3,
      title: t('steps.specializations.title'),
      description: t('steps.specializations.description'),
      icon: Scale,
      isCompleted: currentStep > 3,
      isActive: currentStep === 3,
    },
    {
      id: 4,
      title: t('steps.professional_profile.title'),
      description: t('steps.professional_profile.description'),
      icon: Shield,
      isCompleted: currentStep > 4,
      isActive: currentStep === 4,
    },
  ];

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.email &&
          formData.full_name &&
          formData.professional_title
        );
      case 2:
        return !!(formData.bar_number && formData.licensed_states.length > 0);
      case 3:
        return (
          formData.specializations.length > 0 && formData.experience_years > 0
        );
      case 4:
        return !!(formData.bio && formData.motivation);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (isStepValid(4)) {
      onComplete(formData);
    }
  };

  const toggleState = (state: string) => {
    const newStates = formData.licensed_states.includes(state)
      ? formData.licensed_states.filter(s => s !== state)
      : [...formData.licensed_states, state];
    updateFormData({ licensed_states: newStates });
  };

  const toggleSpecialization = (spec: string) => {
    const newSpecs = formData.specializations.includes(spec)
      ? formData.specializations.filter(s => s !== spec)
      : [...formData.specializations, spec];
    updateFormData({ specializations: newSpecs });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key='step1'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='space-y-6'
          >
            <div className='space-y-4'>
              <div>
                <Label htmlFor='email'>{t('step1.email.label')}</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={e => updateFormData({ email: e.target.value })}
                  placeholder={t('step1.email.placeholder')}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='full_name'>{t('step1.full_name.label')}</Label>
                <Input
                  id='full_name'
                  value={formData.full_name}
                  onChange={e => updateFormData({ full_name: e.target.value })}
                  placeholder={t('step1.full_name.placeholder')}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='professional_title'>{t('step1.professional_title.label')}</Label>
                <Input
                  id='professional_title'
                  value={formData.professional_title}
                  onChange={e =>
                    updateFormData({ professional_title: e.target.value })
                  }
                  placeholder={t('step1.professional_title.placeholder')}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='law_firm_name'>{t('step1.law_firm_name.label')}</Label>
                <Input
                  id='law_firm_name'
                  value={formData.law_firm_name}
                  onChange={e =>
                    updateFormData({ law_firm_name: e.target.value })
                  }
                  placeholder={t('step1.law_firm_name.placeholder')}
                  className='mt-1'
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key='step2'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='space-y-6'
          >
            <div className='space-y-4'>
              <div>
                <Label htmlFor='bar_number'>{t('step2.bar_number.label')}</Label>
                <Input
                  id='bar_number'
                  value={formData.bar_number}
                  onChange={e => updateFormData({ bar_number: e.target.value })}
                  placeholder={t('step2.bar_number.placeholder')}
                  className='mt-1'
                />
                <p className='text-sm text-gray-600 mt-1'>
                  {t('step2.bar_number.help')}
                </p>
              </div>

              <div>
                <Label>{t('step2.licensed_states.label')}</Label>
                <p className='text-sm text-gray-600 mb-3'>
                  {t('step2.licensed_states.help')}
                </p>
                <div className='max-h-48 overflow-y-auto border rounded-lg p-3'>
                  <div className='grid grid-cols-2 gap-2'>
                    {US_STATES.map(state => (
                      <div key={state} className='flex items-center space-x-2'>
                        <Checkbox
                          id={state}
                          checked={formData.licensed_states.includes(state)}
                          onCheckedChange={() => toggleState(state)}
                        />
                        <Label htmlFor={state} className='text-sm font-normal'>
                          {t(`states.${state}`)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                {formData.licensed_states.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {formData.licensed_states.map(state => (
                      <Badge
                        key={state}
                        variant='secondary'
                        className='text-xs'
                      >
                        {state}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key='step3'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='space-y-6'
          >
            <div className='space-y-4'>
              <div>
                <Label htmlFor='experience_years'>{t('step3.experience_years.label')}</Label>
                <Select
                  value={formData.experience_years.toString()}
                  onValueChange={value =>
                    updateFormData({ experience_years: parseInt(value) })
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder={t('step3.experience_years.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>{t('step3.experience_years.options.1')}</SelectItem>
                    <SelectItem value='3'>{t('step3.experience_years.options.3')}</SelectItem>
                    <SelectItem value='6'>{t('step3.experience_years.options.6')}</SelectItem>
                    <SelectItem value='11'>{t('step3.experience_years.options.11')}</SelectItem>
                    <SelectItem value='16'>{t('step3.experience_years.options.16')}</SelectItem>
                    <SelectItem value='21'>{t('step3.experience_years.options.21')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('step3.specializations.label')}</Label>
                <p className='text-sm text-gray-600 mb-3'>
                  {t('step3.specializations.help')}
                </p>
                <div className='grid grid-cols-2 gap-3'>
                  {getSpecializations(t).map(spec => (
                    <div key={spec.id} className='flex items-center space-x-2'>
                      <Checkbox
                        id={spec.id}
                        checked={formData.specializations.includes(spec.id)}
                        onCheckedChange={() => toggleSpecialization(spec.id)}
                      />
                      <Label htmlFor={spec.id} className='text-sm font-normal'>
                        {spec.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.specializations.length > 0 && (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {formData.specializations.map(specId => {
                      const spec = getSpecializations(t).find(s => s.id === specId);
                      return spec ? (
                        <Badge
                          key={spec.id}
                          variant='secondary'
                          className='text-xs'
                        >
                          {spec.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key='step4'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='space-y-6'
          >
            <div className='space-y-4'>
              <div>
                <Label htmlFor='hourly_rate'>{t('step4.hourly_rate.label')}</Label>
                <Input
                  id='hourly_rate'
                  type='number'
                  value={formData.hourly_rate || ''}
                  onChange={e =>
                    updateFormData({
                      hourly_rate: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder={t('step4.hourly_rate.placeholder')}
                  className='mt-1'
                />
                <p className='text-sm text-gray-600 mt-1'>
                  {t('step4.hourly_rate.help')}
                </p>
              </div>

              <div>
                <Label htmlFor='bio'>{t('step4.bio.label')}</Label>
                <Textarea
                  id='bio'
                  value={formData.bio}
                  onChange={e => updateFormData({ bio: e.target.value })}
                  placeholder={t('step4.bio.placeholder')}
                  rows={4}
                  className='mt-1'
                />
                <p className='text-sm text-gray-600 mt-1'>
                  {t('step4.bio.help')}
                </p>
              </div>

              <div>
                <Label htmlFor='motivation'>{t('step4.motivation.label')}</Label>
                <Textarea
                  id='motivation'
                  value={formData.motivation}
                  onChange={e => updateFormData({ motivation: e.target.value })}
                  placeholder={t('step4.motivation.placeholder')}
                  rows={3}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='referral_source'>
                  {t('step4.referral_source.label')}
                </Label>
                <Select
                  value={formData.referral_source}
                  onValueChange={value =>
                    updateFormData({ referral_source: value })
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder={t('step4.referral_source.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='colleague'>
                      {t('step4.referral_source.options.colleague')}
                    </SelectItem>
                    <SelectItem value='online_search'>{t('step4.referral_source.options.online_search')}</SelectItem>
                    <SelectItem value='legal_publication'>
                      {t('step4.referral_source.options.legal_publication')}
                    </SelectItem>
                    <SelectItem value='conference'>{t('step4.referral_source.options.conference')}</SelectItem>
                    <SelectItem value='linkedin'>{t('step4.referral_source.options.linkedin')}</SelectItem>
                    <SelectItem value='other'>{t('step4.referral_source.options.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className='text-center mb-8'>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className='flex items-center justify-center gap-3 mb-4'
        >
          <Scale className='h-8 w-8 text-blue-600' />
          <h1 className='text-3xl font-bold text-gray-900'>
            {t('header.title')}
          </h1>
        </motion.div>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          {t('header.subtitle')}
        </p>
      </div>

      {/* Progress Steps */}
      <div className='flex justify-center mb-8'>
        <div className='flex items-center space-x-4'>
          {steps.map((step, index) => (
            <div key={step.id} className='flex items-center'>
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
                  step.isCompleted
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : step.isActive
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                )}
              >
                {step.isCompleted ? (
                  <CheckCircle className='h-6 w-6' />
                ) : (
                  <step.icon className='h-6 w-6' />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-16 h-0.5 mx-2 transition-all duration-300',
                    step.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Titles */}
      <div className='text-center mb-8'>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>
          {steps[currentStep - 1]?.title}
        </h2>
        <p className='text-gray-600'>{steps[currentStep - 1]?.description}</p>
      </div>

      {/* Form Content */}
      <Card className='shadow-lg'>
        <CardContent className='p-8'>
          <AnimatePresence mode='wait'>{renderStepContent()}</AnimatePresence>

          {/* Navigation Buttons */}
          <div className='flex justify-between mt-8 pt-6 border-t border-gray-200'>
            <div>
              {currentStep > 1 && (
                <Button
                  variant='outline'
                  onClick={handlePrevious}
                  className='flex items-center gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  {t('buttons.previous')}
                </Button>
              )}
              {onCancel && currentStep === 1 && (
                <Button
                  variant='outline'
                  onClick={onCancel}
                  className='text-gray-600'
                >
                  {t('buttons.cancel')}
                </Button>
              )}
            </div>

            <div>
              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className='flex items-center gap-2'
                >
                  {t('buttons.continue')}
                  <ArrowRight className='h-4 w-4' />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(4)}
                  className='flex items-center gap-2 bg-green-600 hover:bg-green-700'
                >
                  {t('buttons.submit')}
                  <CheckCircle className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className='mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8'>
        <h3 className='text-2xl font-bold text-center mb-8 text-gray-900'>
          {t('benefits.title')}
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <Users className='h-12 w-12 text-blue-600 mx-auto mb-4' />
            <h4 className='font-semibold mb-2'>{t('benefits.build_practice.title')}</h4>
            <p className='text-sm text-gray-600'>
              {t('benefits.build_practice.description')}
            </p>
          </div>
          <div className='text-center'>
            <Shield className='h-12 w-12 text-blue-600 mx-auto mb-4' />
            <h4 className='font-semibold mb-2'>{t('benefits.trusted_platform.title')}</h4>
            <p className='text-sm text-gray-600'>
              {t('benefits.trusted_platform.description')}
            </p>
          </div>
          <div className='text-center'>
            <Scale className='h-12 w-12 text-blue-600 mx-auto mb-4' />
            <h4 className='font-semibold mb-2'>{t('benefits.flexible_schedule.title')}</h4>
            <p className='text-sm text-gray-600'>
              {t('benefits.flexible_schedule.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}