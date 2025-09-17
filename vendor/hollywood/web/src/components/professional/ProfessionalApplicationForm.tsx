
/**
 * Professional Reviewer Application Form
 * Premium UI/UX for attorney and professional onboarding
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  GraduationCap,
  Scale,
  Shield,
  Star,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type {
  ProfessionalOnboarding,
  ProfessionalSpecialization,
} from '@/types/professional';

interface ProfessionalApplicationFormProps {
  className?: string;
  onCancel: () => void;
  onSubmit: (
    application: Omit<
      ProfessionalOnboarding,
      'created_at' | 'id' | 'updated_at'
    >
  ) => void;
}

type ApplicationStep =
  | 'credentials'
  | 'expertise'
  | 'personal'
  | 'preferences'
  | 'review';

const getSpecializations = (t: any): Omit<ProfessionalSpecialization, 'id'>[] => [
  {
    name: t('specializations.estatePlanning.name'),
    category: 'estate_planning',
    description: t('specializations.estatePlanning.description'),
  },
  {
    name: t('specializations.probateLaw.name'),
    category: 'estate_planning',
    description: t('specializations.probateLaw.description'),
  },
  {
    name: t('specializations.familyLaw.name'),
    category: 'family_law',
    description: t('specializations.familyLaw.description'),
  },
  {
    name: t('specializations.realEstateLaw.name'),
    category: 'real_estate',
    description: t('specializations.realEstateLaw.description'),
  },
  {
    name: t('specializations.businessLaw.name'),
    category: 'business_law',
    description: t('specializations.businessLaw.description'),
  },
  {
    name: t('specializations.taxLaw.name'),
    category: 'tax_law',
    description: t('specializations.taxLaw.description'),
  },
  {
    name: t('specializations.elderLaw.name'),
    category: 'estate_planning',
    description: t('specializations.elderLaw.description'),
  },
  {
    name: t('specializations.assetProtection.name'),
    category: 'estate_planning',
    description: t('specializations.assetProtection.description'),
  },
];

const getUSStates = (t: any): string[] => t('states', { returnObjects: true }) as string[];

export function ProfessionalApplicationForm({
  onSubmit,
  onCancel,
  className,
}: ProfessionalApplicationFormProps) {
  const { t } = useTranslation('ui/professional-application');
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('personal');

  const SPECIALIZATIONS = getSpecializations(t);
  const US_STATES = getUSStates(t);
  const [application, setApplication] = useState<
    Partial<ProfessionalOnboarding>
  >({
    status: 'draft',
    licensed_states: [],
    specializations: [],
    experience_years: 0,
  });
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: {
    icon: React.ComponentType<{ className?: string }>;
    key: ApplicationStep;
    title: string;
  }[] = [
    { key: 'personal', title: t('steps.personal'), icon: User },
    { key: 'credentials', title: t('steps.credentials'), icon: Scale },
    { key: 'expertise', title: t('steps.expertise'), icon: GraduationCap },
    { key: 'preferences', title: t('steps.preferences'), icon: Clock },
    { key: 'review', title: t('steps.review'), icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const validateStep = (step: ApplicationStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'personal':
        if (!application.full_name?.trim())
          newErrors.full_name = t('personal.fullName.required');
        if (!application.email?.trim()) newErrors.email = t('personal.email.required');
        if (!application.professional_title?.trim())
          newErrors.professional_title = t('personal.professionalTitle.required');
        break;
      case 'credentials':
        if (!application.bar_number?.trim())
          newErrors.bar_number = t('credentials.barNumber.required');
        if (!application.licensed_states?.length)
          newErrors.licensed_states = t('credentials.licensedStates.required');
        if (!application.experience_years || application.experience_years < 1)
          newErrors.experience_years = t('credentials.experienceYears.required');
        break;
      case 'expertise':
        if (!selectedSpecializations.length)
          newErrors.specializations = t('expertise.required');
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex].key);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleSubmit = () => {
    if (validateStep('review')) {
      const finalApplication: Omit<
        ProfessionalOnboarding,
        'created_at' | 'id' | 'updated_at'
      > = {
        ...(application as Required<
          Pick<
            ProfessionalOnboarding,
            | 'bar_number'
            | 'email'
            | 'experience_years'
            | 'full_name'
            | 'licensed_states'
            | 'professional_title'
          >
        >),
        specializations: selectedSpecializations,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      };
      onSubmit(finalApplication);
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(specialization)
        ? prev.filter(s => s !== specialization)
        : [...prev, specialization]
    );
  };

  const handleStateToggle = (state: string) => {
    setApplication(prev => ({
      ...prev,
      licensed_states: prev.licensed_states?.includes(state)
        ? prev.licensed_states.filter(s => s !== state)
        : [...(prev.licensed_states || []), state],
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <User className='h-8 w-8 text-blue-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>
                {t('personal.title')}
              </h3>
              <p className='text-muted-foreground'>
                {t('personal.subtitle')}
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='full_name'>{t('personal.fullName.label')} *</Label>
                <Input
                  id='full_name'
                  value={application.full_name || ''}
                  onChange={e =>
                    setApplication(prev => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder={t('personal.fullName.placeholder')}
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className='text-sm text-red-500'>{errors.full_name}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>{t('personal.email.label')} *</Label>
                <Input
                  id='email'
                  type='email'
                  value={application.email || ''}
                  onChange={e =>
                    setApplication(prev => ({ ...prev, email: e.target.value }))
                  }
                  placeholder={t('personal.email.placeholder')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className='text-sm text-red-500'>{errors.email}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='professional_title'>{t('personal.professionalTitle.label')} *</Label>
                <Input
                  id='professional_title'
                  value={application.professional_title || ''}
                  onChange={e =>
                    setApplication(prev => ({
                      ...prev,
                      professional_title: e.target.value,
                    }))
                  }
                  placeholder={t('personal.professionalTitle.placeholder')}
                  className={errors.professional_title ? 'border-red-500' : ''}
                />
                {errors.professional_title && (
                  <p className='text-sm text-red-500'>
                    {errors.professional_title}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='law_firm_name'>{t('personal.lawFirmName.label')}</Label>
                <Input
                  id='law_firm_name'
                  value={application.law_firm_name || ''}
                  onChange={e =>
                    setApplication(prev => ({
                      ...prev,
                      law_firm_name: e.target.value,
                    }))
                  }
                  placeholder={t('personal.lawFirmName.placeholder')}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio'>{t('personal.bio.label')}</Label>
              <Textarea
                id='bio'
                value={application.bio || ''}
                onChange={e =>
                  setApplication(prev => ({ ...prev, bio: e.target.value }))
                }
                placeholder={t('personal.bio.placeholder')}
                rows={4}
              />
            </div>
          </div>
        );

      case 'credentials':
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Scale className='h-8 w-8 text-green-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>
                {t('credentials.title')}
              </h3>
              <p className='text-muted-foreground'>
                {t('credentials.subtitle')}
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='bar_number'>{t('credentials.barNumber.label')} *</Label>
                <Input
                  id='bar_number'
                  value={application.bar_number || ''}
                  onChange={e =>
                    setApplication(prev => ({
                      ...prev,
                      bar_number: e.target.value,
                    }))
                  }
                  placeholder={t('credentials.barNumber.placeholder')}
                  className={errors.bar_number ? 'border-red-500' : ''}
                />
                {errors.bar_number && (
                  <p className='text-sm text-red-500'>{errors.bar_number}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='experience_years'>{t('credentials.experienceYears.label')} *</Label>
                <Input
                  id='experience_years'
                  type='number'
                  min='1'
                  max='50'
                  value={application.experience_years || ''}
                  onChange={e =>
                    setApplication(prev => ({
                      ...prev,
                      experience_years: parseInt(e.target.value) || 0,
                    }))
                  }
                  className={errors.experience_years ? 'border-red-500' : ''}
                />
                {errors.experience_years && (
                  <p className='text-sm text-red-500'>
                    {errors.experience_years}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-3'>
              <Label>{t('credentials.licensedStates.label')} *</Label>
              {errors.licensed_states && (
                <p className='text-sm text-red-500'>{errors.licensed_states}</p>
              )}
              <div className='grid grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg'>
                {US_STATES.map(state => (
                  <Button
                    key={state}
                    variant={
                      application.licensed_states?.includes(state)
                        ? 'default'
                        : 'outline'
                    }
                    size='sm'
                    onClick={() => handleStateToggle(state)}
                    className='text-xs h-8'
                  >
                    {state}
                  </Button>
                ))}
              </div>
              {application.licensed_states &&
                application.licensed_states.length > 0 && (
                  <div className='flex flex-wrap gap-1 mt-2'>
                    {application.licensed_states.map(state => (
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
        );

      case 'expertise':
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <GraduationCap className='h-8 w-8 text-purple-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>{t('expertise.title')}</h3>
              <p className='text-muted-foreground'>
                {t('expertise.subtitle')}
              </p>
            </div>

            {errors.specializations && (
              <Alert className='border-red-200 bg-red-50'>
                <AlertCircle className='h-4 w-4 text-red-600' />
                <AlertDescription className='text-red-700'>
                  {errors.specializations}
                </AlertDescription>
              </Alert>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {SPECIALIZATIONS.map(specialization => (
                <Card
                  key={specialization.name}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-md',
                    selectedSpecializations.includes(specialization.name)
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:border-blue-200'
                  )}
                  onClick={() =>
                    handleSpecializationToggle(specialization.name)
                  }
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between mb-2'>
                      <h4 className='font-medium'>{specialization.name}</h4>
                      {selectedSpecializations.includes(
                        specialization.name
                      ) && (
                        <CheckCircle className='h-5 w-5 text-blue-600 flex-shrink-0' />
                      )}
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {specialization.description}
                    </p>
                    <Badge variant='outline' className='mt-2 text-xs'>
                      {t(`categories.${specialization.category}`)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedSpecializations.length > 0 && (
              <div className='mt-6'>
                <Label>
                  {t('expertise.selectedCount', { count: selectedSpecializations.length })}
                </Label>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {selectedSpecializations.map(spec => (
                    <Badge key={spec} className='bg-blue-100 text-blue-800'>
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'preferences':
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Clock className='h-8 w-8 text-orange-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>{t('preferences.title')}</h3>
              <p className='text-muted-foreground'>
                {t('preferences.subtitle')}
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='hourly_rate'>{t('preferences.hourlyRate.label')}</Label>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='hourly_rate'
                    type='number'
                    min='50'
                    max='1000'
                    step='25'
                    value={application.hourly_rate || ''}
                    onChange={e =>
                      setApplication(prev => ({
                        ...prev,
                        hourly_rate: parseFloat(e.target.value) || undefined,
                      }))
                    }
                    placeholder={t('preferences.hourlyRate.placeholder')}
                    className='pl-10'
                  />
                </div>
                <p className='text-xs text-muted-foreground'>
                  {t('preferences.hourlyRate.help')}
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='referral_source'>
                  {t('preferences.referralSource.label')}
                </Label>
                <Input
                  id='referral_source'
                  value={application.referral_source || ''}
                  onChange={e =>
                    setApplication(prev => ({
                      ...prev,
                      referral_source: e.target.value,
                    }))
                  }
                  placeholder={t('preferences.referralSource.placeholder')}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='motivation'>
                {t('preferences.motivation.label')}
              </Label>
              <Textarea
                id='motivation'
                value={application.motivation || ''}
                onChange={e =>
                  setApplication(prev => ({
                    ...prev,
                    motivation: e.target.value,
                  }))
                }
                placeholder={t('preferences.motivation.placeholder')}
                rows={4}
              />
            </div>

            <Alert className='border-blue-200 bg-blue-50'>
              <Shield className='h-4 w-4 text-blue-600' />
              <AlertTitle className='text-blue-800'>
                {t('preferences.professionalStandards.title')}
              </AlertTitle>
              <AlertDescription className='text-blue-700'>
                {t('preferences.professionalStandards.description')}
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'review':
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <CheckCircle className='h-8 w-8 text-green-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>
                {t('review.title')}
              </h3>
              <p className='text-muted-foreground'>
                {t('review.subtitle')}
              </p>
            </div>

            <div className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <User className='h-5 w-5' />
                    {t('review.sections.personalInformation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div>
                    <strong>{t('review.fields.name')}</strong> {application.full_name}
                  </div>
                  <div>
                    <strong>{t('review.fields.email')}</strong> {application.email}
                  </div>
                  <div>
                    <strong>{t('review.fields.title')}</strong> {application.professional_title}
                  </div>
                  {application.law_firm_name && (
                    <div>
                      <strong>{t('review.fields.firm')}</strong> {application.law_firm_name}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Scale className='h-5 w-5' />
                    {t('review.sections.credentials')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div>
                    <strong>{t('review.fields.barNumber')}</strong> {application.bar_number}
                  </div>
                  <div>
                    <strong>{t('review.fields.experience')}</strong> {application.experience_years}{' '}
                    {t('review.fields.experienceYears')}
                  </div>
                  <div>
                    <strong>{t('review.fields.licensedStates')}</strong>{' '}
                    {application.licensed_states?.join(', ')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <GraduationCap className='h-5 w-5' />
                    {t('review.sections.specializations')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {selectedSpecializations.map(spec => (
                      <Badge key={spec} className='bg-blue-100 text-blue-800'>
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert className='border-green-200 bg-green-50'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <AlertTitle className='text-green-800'>{t('review.nextSteps.title')}</AlertTitle>
              <AlertDescription className='text-green-700'>
                {t('review.nextSteps.description')}
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('max-w-4xl mx-auto', className)}
    >
      <Card className='border-2'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <CardTitle className='text-2xl font-bold'>
                {t('title')}
              </CardTitle>
              <p className='text-muted-foreground'>
                {t('subtitle')}
              </p>
            </div>
            <Badge variant='outline' className='bg-blue-50 text-blue-700'>
              {t('stepIndicator', { current: currentStepIndex + 1, total: steps.length })}
            </Badge>
          </div>

          <div className='space-y-4'>
            <Progress value={progress} className='h-2' />

            <div className='flex items-center justify-between'>
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div
                    key={step.key}
                    className='flex flex-col items-center flex-1'
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors',
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                      )}
                    >
                      <Icon className='h-5 w-5' />
                    </div>
                    <span
                      className={cn(
                        'text-xs text-center font-medium',
                        isCompleted || isCurrent
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <div className='p-6 pt-0'>
          <Separator className='mb-6' />

          <div className='flex items-center justify-between'>
            <div className='flex gap-3'>
              {currentStepIndex > 0 && (
                <Button variant='outline' onClick={handleBack}>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  {t('navigation.back')}
                </Button>
              )}
              <Button variant='outline' onClick={onCancel}>
                {t('navigation.cancel')}
              </Button>
            </div>

            <div className='flex gap-3'>
              {currentStep !== 'review' ? (
                <Button onClick={handleNext}>
                  {t('navigation.next')}
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className='bg-green-600 hover:bg-green-700'
                >
                  <Star className='h-4 w-4 mr-2' />
                  {t('navigation.submitApplication')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
