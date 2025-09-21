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

interface Guardian {
  id: string;
  name: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'friend' | 'professional';
  role: 'primary' | 'secondary' | 'emergency' | 'financial' | 'medical' | 'digital';
  status: 'active' | 'pending' | 'inactive';
  trustLevel: number; // 0-100
  accessLevel: 'full' | 'limited' | 'emergency-only';
  notificationPreferences: string[];
  lastContact?: Date;
  specialInstructions?: string;
}

export default function Guardians() {
  const [guardians, setGuardians] = useState<Guardian[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      relationship: 'spouse',
      role: 'primary',
      status: 'active',
      trustLevel: 95,
      accessLevel: 'full',
      notificationPreferences: ['email', 'sms'],
      lastContact: new Date('2024-09-15'),
      specialInstructions: 'Primary emergency contact and decision maker'
    },
    {
      id: '2',
      name: 'Michael Chen',
      relationship: 'friend',
      role: 'emergency',
      status: 'pending',
      trustLevel: 78,
      accessLevel: 'emergency-only',
      notificationPreferences: ['email'],
      specialInstructions: 'Emergency contact for critical situations'
    },
    {
      id: '3',
      name: 'Dr. Amanda Rodriguez',
      relationship: 'professional',
      role: 'medical',
      status: 'active',
      trustLevel: 88,
      accessLevel: 'limited',
      notificationPreferences: ['email', 'phone'],
      lastContact: new Date('2024-09-10'),
      specialInstructions: 'Medical decisions and healthcare coordination'
    }
  ]);

  const [showAddGuardian, setShowAddGuardian] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Initialize Sofia personality for trust-building guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.trustBuilder);

  useEffect(() => {
    // Track user interactions for personality learning
    if (isInteracting) {
      learnFromInteraction({
        type: 'click',
        duration: 500,
        context: 'trust'
      });
      adaptToContext('trust');
    }
  }, [isInteracting, learnFromInteraction, adaptToContext]);

  const getRoleIcon = (role: Guardian['role']) => {
    switch (role) {
      case 'primary': return '👑';
      case 'emergency': return '🚨';
      case 'financial': return '💰';
      case 'medical': return '🏥';
      case 'digital': return '💻';
      default: return '🛡️';
    }
  };

  const getRelationshipIcon = (relationship: Guardian['relationship']) => {
    switch (relationship) {
      case 'spouse': return '💕';
      case 'child': return '👶';
      case 'parent': return '👨‍👩‍👧';
      case 'sibling': return '👫';
      case 'friend': return '👋';
      case 'professional': return '👔';
      default: return '🤝';
    }
  };

  const getStatusColor = (status: Guardian['status']) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'inactive': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <PersonalityAwareAnimation personality={personality} context="trust">
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        {/* Sofia Firefly - Trust Building Guide */}
        <SofiaFirefly
          personality="empathetic"
          context="guiding"
          size="medium"
          variant="contextual"
          glowIntensity={0.6}
        />

        <div className='container mx-auto px-4 py-8'>
          {/* Header Section */}
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
              Circle of Trust
            </motion.h1>
            <motion.p
              className='text-muted-foreground text-lg max-w-2xl mx-auto'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Your trusted guardians who will protect what matters most when you need them. Build relationships based on trust and clear communication.
            </motion.p>
          </motion.div>

          {/* Trust Building Tips */}
          <FadeIn duration={0.8}>
            <Card className='mb-8 border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
              <CardContent className='pt-6'>
                <div className='flex items-start gap-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg'>
                    <span className='text-lg'>✨</span>
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold mb-2'>Building Trust Takes Time</h3>
                    <p className='text-muted-foreground mb-4'>
                      Trust levels grow through regular communication and shared experiences. Consider scheduling monthly check-ins with your guardians.
                    </p>
                    <div className='flex gap-2'>
                      <Button size='sm'>Schedule Check-in</Button>
                      <Button variant='outline' size='sm'>Trust Building Guide</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Add Guardian Button */}
          <div className='mb-8 text-center'>
            <Button
              onClick={() => setShowAddGuardian(true)}
              className='bg-primary hover:bg-primary/90'
              size='lg'
            >
              <span className='mr-2'>+</span>
              Add Guardian
            </Button>
          </div>

          {/* Guardians Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <AnimatePresence>
              {guardians.map((guardian, index) => (
                <PersonalityHoverEffect key={guardian.id} personality={personality}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className='cursor-pointer border-primary/20 hover:border-primary/40 transition-all duration-300 h-full'>
                      <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center'>
                              <span className='text-xl'>{getRelationshipIcon(guardian.relationship)}</span>
                            </div>
                            <div>
                              <CardTitle className='text-lg'>{guardian.name}</CardTitle>
                              <div className='flex items-center gap-2 mt-1'>
                                <span className='text-sm text-muted-foreground capitalize'>
                                  {guardian.relationship}
                                </span>
                                <span className={`text-sm ${getStatusColor(guardian.status)}`}>
                                  ● {guardian.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='text-2xl'>{getRoleIcon(guardian.role)}</div>
                        </div>
                      </CardHeader>
                      <CardContent className='pt-0'>
                        <div className='space-y-4'>
                          {/* Trust Level */}
                          <div>
                            <div className='flex justify-between items-center mb-2'>
                              <span className='text-sm text-muted-foreground'>Trust Level</span>
                              <span className='text-sm font-medium text-primary'>
                                {guardian.trustLevel}%
                              </span>
                            </div>
                            <div className='w-full bg-muted rounded-full h-2'>
                              <motion.div
                                className='bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full'
                                initial={{ width: 0 }}
                                animate={{ width: `${guardian.trustLevel}%` }}
                                transition={{ duration: 1.5, delay: index * 0.2 }}
                              />
                            </div>
                          </div>

                          {/* Role & Access */}
                          <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-muted-foreground'>Role:</span>
                              <span className='text-sm font-medium capitalize'>{guardian.role}</span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-muted-foreground'>Access:</span>
                              <span className='text-sm font-medium capitalize'>{guardian.accessLevel}</span>
                            </div>
                          </div>

                          {/* Last Contact */}
                          {guardian.lastContact && (
                            <div className='text-xs text-muted-foreground'>
                              Last contact: {guardian.lastContact.toLocaleDateString()}
                            </div>
                          )}

                          {/* Special Instructions */}
                          {guardian.specialInstructions && (
                            <div className='text-xs text-muted-foreground bg-muted/50 p-2 rounded'>
                              {guardian.specialInstructions}
                            </div>
                          )}

                          {/* Actions */}
                          <div className='flex gap-2 pt-2'>
                            <Button variant='outline' size='sm' className='flex-1'>
                              Edit
                            </Button>
                            <Button variant='ghost' size='sm' className='flex-1'>
                              Contact
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </PersonalityHoverEffect>
              ))}
            </AnimatePresence>
          </div>

          {/* Emergency Activation Section */}
          <FadeIn duration={0.8} delay={0.4}>
            <Card className='mt-8 border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <span>🚨</span>
                  Emergency Activation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <p className='text-muted-foreground'>
                    In case of emergency, your guardians will be notified and granted appropriate access levels based on their roles.
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='text-center p-4 bg-muted/30 rounded-lg'>
                      <div className='text-2xl mb-2'>⚡</div>
                      <h4 className='font-semibold mb-1'>Immediate</h4>
                      <p className='text-sm text-muted-foreground'>Critical medical decisions</p>
                    </div>
                    <div className='text-center p-4 bg-muted/30 rounded-lg'>
                      <div className='text-2xl mb-2'>📞</div>
                      <h4 className='font-semibold mb-1'>24 Hours</h4>
                      <p className='text-sm text-muted-foreground'>Financial and legal access</p>
                    </div>
                    <div className='text-center p-4 bg-muted/30 rounded-lg'>
                      <div className='text-2xl mb-2'>🏠</div>
                      <h4 className='font-semibold mb-1'>7 Days</h4>
                      <p className='text-sm text-muted-foreground'>Property and full access</p>
                    </div>
                  </div>
                  <div className='text-center pt-4'>
                    <Button variant='outline' className='border-primary/20'>
                      Test Emergency System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Sofia AI Trust Building Guidance */}
          <FadeIn duration={0.8} delay={0.6}>
            <Card className='mt-8 border-primary/20 shadow-xl bg-background/95 backdrop-blur'>
              <CardContent className='pt-6'>
                <div className='flex items-start gap-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg'>
                    <span className='text-lg'>✨</span>
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold mb-2'>Sofia's Trust Building Tips</h3>
                    <p className='text-muted-foreground mb-4'>
                      Trust grows through consistent communication. Consider sending a monthly "I'm okay" message to your guardians.
                      This builds confidence and ensures they're ready when needed.
                    </p>
                    <div className='flex gap-2'>
                      <Button size='sm'>Send Check-in</Button>
                      <Button variant='outline' size='sm'>Trust Guide</Button>
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