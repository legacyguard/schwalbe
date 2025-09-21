import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import FamilyTreeVisualization from '@/components/family/FamilyTreeVisualization';
import GuardianManagement from '@/components/family/GuardianManagement';

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [protectionScore, setProtectionScore] = useState(0);
  const [showFamilyTree, setShowFamilyTree] = useState(true);
  const [showGuardianManagement, setShowGuardianManagement] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'family' | 'guardians' | 'documents'>('family');
  const [isInteracting, setIsInteracting] = useState(false);

  // Initialize Sofia personality for dashboard guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.confidentUser);

  useEffect(() => {
    // Animate protection score on load
    const timer = setTimeout(() => {
      setProtectionScore(73); // Example score
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Track user interactions for personality learning
  useEffect(() => {
    if (isInteracting) {
      learnFromInteraction({
        type: 'click',
        duration: 500,
        context: 'guiding'
      });
      adaptToContext('guiding');
    }
  }, [isInteracting, learnFromInteraction, adaptToContext]);

  return (
    <PersonalityAwareAnimation personality={personality} context="guiding">
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        {/* Sofia Firefly - Dashboard Guide */}
        <SofiaFirefly
          personality="confident"
          context="guiding"
          size="medium"
          variant="contextual"
          glowIntensity={0.6}
        />

        <div className='container mx-auto px-4 py-8'>
          {/* Header Section */}
          <motion.div
            className='text-center mb-8'
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
              🛡️ Rodinný Štít
            </motion.h1>
            <motion.p
              className='text-muted-foreground text-lg max-w-2xl mx-auto'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Your Family Protection Shield - Everything you need to safeguard your loved ones' future.
            </motion.p>
          </motion.div>

          {/* Navigation Tabs */}
          <LiquidMotion.ScaleIn delay={0.5}>
            <Card className='mb-8 border-primary/20'>
              <CardContent className='p-4'>
                <div className='flex flex-wrap gap-2'>
                  {[
                    { id: 'family', label: '👨‍👩‍👧‍👦 Family Tree', icon: '👨‍👩‍👧‍👦' },
                    { id: 'guardians', label: '🛡️ Guardians', icon: '🛡️' },
                    { id: 'documents', label: '📄 Documents', icon: '📄' },
                    { id: 'overview', label: '📊 Overview', icon: '📊' }
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeSection === tab.id ? 'primary' : 'outline'}
                      onClick={() => {
                        setActiveSection(tab.id as any);
                        setIsInteracting(true);
                      }}
                      className={`transition-all duration-300 ${
                        activeSection === tab.id
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'hover:bg-primary/10'
                      }`}
                    >
                      <span className='mr-2'>{tab.icon}</span>
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </LiquidMotion.ScaleIn>

          {/* Protection Score Card */}
          <FadeIn duration={0.8}>
            <Card className='mb-8 border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Protection Score</span>
                  <motion.div
                    className='text-2xl font-bold text-primary'
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {protectionScore}%
                  </motion.div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='w-full bg-muted rounded-full h-3'>
                    <motion.div
                      className='bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full'
                      initial={{ width: 0 }}
                      animate={{ width: `${protectionScore}%` }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                    />
                  </div>
                  <div className='flex justify-between text-sm text-muted-foreground'>
                    <span>Basic Protection</span>
                    <span>Complete Coverage</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Dynamic Content Sections */}
          <AnimatePresence mode="wait">
            {activeSection === 'family' && (
              <motion.div
                key="family"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <FamilyTreeVisualization
                  onAddMember={() => {
                    console.log('Add family member');
                    setIsInteracting(true);
                  }}
                  onEditMember={(id) => {
                    console.log('Edit member:', id);
                    setIsInteracting(true);
                  }}
                  onSetEmergencyContact={(id) => {
                    console.log('Set emergency contact:', id);
                    setIsInteracting(true);
                  }}
                  onSetGuardian={(id) => {
                    console.log('Set guardian:', id);
                    setIsInteracting(true);
                  }}
                />
              </motion.div>
            )}

            {activeSection === 'guardians' && (
              <motion.div
                key="guardians"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <GuardianManagement
                  onAddGuardian={(guardian) => {
                    console.log('Add guardian:', guardian);
                    setIsInteracting(true);
                  }}
                  onUpdateGuardian={(id, updates) => {
                    console.log('Update guardian:', id, updates);
                    setIsInteracting(true);
                  }}
                  onRemoveGuardian={(id) => {
                    console.log('Remove guardian:', id);
                    setIsInteracting(true);
                  }}
                  onSendInvitation={(id) => {
                    console.log('Send invitation:', id);
                    setIsInteracting(true);
                  }}
                  onActivateEmergency={(id) => {
                    console.log('Activate emergency:', id);
                    setIsInteracting(true);
                  }}
                />
              </motion.div>
            )}

            {activeSection === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className='border-primary/20'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      📄 Life Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>
                      <div className='text-4xl mb-4'>📄</div>
                      <h3 className='text-lg font-medium mb-2'>Document Management</h3>
                      <p>Your organized digital archive with AI-powered categorization.</p>
                      <p className='text-sm mt-2'>This section is coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {/* Documents Section */}
                  <PersonalityHoverEffect personality={personality}>
                    <Card
                      className='cursor-pointer border-primary/20 hover:border-primary/40 transition-all duration-300'
                      onClick={() => {
                        setActiveSection('documents');
                        setIsInteracting(true);
                      }}
                    >
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <span>📄</span>
                          Life Documents
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-muted-foreground mb-4'>
                          Your organized digital archive with AI-powered categorization.
                        </p>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-primary'>0 documents</span>
                          <Button variant='outline' size='sm'>
                            Manage
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </PersonalityHoverEffect>

                  {/* Guardians Section */}
                  <PersonalityHoverEffect personality={personality}>
                    <Card
                      className='cursor-pointer border-primary/20 hover:border-primary/40 transition-all duration-300'
                      onClick={() => {
                        setActiveSection('guardians');
                        setIsInteracting(true);
                      }}
                    >
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <span>🛡️</span>
                          Circle of Trust
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-muted-foreground mb-4'>
                          Your trusted guardians and emergency contacts.
                        </p>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-primary'>0 guardians</span>
                          <Button variant='outline' size='sm'>
                            Manage
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </PersonalityHoverEffect>

            {/* Will Section */}
            <PersonalityHoverEffect personality={personality}>
              <Card
                className='cursor-pointer border-primary/20 hover:border-primary/40 transition-all duration-300'
                onClick={() => setIsInteracting(true)}
              >
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <span>📋</span>
                    Legacy Planning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground mb-4'>
                    Your will and estate planning documents.
                  </p>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-primary'>In Progress</span>
                    <Button variant='outline' size='sm'>
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </PersonalityHoverEffect>
          </div>

          {/* Family Tree Section */}
          <FadeIn duration={0.8} delay={0.4}>
            <Card className='border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Family Tree</span>
                  <Button
                    variant='outline'
                    onClick={() => setShowFamilyTree(!showFamilyTree)}
                  >
                    {showFamilyTree ? 'Hide' : 'Show'} Tree
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {showFamilyTree && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5 }}
                      className='space-y-4'
                    >
                      {/* Family Tree Visualization */}
                      <div className='relative h-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-primary/30 overflow-hidden'>
                        {/* Family members as nodes */}
                        <motion.div
                          className='absolute w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full border-2 border-blue-300 flex items-center justify-center shadow-lg'
                          style={{ left: '20%', top: '30%' }}
                          whileHover={{ scale: 1.1 }}
                          animate={{
                            y: [0, -5, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <div className='text-white text-xs font-medium'>You</div>
                        </motion.div>

                        <motion.div
                          className='absolute w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full border-2 border-pink-300 flex items-center justify-center shadow-lg'
                          style={{ left: '60%', top: '20%' }}
                          whileHover={{ scale: 1.1 }}
                          animate={{
                            y: [0, -3, 0],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.5,
                          }}
                        >
                          <div className='text-white text-xs'>Partner</div>
                        </motion.div>

                        <motion.div
                          className='absolute w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-green-300 flex items-center justify-center shadow-lg'
                          style={{ left: '40%', top: '60%' }}
                          whileHover={{ scale: 1.1 }}
                          animate={{
                            y: [0, -4, 0],
                          }}
                          transition={{
                            duration: 2.8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 1,
                          }}
                        >
                          <div className='text-white text-xs'>Child</div>
                        </motion.div>

                        {/* Connection lines */}
                        <svg className='absolute inset-0 w-full h-full'>
                          <motion.path
                            d='M 80 50 Q 200 30, 320 40'
                            stroke='url(#family-gradient)'
                            strokeWidth='2'
                            fill='none'
                            strokeLinecap='round'
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ duration: 2, delay: 1 }}
                          />
                          <motion.path
                            d='M 80 50 Q 140 80, 200 120'
                            stroke='url(#family-gradient)'
                            strokeWidth='2'
                            fill='none'
                            strokeLinecap='round'
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ duration: 2, delay: 1.5 }}
                          />
                          <defs>
                            <linearGradient id='family-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                              <stop offset='0%' stopColor='#3b82f6' stopOpacity='0.3' />
                              <stop offset='50%' stopColor='#8b5cf6' stopOpacity='0.5' />
                              <stop offset='100%' stopColor='#10b981' stopOpacity='0.3' />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </FadeIn>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sofia AI Contextual Assistance */}
          <FadeIn duration={0.8} delay={0.6}>
            <Card className='mt-8 border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
              <CardContent className='pt-6'>
                <div className='flex items-start gap-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg'>
                    <span className='text-lg'>✨</span>
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold mb-2'>Sofia's Guidance</h3>
                    <p className='text-muted-foreground mb-4'>
                      Your protection score is at 73%. Consider adding your partner as a guardian to increase it to 85%.
                      Would you like me to help you set this up?
                    </p>
                    <div className='flex gap-2'>
                      <Button size='sm'>Yes, help me</Button>
                      <Button variant='outline' size='sm'>Later</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PersonalityAwareAnimation>
  );
}