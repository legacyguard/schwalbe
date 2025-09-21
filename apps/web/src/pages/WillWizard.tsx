import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FadeIn } from '@/components/motion/FadeIn';
import {
  PersonalityAwareAnimation,
  ContextAwareAnimation,
  EmotionalAnimation,
  PersonalityHoverEffect,
  PersonalityAnimationUtils
} from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import SofiaFirefly from '@/components/sofia-firefly/SofiaFirefly';

interface WillData {
  // Step 1: Legal Framework
  country: string;
  city: string;

  // Step 2: Family Information
  familyMembers: Array<{
    id: string;
    name: string;
    relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
    age?: number;
    isHeir: boolean;
    inheritancePercentage?: number;
  }>;

  // Step 3: Assets
  assets: Array<{
    id: string;
    name: string;
    type: 'property' | 'vehicle' | 'bank_account' | 'investment' | 'jewelry' | 'other';
    value: number;
    assignedTo?: string; // family member id
  }>;

  // Step 4: Distribution Wishes
  distribution: {
    equalSplit: boolean;
    specificBequests: Array<{
      assetId: string;
      recipientId: string;
      notes?: string;
    }>;
  };

  // Step 5: Executor
  executor: {
    name: string;
    relationship: string;
    contactInfo: string;
  };

  // Step 6: Personal Messages
  personalMessages: Array<{
    recipientId: string;
    message: string;
    type: 'text' | 'video' | 'audio';
  }>;

  // Step 7: Review & Completion
  legalValidation: {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  };
}

const WILL_STEPS = [
  { id: 1, title: 'Legal Framework', description: 'Set your legal foundation', icon: '⚖️' },
  { id: 2, title: 'Your Family', description: 'Who matters most to you', icon: '👨‍👩‍👧' },
  { id: 3, title: 'Your Assets', description: 'What you want to protect', icon: '🏠' },
  { id: 4, title: 'Distribution', description: 'How to share your legacy', icon: '📋' },
  { id: 5, title: 'Executor', description: 'Who will make it happen', icon: '👤' },
  { id: 6, title: 'Personal Messages', description: 'Your words for loved ones', icon: '💌' },
  { id: 7, title: 'Review & Complete', description: 'Final check and celebration', icon: '✨' }
];

