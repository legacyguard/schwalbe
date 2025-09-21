
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  CheckCircle,
  Crown,
  Heart,
  Share2,
  Target,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FamilyMember } from '@/types/family';

interface ViralMilestone {
  completed: boolean;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  progress: number;
  reward: string;
  targetCount: number;
  title: string;
}

interface InvitationPrompt {
  message: string;
  suggestions: string[];
  title: string;
  trigger:
    | 'first_document'
    | 'milestone_reached'
    | 'protection_incomplete'
    | 'weekly_nudge';
  urgency: 'high' | 'low' | 'medium';
}

interface FamilyViralGrowthProps {
  currentMembers: FamilyMember[];
  documentsCount: number;
  onInviteFamily: () => void;
  protectionLevel: number;
  userId: string;
}

const viralMilestones: ViralMilestone[] = [
  {
    id: 'first_invite',
    title: 'Family Foundation',
    description: 'Invite your first family member',
    targetCount: 1,
    reward: '🎉 Milestone badge + Family calendar unlocked',
    icon: UserPlus,
    completed: false,
    progress: 0,
  },
  {
    id: 'core_family',
    title: 'Core Family Circle',
    description: 'Build your immediate family circle',
    targetCount: 3,
    reward: '🏆 Premium features trial + Emergency access setup',
    icon: Users,
    completed: false,
    progress: 0,
  },
  {
    id: 'extended_network',
    title: 'Extended Protection Network',
    description: 'Create a comprehensive support network',
    targetCount: 5,
    reward: '⭐ Family Hero badge + Advanced sharing tools',
    icon: Trophy,
    completed: false,
    progress: 0,
  },
  {
    id: 'legacy_champions',
    title: 'Legacy Champions',
    description: 'Build the ultimate family protection circle',
    targetCount: 8,
    reward: '👑 Premium plan upgrade + Professional review credits',
    icon: Crown,
    completed: false,
    progress: 0,
  },
];

const getInvitationPrompts = (t: any): Record<string, InvitationPrompt> => ({
  first_document: {
    trigger: 'first_document',
    title: 'Great start! Now protect your family too 💝',
    message:
      "You've just secured your first important document. Why not share this peace of mind with your loved ones?",
    suggestions: [
      t('suggestions.0'),
      t('suggestions.1'),
      t('suggestions.2'),
    ],
    urgency: 'medium',
  },
  protection_incomplete: {
    trigger: 'protection_incomplete',
    title: "Your family's protection could be stronger 🛡️",
    message:
      "Adding more family members creates multiple layers of security and ensures someone can always access what's needed.",
    suggestions: [
      "Emergency contacts who can act when you can't",
      'Family members who can help make important decisions',
      'Trusted advisors like your attorney or accountant',
    ],
    urgency: 'high',
  },
  milestone_reached: {
    trigger: 'milestone_reached',
    title: 'Amazing progress! Keep building momentum 🚀',
    message:
      'Your family circle is growing stronger. Each new member adds another layer of protection and support.',
    suggestions: [
      'Think about extended family who should be included',
      'Consider professional advisors who support your family',
      'Add emergency contacts for complete peace of mind',
    ],
    urgency: 'low',
  },
  weekly_nudge: {
    trigger: 'weekly_nudge',
    title: 'A gentle reminder from your family guardian 🦋',
    message:
      'Building your family circle is one of the most loving things you can do. Each invitation brings more security and peace of mind.',
    suggestions: [
      "Is there a family member who'd appreciate being included?",
      'Have you set up emergency contacts yet?',
      'Consider adding trusted friends or advisors',
    ],
    urgency: 'low',
  },
});

