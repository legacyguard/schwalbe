/**
 * A/B Testing Onboarding Flow Variants
 * Tests different onboarding approaches for conversion optimization
 */

import React, { useEffect, useState } from 'react';
import { logger } from '@schwalbe/shared/lib/logger';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Progress, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  className?: string;
  onComplete: (userData: Record<string, unknown>) => void;
  onSkip?: () => void;
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
  className,
}: OnboardingFlowProps) {
  // Simple A/B test - can be enhanced with proper A/B testing framework
  const [variant] = useState(() => Math.random() > 0.5 ? 'variant_a' : 'variant_b');
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [userData, setUserData] = useState({});

  // Track onboarding start
  useEffect(() => {
    logger.info('Onboarding started with variant', { metadata: { variant } });
  }, [variant]);

  const handleStepComplete = (stepData: Record<string, unknown>) => {
    const timeSpent = Date.now() - stepStartTime;
    const stepId = getSteps(variant)[currentStep]?.id || 'unknown';

    logger.info(`Step ${stepId} completed in ${timeSpent}ms`);

    setUserData(prev => ({ ...prev, ...stepData }));

    if (currentStep < getSteps(variant).length - 1) {
      setCurrentStep(prev => prev + 1);
      setStepStartTime(Date.now());
    } else {
      // Onboarding complete
      const totalTime = Date.now() - startTime;
      logger.info(`Onboarding completed in ${totalTime}ms with variant ${variant}`);
      onComplete({ ...userData, ...stepData, variant, totalTime });
    }
  };

  const handleStepSkip = () => {
    const stepId = getSteps(variant)[currentStep]?.id || 'unknown';
    logger.info(`Step ${stepId} skipped`);

    if (onSkip) {
      onSkip();
    } else {
      // Skip to next step
      if (currentStep < getSteps(variant).length - 1) {
        setCurrentStep(prev => prev + 1);
        setStepStartTime(Date.now());
      }
    }
  };

  const steps = getSteps(variant);
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('max-w-2xl mx-auto p-6', className)}>
      {/* Progress Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-2'>
          <h1 className='text-2xl font-bold text-gray-900'>
            {variant === 'variant_a'
              ? 'Create Your Family Shield'
              : 'Get Started with LegacyGuard'}
          </h1>
          <Badge variant='outline' className='text-sm'>
            {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className='h-2 mb-2' />
        <p className='text-sm text-gray-600'>
          {variant === 'variant_a'
            ? 'Help us understand how to best protect your family'
            : `Step ${currentStep + 1}: ${currentStepData?.description}`}
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
function getSteps(variant: string): OnboardingStep[] {
  const controlSteps = [
    {
      id: 'name',
      title: 'What should we call you?',
      description: 'Personal introduction',
      component: NameStep,
    },
    {
      id: 'purpose',
      title: 'What brings you here?',
      description: 'Understanding your goals',
      component: PurposeStep,
    },
    {
      id: 'family',
      title: 'Tell us about your family',
      description: 'Family composition',
      component: FamilyStep,
    },
    {
      id: 'next_steps',
      title: 'Your recommended next steps',
      description: 'Getting started',
      component: NextStepsStep,
    },
  ];

  const emotionFirstSteps = [
    {
      id: 'family_impact',
      title: 'Who do you want to protect?',
      description: 'Understanding family impact',
      component: FamilyImpactStep,
    },
    {
      id: 'protection_goals',
      title: 'What matters most to you?',
      description: 'Defining protection goals',
      component: ProtectionGoalsStep,
    },
    {
      id: 'personal_info',
      title: 'A few details about you',
      description: 'Personal information',
      component: PersonalInfoStep,
    },
    {
      id: 'first_action',
      title: 'Take your first step',
      description: 'Choose your starting point',
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
  const [name, setName] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>What should we call you?</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='name'>Your name</Label>
          <Input
            id='name'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Enter your first name'
            className='mt-1'
          />
        </div>
        <div className='flex gap-3 pt-4'>
          <Button
            onClick={() => onComplete({ name })}
            disabled={!name.trim()}
            className='flex-1'
          >
            Continue
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            Skip
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
  const [purpose, setPurpose] = useState('');

  const purposes = [
    { key: 'organize_documents', value: 'Organize important documents' },
    { key: 'create_will', value: 'Create or update my will' },
    { key: 'family_access', value: 'Give my family access to important info' },
    { key: 'legal_review', value: 'Get professional legal review' },
    { key: 'all_above', value: 'All of the above' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>What brings you here?</CardTitle>
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
            Continue
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            Skip
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
  const [familySize, setFamilySize] = useState('');
  const [hasMinors, setHasMinors] = useState<boolean | null>(null);

  const familySizes = [
    { key: '1-2', value: '1-2 people' },
    { key: '3-4', value: '3-4 people' },
    { key: '5-6', value: '5-6 people' },
    { key: '7+', value: '7+ people' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tell us about your family</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label>How many people are in your immediate family?</Label>
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
          <Label>Do you have children under 18?</Label>
          <div className='flex gap-2 mt-2'>
            <Button
              variant={hasMinors === true ? 'default' : 'outline'}
              onClick={() => setHasMinors(true)}
              className='flex-1'
            >
              Yes
            </Button>
            <Button
              variant={hasMinors === false ? 'default' : 'outline'}
              onClick={() => setHasMinors(false)}
              className='flex-1'
            >
              No
            </Button>
          </div>
        </div>

        <div className='flex gap-3 pt-4'>
          <Button
            onClick={() => onComplete({ familySize, hasMinors })}
            className='flex-1'
          >
            Continue
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            Skip
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
  const recommendations = [
    {
      icon: Shield,
      title: 'Upload important documents',
      description: 'Start by organizing your most critical documents',
      time: '5 min',
    },
    {
      icon: Users,
      title: 'Add emergency contacts',
      description: 'Set up trusted people who can access your information',
      time: '3 min',
    },
    {
      icon: CheckCircle,
      title: 'Complete your will',
      description: 'Create a legally valid will with our guided process',
      time: '15 min',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your recommended next steps</CardTitle>
        <p className='text-gray-600'>
          Based on your responses, here's what we recommend you do first:
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
          Start protecting my family
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
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  const people = [
    { id: 'spouse', label: 'My spouse/partner', icon: Heart },
    { id: 'children', label: 'My children', icon: Users },
    { id: 'parents', label: 'My parents', icon: Shield },
    { id: 'siblings', label: 'My siblings', icon: Users },
    { id: 'extended', label: 'Extended family', icon: Users },
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
          Who do you want to protect?
        </CardTitle>
        <p className='text-gray-600'>
          Select the people who matter most to you. We'll help you create a plan that gives them peace of mind.
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
                ? "We'll help you protect the person who matters most to you."
                : `We'll help you protect all ${selectedPeople.length} groups of people you've selected.`}
            </p>
          </div>
        )}

        <div className='flex gap-3 pt-4'>
          <Button
            onClick={() => onComplete({ protectedPeople: selectedPeople })}
            disabled={selectedPeople.length === 0}
            className='flex-1'
          >
            Continue
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            Skip
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
  const [goals, setGoals] = useState<string[]>([]);

  const protectionGoals = [
    {
      id: 'emergency_access',
      title: 'Emergency access to accounts',
      description: 'Make sure loved ones can access important accounts if something happens',
      impact: 'High impact',
    },
    {
      id: 'financial_security',
      title: 'Financial security',
      description: 'Ensure your family is financially protected and knows where everything is',
      impact: 'High impact',
    },
    {
      id: 'child_care',
      title: 'Guardian for children',
      description: 'Make sure your children are cared for by people you trust',
      impact: 'Critical',
    },
    {
      id: 'legal_compliance',
      title: 'Legal compliance',
      description: 'Ensure all documents are legally valid and up to date',
      impact: 'Medium impact',
    },
    {
      id: 'peace_of_mind',
      title: 'Peace of mind',
      description: 'Know that everything is organized and your family is prepared',
      impact: 'High impact',
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
          What matters most to you?
        </CardTitle>
        <p className='text-gray-600'>
          Help us understand your priorities so we can create the best plan for your family.
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
                      goal.impact === 'Critical' ? 'destructive' : 'secondary'
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
            Continue
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            Skip
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
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>A few details about you</CardTitle>
        <p className='text-gray-600'>
          This helps us personalize your experience and ensure legal compliance.
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='personal-name'>What should we call you?</Label>
          <Input
            id='personal-name'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Your first name'
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='location'>Where are you located?</Label>
          <Input
            id='location'
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder='City, State or Country'
            className='mt-1'
          />
          <p className='text-xs text-gray-500 mt-1'>
            This helps us provide region-specific legal guidance
          </p>
        </div>

        <div className='flex gap-3 pt-4'>
          <Button
            onClick={() => onComplete({ name, location })}
            disabled={!name.trim()}
            className='flex-1'
          >
            Continue
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
          <Button variant='ghost' onClick={onSkip}>
            Skip
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
  const quickActions = [
    {
      id: 'upload_document',
      title: 'Upload your first document',
      description: 'Start by uploading an important document like an insurance policy or bank statement',
      time: '2 min',
      impact: 'Quick win',
      icon: Shield,
      primary: true,
    },
    {
      id: 'add_contact',
      title: 'Add a trusted contact',
      description: 'Add someone who can access your information in an emergency',
      time: '3 min',
      impact: 'High impact',
      icon: Users,
      primary: false,
    },
    {
      id: 'start_will',
      title: 'Start creating your will',
      description: 'Begin the guided process to create a legally valid will',
      time: '10 min',
      impact: 'Major milestone',
      icon: CheckCircle,
      primary: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CheckCircle className='h-5 w-5 text-green-600' />
          Take your first step
        </CardTitle>
        <p className='text-gray-600'>
          Choose what feels right to start with. You can always do the others later.
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
            Don't worry - you can always change your mind or do multiple things later
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ABTestOnboardingFlow;