/**
 * Family Invitation Flow Component
 * Multi-step flow for inviting family members with emotional messaging
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Mail,
  MessageSquare,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Typography } from '../Typography';
import { Badge } from '../Badge';
import { Alert } from '../Alert';
import { TextArea } from '../TextArea';
import { Dialog, DialogContent } from '../Dialog';
import { cn } from '@schwalbe/shared';
import {
  type FamilyInvitation,
  type FamilyRole,
  RELATIONSHIP_LABELS,
  type RelationshipType,
} from '@schwalbe/logic';
import { useTranslation } from 'react-i18next';

interface FamilyInvitationFlowProps {
  className?: string;
  onCancel: () => void;
  onComplete: (invitation: FamilyInvitation) => void;
  userId: string;
}

type InvitationStep =
  | 'complete'
  | 'details'
  | 'message'
  | 'relationship'
  | 'review'
  | 'sending';

interface InvitationData {
  email: string;
  message: string;
  name: string;
  relationship: RelationshipType;
  role: FamilyRole;
}

export function FamilyInvitationFlow({
  userId,
  onComplete,
  onCancel,
  className,
}: FamilyInvitationFlowProps) {
  const [currentStep, setCurrentStep] =
    useState<InvitationStep>('relationship');
  const [invitationData, setInvitationData] = useState<Partial<InvitationData>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const { t } = useTranslation('ui/family-invitation-flow');

  const steps: { description: string; key: InvitationStep; title: string }[] = [
    {
      key: 'relationship',
      title: t('steps.relationship.title'),
      description: t('steps.relationship.description'),
    },
    {
      key: 'details',
      title: t('steps.details.title'),
      description: t('steps.details.description'),
    },
    {
      key: 'message',
      title: t('steps.message.title'),
      description: t('steps.message.description'),
    },
    {
      key: 'review',
      title: t('steps.review.title'),
      description: t('steps.review.description'),
    },
    {
      key: 'sending',
      title: t('steps.sending.title'),
      description: t('steps.sending.description'),
    },
    { key: 'complete', title: t('steps.complete.title'), description: t('steps.complete.description') },
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === currentStep);
  const currentStepInfo = steps[getCurrentStepIndex()];

  const handleNext = () => {
    const stepIndex = getCurrentStepIndex();
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].key);
    }
  };

  const handleBack = () => {
    const stepIndex = getCurrentStepIndex();
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key);
    }
  };

  const handleSendInvitation = async () => {
    if (!isFormValid()) return;

    setCurrentStep('sending');
    setIsLoading(true);
    setError(null);

    try {
      // Mock invitation send - in real app this would call the family service
      const invitation: FamilyInvitation = {
        id: crypto.randomUUID(),
        senderId: userId,
        familyMemberId: crypto.randomUUID(),
        email: invitationData.email!,
        token: crypto.randomUUID(),
        status: 'pending',
        message: invitationData.message!,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        acceptedAt: null,
        declinedAt: null,
        createdAt: new Date().toISOString(),
        name: invitationData.name!,
        role: invitationData.role!,
        relationship: invitationData.relationship!,
        invitedAt: new Date(),
        invitedBy: userId,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep('complete');
      onComplete(invitation);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t('errors.sendFailed')
      );
      setCurrentStep('review');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = (): boolean => {
    return !!(
      invitationData.email &&
      invitationData.name &&
      invitationData.role &&
      invitationData.relationship &&
      invitationData.message
    );
  };

  const getRoleRecommendation = (
    relationship: RelationshipType
  ): FamilyRole => {
    const recommendations: Record<string, FamilyRole> = {
      spouse: 'collaborator',
      child: 'viewer',
      parent: 'viewer',
      sibling: 'viewer',
      grandparent: 'emergency_contact',
      grandchild: 'viewer',
      aunt_uncle: 'viewer',
      cousin: 'viewer',
      friend: 'emergency_contact',
      professional: 'viewer',
      other: 'viewer',
      partner: 'collaborator',
    };
    return recommendations[relationship];
  };

  const getEmotionalMessage = (relationship: RelationshipType): string => {
    const messages: Partial<Record<RelationshipType, string>> = {
      spouse:
        "You mean the world to me, and I want to make sure we're both prepared for whatever life brings. Having you as part of our family's protection plan gives me such peace of mind. 💕",
      child:
        "Hey sweetheart! 👋 As your parent, one of my greatest joys is knowing you'll always be taken care of. I'd love for you to be part of our family's legacy protection plan - it's about keeping our family connected and secure, no matter what.",
      parent:
        "Hi Mom/Dad! 🌟 Your wisdom has always guided our family, and I'd love to have you involved in our family's protection planning. This isn't about anything scary - it's about keeping our family organized and prepared, just like you taught me.",
      sibling:
        "Hey! 👫 Remember how we always promised to look out for each other? I'm setting up a family protection plan and I'd really love to have you included. It's about keeping our family bond strong and making sure we're all prepared.",
      grandparent:
        "Hi Grandma/Grandpa! 🌟 Your wisdom has always guided our family, and I'd love to have you involved in our family's protection planning. This is about keeping our family organized and prepared.",
      grandchild:
        'Hey sweetheart! 👋 I want to make sure you have access to important family information when you need it. This is about keeping our family connected and secure.',
      aunt_uncle:
        "Hey! 👫 I'm setting up a family protection plan and I'd really love to have you included. It's about keeping our family bond strong and making sure we're all prepared.",
      cousin:
        "Hey! 👫 I'm setting up a family protection plan and I'd really love to have you included. It's about keeping our family bond strong and making sure we're all prepared.",
      professional:
        "I value your professional guidance and would appreciate having you connected to our family's system for easier collaboration on our planning.",
      friend:
        "You've always been like family to us. 🤗 I'd love to include you in our emergency contacts because I trust you completely and know you'd be there for us if we ever needed help.",
      other:
        "I'd love to invite you to be part of our family's protection plan. Your connection to our family is important, and this helps us all stay organized and prepared together.",
    };
    return (
      messages[relationship] ||
      messages.other ||
      "I'd love to invite you to be part of our family's protection plan."
    );
  };

  const renderProgressBar = () => {
    const progress = ((getCurrentStepIndex() + 1) / steps.length) * 100;

    return (
      <div className='mb-8'>
        <div className='flex justify-between text-sm text-muted-foreground mb-2'>
          <span>{currentStepInfo.title}</span>
          <span>
            Step {getCurrentStepIndex() + 1} of {steps.length}
          </span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <motion.div
            className='bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full'
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className='text-sm text-muted-foreground mt-2'>
          {currentStepInfo.description}
        </p>
      </div>
    );
  };

  const renderRelationshipStep = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Heart className='h-10 w-10 text-blue-600' />
        </div>
        <Typography variant='h3' className='mb-2'>Who are you inviting?</Typography>
        <Typography variant='body' className='text-muted-foreground'>
          Building your family's protection circle starts with the people who
          matter most to you.
        </Typography>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
        {Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => (
          <Button
            key={key}
            variant={
              invitationData.relationship === key ? 'default' : 'outline'
            }
            className='h-auto p-4 flex flex-col items-center gap-2'
            onClick={() => {
              const relationship = key as RelationshipType;
              setInvitationData(prev => ({
                ...prev,
                relationship,
                role: getRoleRecommendation(relationship),
              }));
            }}
          >
            <span className='font-medium'>{label}</span>
            {invitationData.relationship === key && (
              <Badge variant='secondary' className='text-xs'>
                {getRoleRecommendation(key as RelationshipType)}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {invitationData.relationship && (
        <Alert className='border-green-200 bg-green-50'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <div>
            <Typography variant='body' className='font-semibold text-green-800'>Great Choice!</Typography>
            <Typography variant='small' className='text-green-700'>
              We'll give them{' '}
              <strong>
                {getRoleRecommendation(invitationData.relationship)}
              </strong>{' '}
              access, which is perfect for their relationship to you. You can
              adjust this later if needed.
            </Typography>
          </div>
        </Alert>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <UserPlus className='h-10 w-10 text-green-600' />
        </div>
        <Typography variant='h3' className='mb-2'>Contact Information</Typography>
        <Typography variant='body' className='text-muted-foreground'>
          How can we reach your{' '}
          {RELATIONSHIP_LABELS[
            invitationData.relationship || 'other'
          ].toLowerCase()}
          ?
        </Typography>
      </div>

      <div className='space-y-4'>
        <div>
          <Typography variant='small' className='font-medium mb-1'>Full Name</Typography>
          <Input
            value={invitationData.name || ''}
            onChange={e =>
              setInvitationData(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder='Enter their full name'
          />
        </div>

        <div>
          <Typography variant='small' className='font-medium mb-1'>Email Address</Typography>
          <Input
            type='email'
            value={invitationData.email || ''}
            onChange={e =>
              setInvitationData(prev => ({ ...prev, email: e.target.value }))
            }
            placeholder='their.email@example.com'
          />
        </div>

        <div>
          <Typography variant='small' className='font-medium mb-1'>Access Level</Typography>
          <select
            value={invitationData.role || ''}
            onChange={e =>
              setInvitationData(prev => ({
                ...prev,
                role: e.target.value as FamilyRole,
              }))
            }
            className='w-full p-2 border border-gray-300 rounded-md'
          >
            <option value=''>Choose access level</option>
            <option value='collaborator'>
              Collaborator - Can view and edit most documents
            </option>
            <option value='viewer'>
              Viewer - Can view important documents
            </option>
            <option value='emergency_contact'>
              Emergency Contact - Access during emergencies only
            </option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderMessageStep = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <MessageSquare className='h-10 w-10 text-purple-600' />
        </div>
        <Typography variant='h3' className='mb-2'>Add a Personal Touch</Typography>
        <Typography variant='body' className='text-muted-foreground'>
          A heartfelt message helps them understand why this matters to your
          family.
        </Typography>
      </div>

      <div className='space-y-4'>
        <div>
          <Typography variant='small' className='font-medium mb-1'>Personal Message</Typography>
          <TextArea
            value={invitationData.message || ''}
            onChange={e =>
              setInvitationData(prev => ({ ...prev, message: e.target.value }))
            }
            placeholder='Write a personal message...'
            className='min-h-[120px]'
          />
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <Typography variant='body' className='font-medium text-blue-900 mb-2 flex items-center gap-2'>
            <Sparkles className='h-4 w-4' />
            Suggested Message
          </Typography>
          <Typography variant='small' className='text-blue-800 leading-relaxed'>
            {getEmotionalMessage(invitationData.relationship || 'other')}
          </Typography>
          <Button
            variant='outline'
            size='sm'
            className='mt-3'
            onClick={() =>
              setInvitationData(prev => ({
                ...prev,
                message: getEmotionalMessage(
                  invitationData.relationship || 'other'
                ),
              }))
            }
          >
            Use This Message
          </Button>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Shield className='h-10 w-10 text-yellow-600' />
        </div>
        <Typography variant='h3' className='mb-2'>Ready to Send</Typography>
        <Typography variant='body' className='text-muted-foreground'>
          Review the invitation details before sending.
        </Typography>
      </div>

      <Card className='border-2 border-blue-200'>
        <CardHeader>
          <CardTitle className='text-lg'>Invitation Summary</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <Typography variant='small' className='text-muted-foreground'>Name</Typography>
              <Typography variant='body' className='font-medium'>{invitationData.name}</Typography>
            </div>
            <div>
              <Typography variant='small' className='text-muted-foreground'>Email</Typography>
              <Typography variant='body' className='font-medium'>{invitationData.email}</Typography>
            </div>
            <div>
              <Typography variant='small' className='text-muted-foreground'>Relationship</Typography>
              <Typography variant='body' className='font-medium'>
                {RELATIONSHIP_LABELS[invitationData.relationship || 'other']}
              </Typography>
            </div>
            <div>
              <Typography variant='small' className='text-muted-foreground'>Access Level</Typography>
              <Badge variant='secondary'>{invitationData.role}</Badge>
            </div>
          </div>

          <div>
            <Typography variant='small' className='text-muted-foreground'>Personal Message</Typography>
            <div className='mt-1 p-3 bg-gray-50 rounded-md text-sm'>
              {invitationData.message}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <div>
            <Typography variant='body' className='font-semibold'>Error</Typography>
            <Typography variant='small'>{error}</Typography>
          </div>
        </Alert>
      )}
    </div>
  );

  const renderSendingStep = () => (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Mail className='h-10 w-10 text-blue-600' />
        </motion.div>
      </div>
      <div>
        <Typography variant='h3' className='mb-2'>Sending Invitation...</Typography>
        <Typography variant='body' className='text-muted-foreground'>
          Preparing a beautiful invitation for {invitationData.name}
        </Typography>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
        <CheckCircle className='h-10 w-10 text-green-600' />
      </div>
      <div>
        <Typography variant='h3' className='mb-2'>Invitation Sent! 🎉</Typography>
        <Typography variant='body' className='text-muted-foreground'>
          {invitationData.name} will receive a beautiful invitation email with
          your personal message.
        </Typography>
      </div>

      <Alert className='border-green-200 bg-green-50'>
        <CheckCircle className='h-4 w-4 text-green-600' />
        <div>
          <Typography variant='body' className='font-semibold text-green-800'>What happens next?</Typography>
          <Typography variant='small' className='text-green-700'>
            They'll receive an email with a secure link to join your family
            protection plan. You'll be notified when they accept the invitation.
          </Typography>
        </div>
      </Alert>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className={cn('max-w-2xl', className)}>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-3'>
              <Users className='h-6 w-6 text-blue-600' />
              Invite Family Member
            </CardTitle>
            <Button variant='ghost' size='sm' onClick={onCancel}>
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {renderProgressBar()}

          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 'relationship' && renderRelationshipStep()}
              {currentStep === 'details' && renderDetailsStep()}
              {currentStep === 'message' && renderMessageStep()}
              {currentStep === 'review' && renderReviewStep()}
              {currentStep === 'sending' && renderSendingStep()}
              {currentStep === 'complete' && renderCompleteStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {!['sending', 'complete'].includes(currentStep) && (
            <div className='flex justify-between mt-8'>
              <Button
                variant='outline'
                onClick={handleBack}
                disabled={getCurrentStepIndex() === 0}
              >
                <ChevronLeft className='h-4 w-4 mr-2' />
                Back
              </Button>

              {currentStep === 'review' ? (
                <Button
                  onClick={handleSendInvitation}
                  disabled={!isFormValid() || isLoading}
                >
                  <Mail className='h-4 w-4 mr-2' />
                  Send Invitation
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 'relationship' &&
                      !invitationData.relationship) ||
                    (currentStep === 'details' &&
                      (!invitationData.name || !invitationData.email)) ||
                    (currentStep === 'message' && !invitationData.message)
                  }
                >
                  Continue
                  <ChevronRight className='h-4 w-4 ml-2' />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}