export function FamilyViralGrowth({
  userId: _userId,
  currentMembers,
  protectionLevel,
  documentsCount,
  onInviteFamily,
}: FamilyViralGrowthProps) {
  const { t } = useTranslation('components/family-viral-growth');
  const [showInvitePrompt, setShowInvitePrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<InvitationPrompt | null>(
    null
  );
  const [milestones, setMilestones] = useState(() => viralMilestones);
  const invitationPrompts = getInvitationPrompts(t);
  const [showMilestones, setShowMilestones] = useState(false);

  const updateMilestoneProgress = useCallback(() => {
    const memberCount = currentMembers.length;
    const updatedMilestones = milestones.map((milestone: ViralMilestone) => ({
      ...milestone,
      progress: Math.min((memberCount / milestone.targetCount) * 100, 100),
      completed: memberCount >= milestone.targetCount,
    }));
    setMilestones(updatedMilestones);
  }, [currentMembers.length, milestones]);

  const checkForInvitationPrompts = useCallback(() => {
    // Don't show prompts if already at high member count
    if (currentMembers.length >= 8) return;

    let promptToShow: InvitationPrompt | null = null;

    // First document uploaded with no family members
    if (documentsCount === 1 && currentMembers.length === 0) {
      promptToShow = invitationPrompts['first_document'] ?? null;
    }
    // Protection level is low and could benefit from more members
    else if (protectionLevel < 60 && currentMembers.length < 3) {
      promptToShow = invitationPrompts['protection_incomplete'] ?? null;
    }
    // Milestone reached
    else if (currentMembers.length > 0 && currentMembers.length % 2 === 1) {
      promptToShow = invitationPrompts['milestone_reached'] ?? null;
    }
    // Weekly gentle nudge (this would be triggered by a separate timer in real app)
    else if (Math.random() < 0.1) {
      // 10% chance for demo purposes
      promptToShow = invitationPrompts['weekly_nudge'] ?? null;
    }

    if (promptToShow && !showInvitePrompt) {
      setCurrentPrompt(promptToShow);
      // Small delay to make it feel natural
      setTimeout(() => setShowInvitePrompt(true), 2000);
    }
  }, [
    currentMembers.length,
    documentsCount,
    protectionLevel,
    showInvitePrompt,
  ]);

  useEffect(() => {
    updateMilestoneProgress();
    checkForInvitationPrompts();
  }, [
    currentMembers.length,
    documentsCount,
    protectionLevel,
    updateMilestoneProgress,
    checkForInvitationPrompts,
  ]);

  const handleInviteClick = () => {
    setShowInvitePrompt(false);
    onInviteFamily();
  };

  const getNextMilestone = () => {
    return milestones.find((m: ViralMilestone) => !m.completed);
  };

  const getCompletedMilestones = () => {
    return milestones.filter((m: ViralMilestone) => m.completed);
  };

  const getMilestoneRewards = () => {
    const completed = getCompletedMilestones();
    if (completed.length === 0) return null;

    return (
      <Card className='bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'>
        <CardContent className='p-4'>
          <div className='flex items-center gap-3'>
            <Trophy className='h-6 w-6 text-yellow-600' />
            <div>
              <div className='font-semibold text-yellow-800'>
{t('ui.milestonesUnlocked', { defaultValue: 'Family Milestones Unlocked!' })}
              </div>
              <div className='text-sm text-yellow-700'>
                {completed.map((m: ViralMilestone) => m.reward).join(' • ')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const nextMilestone = getNextMilestone();
  const progressToNext = nextMilestone
    ? Math.min((currentMembers.length / nextMilestone.targetCount) * 100, 100)
    : 100;

  return (
    <>
      {/* Milestone Progress Card */}
      <Card className='hover:shadow-md transition-shadow'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Target className='h-5 w-5 text-blue-600' />
              <CardTitle className='text-lg'>{t('ui.familyCircleProgress', { defaultValue: 'Family Circle Progress' })}</CardTitle>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowMilestones(true)}
              className='gap-2'
            >
              <Trophy className='h-4 w-4' />
{t('ui.viewAll', { defaultValue: 'View All' })}
            </Button>
          </div>
          <CardDescription>
{t('ui.buildNetwork', { defaultValue: 'Build your family protection network and unlock rewards' })}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Current Progress */}
          {nextMilestone && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <nextMilestone.icon className='h-4 w-4 text-blue-600' />
                  <span className='font-medium'>{nextMilestone.title}</span>
                </div>
                <Badge variant='secondary'>
                  {currentMembers.length}/{nextMilestone.targetCount}
                </Badge>
              </div>

              <Progress value={progressToNext} className='h-2' />

              <div className='flex items-center justify-between text-sm text-muted-foreground'>
                <span>{nextMilestone.description}</span>
                <span>{Math.round(progressToNext)}% complete</span>
              </div>

              <div className='text-sm text-blue-700 bg-blue-50 p-3 rounded-lg'>
                🎁 <strong>Reward:</strong> {nextMilestone.reward}
              </div>
            </div>
          )}

          {!nextMilestone && (
            <div className='text-center py-6'>
              <Crown className='h-12 w-12 text-yellow-500 mx-auto mb-3' />
              <div className='text-lg font-semibold mb-2'>
{t('ui.allMilestonesComplete', { defaultValue: 'All Milestones Complete!' })}
              </div>
              <div className='text-muted-foreground'>
{t('ui.ultimateCircle', { defaultValue: "You've built the ultimate family protection circle" })}
              </div>
            </div>
          )}

          {/* Rewards Unlocked */}
          {getMilestoneRewards()}

          {/* Quick Actions */}
          <div className='flex gap-2'>
            <Button onClick={onInviteFamily} className='flex-1 gap-2'>
              <UserPlus className='h-4 w-4' />
{t('ui.inviteFamily')}
            </Button>
            {currentMembers.length > 0 && (
              <Button variant='outline' className='gap-2'>
                <Share2 className='h-4 w-4' />
{t('ui.shareProgress', { defaultValue: 'Share Progress' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invitation Prompt Dialog */}
      <AnimatePresence>
        {showInvitePrompt && currentPrompt && (
          <Dialog open={showInvitePrompt} onOpenChange={setShowInvitePrompt}>
            <DialogContent className='max-w-md'>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className='text-center'>
                    {currentPrompt.title}
                  </DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                  <div className='text-center'>
                    <Heart className='h-12 w-12 text-pink-500 mx-auto mb-3' />
                    <p className='text-muted-foreground'>
                      {currentPrompt.message}
                    </p>
                  </div>

                  <Card className='bg-blue-50 border-blue-200'>
                    <CardContent className='p-4'>
                      <div className='text-sm font-medium mb-2'>
{t('ui.considerAdding', { defaultValue: 'Consider adding:' })}
                      </div>
                      <ul className='space-y-1 text-sm text-muted-foreground'>
                        {currentPrompt.suggestions.map((suggestion, index) => (
                          <li key={index} className='flex items-start gap-2'>
                            <div className='h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0'></div>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className='flex gap-3'>
                    <Button
                      variant='outline'
                      onClick={() => setShowInvitePrompt(false)}
                      className='flex-1'
                    >
{t('ui.maybeLater', { defaultValue: 'Maybe Later' })}
                    </Button>
                    <Button
                      onClick={handleInviteClick}
                      className='flex-1 gap-2'
                    >
                      <UserPlus className='h-4 w-4' />
{t('ui.inviteFamily')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* All Milestones Dialog */}
      <Dialog open={showMilestones} onOpenChange={setShowMilestones}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Trophy className='h-6 w-6 text-yellow-600' />
{t('ui.familyCircleMilestones', { defaultValue: 'Family Circle Milestones' })}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {milestones.map((milestone: ViralMilestone, _index: number) => (
              <Card
                key={milestone.id}
                className={
                  milestone.completed ? 'bg-green-50 border-green-200' : ''
                }
              >
                <CardContent className='p-4'>
                  <div className='flex items-center gap-4'>
                    <div
                      className={`p-3 rounded-full ${
                        milestone.completed ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle className='h-6 w-6 text-green-600' />
                      ) : (
                        <milestone.icon className='h-6 w-6 text-muted-foreground' />
                      )}
                    </div>

                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='font-semibold'>{milestone.title}</div>
                        <Badge
                          className={
                            milestone.completed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {currentMembers.length}/{milestone.targetCount}
                        </Badge>
                      </div>

                      <div className='text-sm text-muted-foreground'>
                        {milestone.description}
                      </div>

                      <Progress value={milestone.progress} className='h-2' />

                      <div className='text-sm text-blue-700'>
                        🎁 {milestone.reward}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