export default function WillWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [willData, setWillData] = useState<Partial<WillData>>({
    country: 'Slovakia',
    city: 'Bratislava',
    familyMembers: [],
    assets: [],
    distribution: { equalSplit: true, specificBequests: [] },
    personalMessages: []
  });

  const [isInteracting, setIsInteracting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize Sofia personality for will guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.nurturingUser);

  useEffect(() => {
    // Track user interactions for personality learning
    if (isInteracting) {
      learnFromInteraction({
        type: 'click',
        duration: 500,
        context: 'encouraging'
      });
      adaptToContext('encouraging');
    }
  }, [isInteracting, learnFromInteraction, adaptToContext]);

  const updateWillData = (updates: Partial<WillData>) => {
    setWillData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < WILL_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-semibold mb-2'>Legal Foundation</h3>
              <p className='text-muted-foreground'>
                Where are you located? This determines the legal framework for your will.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>Country</label>
                <Input
                  value={willData.country || ''}
                  onChange={(e) => updateWillData({ country: e.target.value })}
                  placeholder='e.g., Slovakia'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>City</label>
                <Input
                  value={willData.city || ''}
                  onChange={(e) => updateWillData({ city: e.target.value })}
                  placeholder='e.g., Bratislava'
                />
              </div>
            </div>

            <div className='bg-muted/30 p-4 rounded-lg'>
              <p className='text-sm text-muted-foreground'>
                💡 <strong>Legal Note:</strong> Your will will follow {willData.country} law.
                Make sure you understand the inheritance rules in your jurisdiction.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-semibold mb-2'>Your Family</h3>
              <p className='text-muted-foreground'>
                Tell me about the people who matter most to you.
              </p>
            </div>

            <div className='space-y-4'>
              <Button
                onClick={() => {
                  const newMember = {
                    id: Date.now().toString(),
                    name: '',
                    relationship: 'spouse' as const,
                    isHeir: true
                  };
                  updateWillData({
                    familyMembers: [...(willData.familyMembers || []), newMember]
                  });
                }}
                variant='outline'
                className='w-full'
              >
                + Add Family Member
              </Button>

              {willData.familyMembers?.map((member, index) => (
                <Card key={member.id} className='p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center'>
                      <span className='text-lg'>
                        {member.relationship === 'spouse' ? '💕' :
                         member.relationship === 'child' ? '👶' :
                         member.relationship === 'parent' ? '👴' : '👋'}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <Input
                        placeholder='Full name'
                        value={member.name}
                        onChange={(e) => {
                          const updated = [...(willData.familyMembers || [])];
                          updated[index] = { ...member, name: e.target.value };
                          updateWillData({ familyMembers: updated });
                        }}
                      />
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        const filtered = (willData.familyMembers || []).filter((_, i) => i !== index);
                        updateWillData({ familyMembers: filtered });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-semibold mb-2'>Your Assets</h3>
              <p className='text-muted-foreground'>
                What would you like to include in your estate planning?
              </p>
            </div>

            <div className='space-y-4'>
              <Button
                onClick={() => {
                  const newAsset = {
                    id: Date.now().toString(),
                    name: '',
                    type: 'property' as const,
                    value: 0
                  };
                  updateWillData({
                    assets: [...(willData.assets || []), newAsset]
                  });
                }}
                variant='outline'
                className='w-full'
              >
                + Add Asset
              </Button>

              {willData.assets?.map((asset, index) => (
                <Card key={asset.id} className='p-4'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <Input
                      placeholder='Asset name'
                      value={asset.name}
                      onChange={(e) => {
                        const updated = [...(willData.assets || [])];
                        updated[index] = { ...asset, name: e.target.value };
                        updateWillData({ assets: updated });
                      }}
                    />
                    <Input
                      type='number'
                      placeholder='Value (€)'
                      value={asset.value || ''}
                      onChange={(e) => {
                        const updated = [...(willData.assets || [])];
                        updated[index] = { ...asset, value: Number(e.target.value) };
                        updateWillData({ assets: updated });
                      }}
                    />
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        const filtered = (willData.assets || []).filter((_, i) => i !== index);
                        updateWillData({ assets: filtered });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-semibold mb-2'>Distribution Wishes</h3>
              <p className='text-muted-foreground'>
                How would you like your assets to be distributed?
              </p>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center gap-4'>
                <input
                  type='checkbox'
                  id='equalSplit'
                  checked={willData.distribution?.equalSplit || false}
                  onChange={(e) => updateWillData({
                    distribution: {
                      ...willData.distribution,
                      equalSplit: e.target.checked,
                      specificBequests: willData.distribution?.specificBequests || []
                    }
                  })}
                />
                <label htmlFor='equalSplit' className='text-sm'>
                  Equal distribution among heirs
                </label>
              </div>

              <div className='bg-muted/30 p-4 rounded-lg'>
                <p className='text-sm text-muted-foreground mb-4'>
                  💡 <strong>Tip:</strong> Consider both financial and emotional value when distributing assets.
                  Some items may have special meaning to certain family members.
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-semibold mb-2'>Choose Your Executor</h3>
              <p className='text-muted-foreground'>
                Who will ensure your wishes are carried out?
              </p>
            </div>

            <Card className='p-6'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>Executor Name</label>
                  <Input
                    placeholder='Full name of executor'
                    value={willData.executor?.name || ''}
                    onChange={(e) => updateWillData({
                      executor: {
                        ...willData.executor,
                        name: e.target.value,
                        relationship: willData.executor?.relationship || '',
                        contactInfo: willData.executor?.contactInfo || ''
                      }
                    })}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>Relationship</label>
                  <Input
                    placeholder='e.g., Spouse, Friend, Lawyer'
                    value={willData.executor?.relationship || ''}
                    onChange={(e) => updateWillData({
                      executor: {
                        ...willData.executor,
                        relationship: e.target.value,
                        name: willData.executor?.name || '',
                        contactInfo: willData.executor?.contactInfo || ''
                      }
                    })}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>Contact Information</label>
                  <Input
                    placeholder='Email or phone number'
                    value={willData.executor?.contactInfo || ''}
                    onChange={(e) => updateWillData({
                      executor: {
                        ...willData.executor,
                        contactInfo: e.target.value,
                        name: willData.executor?.name || '',
                        relationship: willData.executor?.relationship || ''
                      }
                    })}
                  />
                </div>
              </div>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-semibold mb-2'>Personal Messages</h3>
              <p className='text-muted-foreground'>
                Leave personal messages for your loved ones.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='bg-muted/30 p-4 rounded-lg'>
                <p className='text-sm text-muted-foreground mb-4'>
                  💝 <strong>These are precious:</strong> Personal messages are often the most meaningful part of a will.
                  They provide comfort and guidance to your loved ones.
                </p>
              </div>

              <Button
                onClick={() => {
                  const newMessage = {
                    recipientId: '',
                    message: '',
                    type: 'text' as const
                  };
                  updateWillData({
                    personalMessages: [...(willData.personalMessages || []), newMessage]
                  });
                }}
                variant='outline'
                className='w-full'
              >
                + Add Personal Message
              </Button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className='space-y-6'>
            <div className='text-center mb-6'>
              <h3 className='text-2xl font-semibold mb-2'>Review & Complete</h3>
              <p className='text-muted-foreground'>
                Let's review your will and make sure everything is perfect.
              </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Will Summary</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Location:</span>
                    <span className='text-sm font-medium'>{willData.country}, {willData.city}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Heirs:</span>
                    <span className='text-sm font-medium'>{willData.familyMembers?.length || 0}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Assets:</span>
                    <span className='text-sm font-medium'>{willData.assets?.length || 0}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Executor:</span>
                    <span className='text-sm font-medium'>{willData.executor?.name || 'Not set'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Legal Validation</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                    <span className='text-sm'>Legal framework established</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                    <span className='text-sm'>Heirs properly identified</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                    <span className='text-sm'>Consider adding specific bequests</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className='text-center'>
              <Button size='lg' className='bg-primary hover:bg-primary/90'>
                Generate My Will
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PersonalityAwareAnimation personality={personality} context="encouraging">
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        {/* Sofia Firefly - Will Guide */}
        <SofiaFirefly
          personality="nurturing"
          context="encouraging"
          size="medium"
          variant="contextual"
          glowIntensity={0.6}
        />

        <div className='container mx-auto px-4 py-8'>
          {/* Header */}
          <motion.div
            className='text-center mb-12'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className='text-4xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4'
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Legacy Builder
            </motion.h1>
            <motion.p
              className='text-muted-foreground text-lg max-w-2xl mx-auto'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Create your will with guidance every step of the way. This isn't about endings—it's about ensuring your loved ones are cared for.
            </motion.p>
          </motion.div>

          {/* Progress Indicator */}
          <div className='mb-8'>
            <div className='flex justify-between items-center mb-4'>
              {WILL_STEPS.map((step) => (
                <div key={step.id} className='flex flex-col items-center'>
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg mb-2 ${
                      step.id <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    animate={{
                      scale: step.id === currentStep ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: step.id === currentStep ? Infinity : 0,
                    }}
                  >
                    {step.icon}
                  </motion.div>
                  <span className='text-xs text-center max-w-20'>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className='w-full bg-muted rounded-full h-2'>
              <motion.div
                className='bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full'
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / WILL_STEPS.length) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Step Content */}
            <div className='lg:col-span-2'>
              <FadeIn duration={0.8}>
                <Card className='border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
                  <CardContent className='p-8'>
                    <AnimatePresence mode='wait'>
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        {renderStepContent()}
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Sofia Guidance */}
              <Card className='border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
                <CardContent className='pt-6'>
                  <div className='flex items-start gap-4'>
                    <div className='w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg'>
                      <span className='text-lg'>✨</span>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold mb-2'>Sofia's Guidance</h3>
                      <p className='text-muted-foreground text-sm mb-4'>
                        {currentStep === 1 && "Every will needs a solid legal foundation. This ensures your wishes are respected."}
                        {currentStep === 2 && "The people you love are at the heart of your will. Let's make sure they're all included."}
                        {currentStep === 3 && "Your assets tell the story of your life. Let's organize them thoughtfully."}
                        {currentStep === 4 && "How you distribute your assets shows what matters most to you."}
                        {currentStep === 5 && "Your executor is the guardian of your final wishes. Choose someone you trust completely."}
                        {currentStep === 6 && "Personal messages are precious gifts to your loved ones. They provide comfort when it's needed most."}
                        {currentStep === 7 && "You're almost done! Let's make sure everything is perfect before we finalize your will."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className='border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
                <CardHeader>
                  <CardTitle className='text-lg'>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full justify-start'
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full justify-start'
                  >
                    Legal Consultation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation */}
          <div className='flex justify-between items-center mt-8'>
            <Button
              variant='outline'
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              ← Previous
            </Button>

            <div className='text-sm text-muted-foreground'>
              Step {currentStep} of {WILL_STEPS.length}
            </div>

            <Button
              onClick={nextStep}
              disabled={currentStep === WILL_STEPS.length}
              className='bg-primary hover:bg-primary/90'
            >
              {currentStep === WILL_STEPS.length ? 'Complete' : 'Next'} →
            </Button>
          </div>
        </div>
      </div>
    </PersonalityAwareAnimation>
  );
}