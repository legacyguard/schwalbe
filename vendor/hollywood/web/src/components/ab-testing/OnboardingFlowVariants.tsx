
/**
 * A/B Testing Onboarding Flow Variants
 * Tests different onboarding approaches for conversion optimization
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useABTest } from '@/lib/ab-testing/ab-testing-system';
import { useOnboardingTracking } from '@/hooks/useConversionTracking';

interface OnboardingFlowProps {
  className?: string;
  onComplete: (userData: Record<string, unknown>) => void;
  onSkip?: () => void;
  userId?: string;
}

interface OnboardingStep {
  component: React.ComponentType<any>;
  description: string;
  id: string;
  title: string;
}

export function ABTestOnboardingFlow({
  onComplete,
  onSkip,
  userId,
  className,
}: OnboardingFlowProps) {
  const { t } = useTranslation('ui/onboarding-variants');
  const { variant, trackConversion } = useABTest('onboarding_flow_v1', userId);
  const { trackOnboardingStart, trackOnboardingStep, trackOnboardingComplete } =
    useOnboardingTracking();
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [userData, setUserData] = useState({});

  // Track onboarding start
  useEffect(() => {
    trackOnboardingStart();
    trackConversion('onboarding_started', 1, { variant });
  }, [trackOnboardingStart, trackConversion, variant]);

  const handleStepComplete = (stepData: Record<string, unknown>) => {
    const timeSpent = Date.now() - stepStartTime;
    const stepId = getSteps(variant, t)[currentStep]?.id || 'unknown';

    trackOnboardingStep(stepId, 'completed', timeSpent);

    setUserData(prev => ({ ...prev, ...stepData }));

    if (currentStep < getSteps(variant, t).length - 1) {
      setCurrentStep(prev => prev + 1);
      setStepStartTime(Date.now());
    } else {
      // Onboarding complete
      const totalTime = Date.now() - startTime;
      trackOnboardingComplete(totalTime, getSteps(variant, t).length);
      trackConversion('onboarding_completed', 1, {
        variant,
        totalTime,
        stepsCompleted: getSteps(variant, t).length,
      });
      onComplete({ ...userData, ...stepData });
    }
  };

  const handleStepSkip = () => {
    const stepId = getSteps(variant, t)[currentStep]?.id || 'unknown';
    trackOnboardingStep(stepId, 'abandoned');

    if (onSkip) {
      onSkip();
    } else {
      // Skip to next step
      if (currentStep < getSteps(variant, t).length - 1) {
        setCurrentStep(prev => prev + 1);
        setStepStartTime(Date.now());
      }
    }
  };

  const steps = getSteps(variant, t);
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('max-w-2xl mx-auto p-6', className)}>
      {/* Progress Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-2'>
          <h1 className='text-2xl font-bold text-gray-900'>
            {variant === 'variant_a'
              ? t('header.variant_a_title')
              : t('header.variant_b_title')}
          </h1>
          <Badge variant='outline' className='text-sm'>
            {t('header.progress', { current: currentStep + 1, total: steps.length })}
          </Badge>
        </div>
        <Progress value={progress} className='h-2 mb-2' />
        <p className='text-sm text-gray-600'>
          {variant === 'variant_a'
            ? t('header.variant_a_subtitle')
            : t('header.step_description', { current: currentStep + 1, description: currentStepData?.description })}
        </p>
      </div>

      {/* Step Content */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStepData && (
            <currentStepData.component
              onComplete={handleStepComplete}
              onSkip={handleStepSkip}
              userData={userData}
              variant={variant}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Get steps based on A/B test variant
 */
function getSteps(variant: string, t: any): OnboardingStep[] {
  const controlSteps = [
    {
      id: 'name',
      title: t('steps.control.name.title'),
      description: t('steps.control.name.description'),
      component: NameStep,
    },
    {
      id: 'purpose',
      title: t('steps.control.purpose.title'),
      description: t('steps.control.purpose.description'),
      component: PurposeStep,
    },
    {
      id: 'family',
      title: t('steps.control.family.title'),
      description: t('steps.control.family.description'),
      component: FamilyStep,
    },
    {
      id: 'next_steps',
      title: t('steps.control.next_steps.title'),
      description: t('steps.control.next_steps.description'),
      component: NextStepsStep,
    },
  ];

  const emotionFirstSteps = [
    {
      id: 'family_impact',
      title: t('steps.emotion_first.family_impact.title'),
      description: t('steps.emotion_first.family_impact.description'),
      component: FamilyImpactStep,
    },
    {
      id: 'protection_goals',
      title: t('steps.emotion_first.protection_goals.title'),
      description: t('steps.emotion_first.protection_goals.description'),
      component: ProtectionGoalsStep,
    },
    {
      id: 'personal_info',
      title: t('steps.emotion_first.personal_info.title'),
      description: t('steps.emotion_first.personal_info.description'),
      component: PersonalInfoStep,
    },
    {
      id: 'first_action',
      title: t('steps.emotion_first.first_action.title'),
      description: t('steps.emotion_first.first_action.description'),
      component: FirstActionStep,
    },
  ];

  return variant === 'variant_a' ? emotionFirstSteps : controlSteps;
}

/**
 * Control Flow Step Components
 */
function NameStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: Record<string, unknown>) => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation('ui/onboarding-variants');
  const [name, setName] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('name_step.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='name'>{t('name_step.label')}</Label>
          <Input
            id='name'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('name_step.placeholder')}
            className='mt-1'
          />
        </div>
        <div className='flex gap-3 pt-4'>
          <Button
            onClick={() => onComplete({ name })}
            disabled={!name.trim()}
            className='flex-1'
          >
            {t('name_step.continue')}
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            {t('name_step.skip')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PurposeStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: Record<string, unknown>) => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation('ui/onboarding-variants');
  const [purpose, setPurpose] = useState('');

  const purposes = [
    { key: 'organize_documents', value: t('purpose_step.options.organize_documents') },
    { key: 'create_will', value: t('purpose_step.options.create_will') },
    { key: 'family_access', value: t('purpose_step.options.family_access') },
    { key: 'legal_review', value: t('purpose_step.options.legal_review') },
    { key: 'all_above', value: t('purpose_step.options.all_above') },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('purpose_step.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          {purposes.map((option, index) => (
            <button
              key={index}
              onClick={() => setPurpose(option.value)}
              className={cn(
                'w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors',
                purpose === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              )}
            >
              {option.value}
            </button>
          ))}
        </div>
        <div className='flex gap-3 pt-4'>
          <Button
            onClick={() => onComplete({ purpose })}
            disabled={!purpose}
            className='flex-1'
          >
            {t('purpose_step.continue')}
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            {t('purpose_step.skip')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FamilyStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: Record<string, unknown>) => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation('ui/onboarding-variants');
  const [familySize, setFamilySize] = useState('');
  const [hasMinors, setHasMinors] = useState<boolean | null>(null);

  const familySizes = [
    { key: '1-2', value: t('family_step.family_size_options.1-2') },
    { key: '3-4', value: t('family_step.family_size_options.3-4') },
    { key: '5-6', value: t('family_step.family_size_options.5-6') },
    { key: '7+', value: t('family_step.family_size_options.7+') },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('family_step.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label>{t('family_step.family_size_label')}</Label>
          <div className='grid grid-cols-2 gap-2 mt-2'>
            {familySizes.map(size => (
              <button
                key={size.key}
                onClick={() => setFamilySize(size.key)}
                className={cn(
                  'p-2 border rounded hover:bg-gray-50',
                  familySize === size.key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                )}
              >
                {size.value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>{t('family_step.minors_label')}</Label>
          <div className='flex gap-2 mt-2'>
            <Button
              variant={hasMinors === true ? 'default' : 'outline'}
              onClick={() => setHasMinors(true)}
              className='flex-1'
            >
              {t('family_step.yes')}
            </Button>
            <Button
              variant={hasMinors === false ? 'default' : 'outline'}
              onClick={() => setHasMinors(false)}
              className='flex-1'
            >
              {t('family_step.no')}
            </Button>
          </div>
        </div>

        <div className='flex gap-3 pt-4'>
          <Button
            onClick={() => onComplete({ familySize, hasMinors })}
            className='flex-1'
          >
            {t('family_step.continue')}
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            {t('family_step.skip')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NextStepsStep({
  onComplete,
  userData: _userData,
}: {
  onComplete: (data: Record<string, unknown>) => void;
  userData: Record<string, unknown>;
}) {
  const { t } = useTranslation('ui/onboarding-variants');

  const recommendations = [
    {
      icon: Shield,
      title: t('next_steps.recommendations.upload_documents.title'),
      description: t('next_steps.recommendations.upload_documents.description'),
      time: t('next_steps.recommendations.upload_documents.time'),
    },
    {
      icon: Users,
      title: t('next_steps.recommendations.emergency_contacts.title'),
      description: t('next_steps.recommendations.emergency_contacts.description'),
      time: t('next_steps.recommendations.emergency_contacts.time'),
    },
    {
      icon: CheckCircle,
      title: t('next_steps.recommendations.complete_will.title'),
      description: t('next_steps.recommendations.complete_will.description'),
      time: t('next_steps.recommendations.complete_will.time'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('next_steps.title')}</CardTitle>
        <p className='text-gray-600'>
          {t('next_steps.subtitle')}
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className='flex items-start gap-3 p-3 border rounded-lg'
          >
            <rec.icon className='h-5 w-5 text-blue-600 mt-1' />
            <div className='flex-1'>
              <h4 className='font-medium'>{rec.title}</h4>
              <p className='text-sm text-gray-600'>{rec.description}</p>
            </div>
            <Badge variant='outline' className='text-xs'>
              <Clock className='h-3 w-3 mr-1' />
              {rec.time}
            </Badge>
          </div>
        ))}

        <Button
          onClick={() => onComplete({ onboardingComplete: true })}
          className='w-full mt-6'
          size='lg'
        >
          {t('next_steps.start_button')}
          <ArrowRight className='h-4 w-4 ml-2' />
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Emotion-First Flow Step Components
 */
function FamilyImpactStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: Record<string, unknown>) => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation('ui/onboarding-variants');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  const people = [
    { id: 'spouse', label: t('family_impact_step.people.spouse'), icon: Heart },
    { id: 'children', label: t('family_impact_step.people.children'), icon: Users },
    { id: 'parents', label: t('family_impact_step.people.parents'), icon: Shield },
    { id: 'siblings', label: t('family_impact_step.people.siblings'), icon: Users },
    { id: 'extended', label: t('family_impact_step.people.extended'), icon: Users },
  ];

  const togglePerson = (id: string) => {
    setSelectedPeople(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Heart className='h-5 w-5 text-red-500' />
          {t('family_impact_step.title')}
        </CardTitle>
        <p className='text-gray-600'>
          {t('family_impact_step.subtitle')}
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 gap-2'>
          {people.map(person => (
            <button
              key={person.id}
              onClick={() => togglePerson(person.id)}
              className={cn(
                'flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-gray-50 transition-all',
                selectedPeople.includes(person.id)
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200'
              )}
            >
              <person.icon
                className={cn(
                  'h-5 w-5',
                  selectedPeople.includes(person.id)
                    ? 'text-blue-600'
                    : 'text-gray-400'
                )}
              />
              <span className='font-medium'>{person.label}</span>
              {selectedPeople.includes(person.id) && (
                <CheckCircle className='h-4 w-4 text-blue-600 ml-auto' />
              )}
            </button>
          ))}
        </div>

        {selectedPeople.length > 0 && (
          <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-sm text-blue-800'>
              <Shield className='h-4 w-4 inline mr-1' />
              {selectedPeople.length === 1
                ? t('family_impact_step.confirmation.single')
                : t('family_impact_step.confirmation.multiple', { count: selectedPeople.length })}
            </p>
          </div>
        )}

        <div className='flex gap-3 pt-4'>
          <Button
            onClick={() => onComplete({ protectedPeople: selectedPeople })}
            disabled={selectedPeople.length === 0}
            className='flex-1'
          >
            {t('family_impact_step.continue')}
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            {t('family_impact_step.skip')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProtectionGoalsStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: Record<string, unknown>) => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation('ui/onboarding-variants');
  const [goals, setGoals] = useState<string[]>([]);

  const protectionGoals = [
    {
      id: 'emergency_access',
      title: t('protection_goals_step.goals.emergency_access.title'),
      description: t('protection_goals_step.goals.emergency_access.description'),
      impact: t('protection_goals_step.goals.emergency_access.impact'),
    },
    {
      id: 'financial_security',
      title: t('protection_goals_step.goals.financial_security.title'),
      description: t('protection_goals_step.goals.financial_security.description'),
      impact: t('protection_goals_step.goals.financial_security.impact'),
    },
    {
      id: 'child_care',
      title: t('protection_goals_step.goals.child_care.title'),
      description: t('protection_goals_step.goals.child_care.description'),
      impact: t('protection_goals_step.goals.child_care.impact'),
    },
    {
      id: 'legal_compliance',
      title: t('protection_goals_step.goals.legal_compliance.title'),
      description: t('protection_goals_step.goals.legal_compliance.description'),
      impact: t('protection_goals_step.goals.legal_compliance.impact'),
    },
    {
      id: 'peace_of_mind',
      title: t('protection_goals_step.goals.peace_of_mind.title'),
      description: t('protection_goals_step.goals.peace_of_mind.description'),
      impact: t('protection_goals_step.goals.peace_of_mind.impact'),
    },
  ];

  const toggleGoal = (id: string) => {
    setGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5 text-blue-600' />
          {t('protection_goals_step.title')}
        </CardTitle>
        <p className='text-gray-600'>
          {t('protection_goals_step.subtitle')}
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          {protectionGoals.map(goal => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                'w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-all',
                goals.includes(goal.id)
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200'
              )}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h4 className='font-medium mb-1'>{goal.title}</h4>
                  <p className='text-sm text-gray-600'>{goal.description}</p>
                </div>
                <div className='ml-3 flex flex-col items-end'>
                  <Badge
                    variant={
                      goal.impact === t('protection_goals_step.goals.child_care.impact') ? 'destructive' : 'secondary'
                    }
                    className='text-xs mb-2'
                  >
                    {goal.impact}
                  </Badge>
                  {goals.includes(goal.id) && (
                    <CheckCircle className='h-4 w-4 text-blue-600' />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className='flex gap-3 pt-4'>
          <Button
            onClick={() => onComplete({ protectionGoals: goals })}
            disabled={goals.length === 0}
            className='flex-1'
          >
            {t('protection_goals_step.continue')}
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            {t('protection_goals_step.skip')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PersonalInfoStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: Record<string, unknown>) => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation('ui/onboarding-variants');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('personal_info_step.title')}</CardTitle>
        <p className='text-gray-600'>
          {t('personal_info_step.subtitle')}
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='personal-name'>{t('personal_info_step.name_label')}</Label>
          <Input
            id='personal-name'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('personal_info_step.name_placeholder')}
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='location'>{t('personal_info_step.location_label')}</Label>
          <Input
            id='location'
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder={t('personal_info_step.location_placeholder')}
            className='mt-1'
          />
          <p className='text-xs text-gray-500 mt-1'>
            {t('personal_info_step.location_help')}
          </p>
        </div>

        <div className='flex gap-3 pt-4'>
          <Button
            onClick={() => onComplete({ name, location })}
            disabled={!name.trim()}
            className='flex-1'
          >
            {t('personal_info_step.continue')}
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            {t('personal_info_step.skip')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FirstActionStep({
  onComplete,
  userData: _userData,
}: {
  onComplete: (data: Record<string, unknown>) => void;
  userData: Record<string, unknown>;
}) {
  const { t } = useTranslation('ui/onboarding-variants');

  const quickActions = [
    {
      id: 'upload_document',
      title: t('first_action_step.actions.upload_document.title'),
      description: t('first_action_step.actions.upload_document.description'),
      time: t('first_action_step.actions.upload_document.time'),
      impact: t('first_action_step.actions.upload_document.impact'),
      icon: Shield,
      primary: true,
    },
    {
      id: 'add_contact',
      title: t('first_action_step.actions.add_contact.title'),
      description: t('first_action_step.actions.add_contact.description'),
      time: t('first_action_step.actions.add_contact.time'),
      impact: t('first_action_step.actions.add_contact.impact'),
      icon: Users,
      primary: false,
    },
    {
      id: 'start_will',
      title: t('first_action_step.actions.start_will.title'),
      description: t('first_action_step.actions.start_will.description'),
      time: t('first_action_step.actions.start_will.time'),
      impact: t('first_action_step.actions.start_will.impact'),
      icon: CheckCircle,
      primary: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CheckCircle className='h-5 w-5 text-green-600' />
          {t('first_action_step.title')}
        </CardTitle>
        <p className='text-gray-600'>
          {t('first_action_step.subtitle')}
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {quickActions.map((action, _index) => (
          <button
            key={action.id}
            onClick={() =>
              onComplete({ firstAction: action.id, onboardingComplete: true })
            }
            className={cn(
              'w-full p-4 text-left border rounded-lg hover:shadow-md transition-all',
              action.primary
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:bg-gray-50'
            )}
          >
            <div className='flex items-start gap-3'>
              <action.icon
                className={cn(
                  'h-6 w-6 mt-1',
                  action.primary ? 'text-blue-600' : 'text-gray-500'
                )}
              />
              <div className='flex-1'>
                <h4 className='font-medium mb-1'>{action.title}</h4>
                <p className='text-sm text-gray-600 mb-2'>
                  {action.description}
                </p>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-gray-500'>
                    <Clock className='h-3 w-3 inline mr-1' />
                    {action.time}
                  </span>
                  <span
                    className={cn(
                      'font-medium',
                      action.primary ? 'text-blue-600' : 'text-gray-600'
                    )}
                  >
                    {action.impact}
                  </span>
                </div>
              </div>
              <ArrowRight
                className={cn(
                  'h-4 w-4 mt-1',
                  action.primary ? 'text-blue-600' : 'text-gray-400'
                )}
              />
            </div>
          </button>
        ))}

        <div className='pt-4 border-t'>
          <p className='text-xs text-gray-500 text-center'>
            {t('first_action_step.footer_note')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ABTestOnboardingFlow;
