
/**
 * Family Benefit Nudges Component
 * Gentle suggestions focused on family benefits and emotional connection
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  Lightbulb,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type MilestoneTriggerConditions } from '@/lib/milestone-system';

interface FamilyNudge {
  action_text: string;
  action_type:
    | 'add_family'
    | 'celebrate_milestone'
    | 'complete_will'
    | 'review_protection'
    | 'set_emergency_contact'
    | 'upload_document';
  dismissible: boolean;
  emotional_hook: string;
  expires_after_hours?: number;
  family_benefit: string;
  family_impact_score: number;
  id: string;
  message: string;
  priority: 'high' | 'low' | 'medium' | 'urgent';
  show_after_days?: number;
  time_estimate: string;
  title: string;
  type:
    | 'celebration'
    | 'emotional'
    | 'family_focused'
    | 'milestone'
    | 'protection_gap'
    | 'time_based';
}

interface FamilyBenefitNudgesProps {
  achievedMilestones?: string[];
  className?: string;
  dismissedNudges?: string[];
  documents?: any[];
  emergencyContactsCount?: number;
  familyMembersCount?: number;
  lastActionDate?: string;
  maxNudges?: number;
  onActionClick?: (
    actionType: FamilyNudge['action_type'],
    nudgeId: string
  ) => void;
  onDismiss?: (nudgeId: string) => void;
  trustScore?: number;
  variant?: 'banner' | 'modal' | 'sidebar';
  willData?: any;
}

export function FamilyBenefitNudges({
  documents = [],
  willData,
  familyMembersCount = 0,
  emergencyContactsCount = 0,
  trustScore = 0,
  achievedMilestones = [],
  lastActionDate,
  onActionClick,
  onDismiss,
  dismissedNudges = [],
  maxNudges = 2,
  variant = 'sidebar',
  className,
}: FamilyBenefitNudgesProps) {
  const { t } = useTranslation('ui/family-benefit-nudges');
  const [activeNudges, setActiveNudges] = useState<FamilyNudge[]>([]);
  const [daysSinceFirstDocument, setDaysSinceFirstDocument] = useState(0);

  // Calculate conditions and generate nudges
  useEffect(() => {
    const conditions: MilestoneTriggerConditions = {
      documentsCount: documents.length,
      familyMembersCount,
      emergencyContactsCount,
      willCompleted: !!willData?.beneficiaries?.length,
      trustScore,
      protectionLevel: getTrustScoreLevel(trustScore),
      daysSinceFirstDocument,
      hasInsurance: documents.some(d => d.category === 'insurance'),
      hasMedical: documents.some(d => d.category === 'medical'),
      hasLegal: documents.some(d => d.category === 'legal'),
      professionalReviewCompleted: trustScore >= 80,
    };

    if (documents.length > 0) {
      const firstDocDate = new Date(documents[0]?.created_at || Date.now());
      const days = Math.floor(
        (Date.now() - firstDocDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      setDaysSinceFirstDocument(days);
    }

    const nudges = generateFamilyNudges(
      conditions,
      achievedMilestones,
      lastActionDate,
      t
    );
    const filteredNudges = nudges
      .filter(nudge => !dismissedNudges.includes(nudge.id))
      .slice(0, maxNudges);

    setActiveNudges(filteredNudges);
  }, [
    documents,
    willData,
    familyMembersCount,
    emergencyContactsCount,
    trustScore,
    achievedMilestones,
    dismissedNudges,
    maxNudges,
    lastActionDate,
    daysSinceFirstDocument,
  ]);

  const generateFamilyNudges = (
    conditions: MilestoneTriggerConditions,
    achieved: string[],
    lastAction: string | undefined,
    t: any
  ): FamilyNudge[] => {
    const nudges: FamilyNudge[] = [];
    const daysSinceLastAction = lastAction
      ? Math.floor(
          (Date.now() - new Date(lastAction).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 999;

    // First document nudge - highest priority
    if (conditions.documentsCount === 0) {
      nudges.push({
        id: 'first_document_nudge',
        type: 'milestone',
        priority: 'urgent',
        title: t('nudges.first_document_nudge.title'),
        message: t('nudges.first_document_nudge.message'),
        family_benefit: t('nudges.first_document_nudge.family_benefit'),
        emotional_hook: t('nudges.first_document_nudge.emotional_hook'),
        action_text: t('nudges.first_document_nudge.action_text'),
        action_type: 'upload_document',
        time_estimate: t('nudges.first_document_nudge.time_estimate'),
        family_impact_score: 85,
        dismissible: false,
      });
    }

    // Family circle nudge
    if (
      conditions.documentsCount > 0 &&
      conditions.familyMembersCount === 0 &&
      conditions.emergencyContactsCount === 0
    ) {
      nudges.push({
        id: 'family_circle_nudge',
        type: 'family_focused',
        priority: 'high',
        title: t('nudges.family_circle_nudge.title'),
        message: t('nudges.family_circle_nudge.message'),
        family_benefit: t('nudges.family_circle_nudge.family_benefit'),
        emotional_hook: t('nudges.family_circle_nudge.emotional_hook'),
        action_text: t('nudges.family_circle_nudge.action_text'),
        action_type: 'set_emergency_contact',
        time_estimate: t('nudges.family_circle_nudge.time_estimate'),
        family_impact_score: 75,
        dismissible: true,
      });
    }

    // Will completion nudge
    if (
      conditions.documentsCount >= 3 &&
      !conditions.willCompleted &&
      !achieved.includes('will_wisdom')
    ) {
      nudges.push({
        id: 'will_completion_nudge',
        type: 'milestone',
        priority: 'high',
        title: t('nudges.will_completion_nudge.title'),
        message: t('nudges.will_completion_nudge.message'),
        family_benefit: t('nudges.will_completion_nudge.family_benefit'),
        emotional_hook: t('nudges.will_completion_nudge.emotional_hook'),
        action_text: t('nudges.will_completion_nudge.action_text'),
        action_type: 'complete_will',
        time_estimate: t('nudges.will_completion_nudge.time_estimate'),
        family_impact_score: 90,
        dismissible: true,
      });
    }

    // Time-based encouragement nudge
    if (
      daysSinceLastAction >= 7 &&
      conditions.documentsCount > 0 &&
      conditions.documentsCount < 5
    ) {
      nudges.push({
        id: 'weekly_encouragement_nudge',
        type: 'time_based',
        priority: 'medium',
        title: t('nudges.weekly_encouragement_nudge.title'),
        message: t('nudges.weekly_encouragement_nudge.message', {
          percentage: Math.round((conditions.documentsCount / 10) * 100)
        }),
        family_benefit: t('nudges.weekly_encouragement_nudge.family_benefit'),
        emotional_hook: t('nudges.weekly_encouragement_nudge.emotional_hook'),
        action_text: t('nudges.weekly_encouragement_nudge.action_text'),
        action_type: 'upload_document',
        time_estimate: t('nudges.weekly_encouragement_nudge.time_estimate'),
        family_impact_score: 60,
        dismissible: true,
        expires_after_hours: 72,
      });
    }

    // Protection gap nudges
    if (conditions.documentsCount >= 3 && !conditions.hasInsurance) {
      nudges.push({
        id: 'insurance_gap_nudge',
        type: 'protection_gap',
        priority: 'medium',
        title: t('nudges.insurance_gap_nudge.title'),
        message: t('nudges.insurance_gap_nudge.message'),
        family_benefit: t('nudges.insurance_gap_nudge.family_benefit'),
        emotional_hook: t('nudges.insurance_gap_nudge.emotional_hook'),
        action_text: t('nudges.insurance_gap_nudge.action_text'),
        action_type: 'upload_document',
        time_estimate: t('nudges.insurance_gap_nudge.time_estimate'),
        family_impact_score: 80,
        dismissible: true,
      });
    }

    // Celebration nudge for milestones
    if (
      conditions.documentsCount === 5 &&
      !achieved.includes('protection_foundation')
    ) {
      nudges.push({
        id: 'foundation_celebration_nudge',
        type: 'celebration',
        priority: 'low',
        title: t('nudges.foundation_celebration_nudge.title'),
        message: t('nudges.foundation_celebration_nudge.message'),
        family_benefit: t('nudges.foundation_celebration_nudge.family_benefit'),
        emotional_hook: t('nudges.foundation_celebration_nudge.emotional_hook'),
        action_text: t('nudges.foundation_celebration_nudge.action_text'),
        action_type: 'celebrate_milestone',
        time_estimate: t('nudges.foundation_celebration_nudge.time_estimate'),
        family_impact_score: 70,
        dismissible: true,
        expires_after_hours: 24,
      });
    }

    // Monthly check-in nudge
    if (
      conditions.daysSinceFirstDocument >= 30 &&
      conditions.daysSinceFirstDocument % 30 === 0
    ) {
      const months = Math.floor(conditions.daysSinceFirstDocument / 30);
      nudges.push({
        id: 'monthly_checkin_nudge',
        type: 'time_based',
        priority: 'low',
        title: t('nudges.monthly_checkin_nudge.title', {
          months,
          plural: conditions.daysSinceFirstDocument >= 60 ? 's' : ''
        }),
        message: t('nudges.monthly_checkin_nudge.message'),
        family_benefit: t('nudges.monthly_checkin_nudge.family_benefit'),
        emotional_hook: t('nudges.monthly_checkin_nudge.emotional_hook'),
        action_text: t('nudges.monthly_checkin_nudge.action_text'),
        action_type: 'review_protection',
        time_estimate: t('nudges.monthly_checkin_nudge.time_estimate'),
        family_impact_score: 65,
        dismissible: true,
        expires_after_hours: 168,
      });
    }

    return nudges.sort((a, b) => {
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  };

  const handleAction = (nudge: FamilyNudge) => {
    onActionClick?.(nudge.action_type, nudge.id);
  };

  const handleDismiss = (nudgeId: string) => {
    setActiveNudges(prev => prev.filter(n => n.id !== nudgeId));
    onDismiss?.(nudgeId);
  };

  const getNudgeIcon = (type: FamilyNudge['type']) => {
    switch (type) {
      case 'milestone':
        return Shield;
      case 'family_focused':
        return Users;
      case 'protection_gap':
        return Heart;
      case 'time_based':
        return Clock;
      case 'emotional':
        return Heart;
      case 'celebration':
        return Calendar;
      default:
        return Lightbulb;
    }
  };

  const getPriorityColor = (priority: FamilyNudge['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const renderNudge = (nudge: FamilyNudge, index: number) => {
    const IconComponent = getNudgeIcon(nudge.type);

    return (
      <motion.div
        key={nudge.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card
          className={cn(
            'border-l-4 shadow-sm hover:shadow-md transition-shadow',
            getPriorityColor(nudge.priority)
          )}
        >
          <CardContent className='p-4'>
            <div className='flex items-start gap-3'>
              <div
                className={cn(
                  'p-2 rounded-lg flex-shrink-0',
                  nudge.priority === 'urgent' && 'bg-red-100',
                  nudge.priority === 'high' && 'bg-orange-100',
                  nudge.priority === 'medium' && 'bg-blue-100',
                  nudge.priority === 'low' && 'bg-green-100'
                )}
              >
                <IconComponent className='h-5 w-5' />
              </div>

              <div className='flex-1 space-y-2'>
                <div className='flex items-start justify-between'>
                  <h4 className='font-semibold text-sm leading-tight'>
                    {nudge.title}
                  </h4>
                  {nudge.dismissible && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDismiss(nudge.id)}
                      className='h-6 w-6 p-0 text-gray-400 hover:text-gray-600'
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  )}
                </div>

                <p className='text-sm text-gray-700 leading-relaxed'>
                  {nudge.message}
                </p>

                <div className='bg-white/70 rounded-md p-2 border border-current/10'>
                  <p className='text-xs font-medium mb-1'>{t('ui.familyBenefitLabel')}</p>
                  <p className='text-xs text-gray-600 leading-tight'>
                    {nudge.family_benefit}
                  </p>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3 text-xs text-gray-500'>
                    <span>{nudge.time_estimate}</span>
                    <Badge variant='outline' className='text-xs px-1 py-0 h-4'>
                      {t('ui.impactLabel', { score: nudge.family_impact_score })}
                    </Badge>
                  </div>

                  <Button
                    size='sm'
                    onClick={() => handleAction(nudge)}
                    className='h-7 text-xs gap-1'
                  >
                    {nudge.action_text}
                    <ChevronRight className='h-3 w-3' />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (activeNudges.length === 0) return null;

  if (variant === 'banner') {
    const primaryNudge = activeNudges[0];

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-4 rounded-lg shadow-sm',
          getPriorityColor(primaryNudge.priority),
          className
        )}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 flex-1'>
            <Heart className='h-5 w-5 text-current' />
            <div>
              <h4 className='font-semibold text-sm'>{primaryNudge.title}</h4>
              <p className='text-xs opacity-90'>
                {primaryNudge.emotional_hook}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs'>{primaryNudge.time_estimate}</span>
            <Button
              size='sm'
              variant='outline'
              onClick={() => handleAction(primaryNudge)}
              className='h-7 text-xs border-current/20 text-current hover:bg-current/10'
            >
              {primaryNudge.action_text}
            </Button>
            {primaryNudge.dismissible && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleDismiss(primaryNudge.id)}
                className='h-7 w-7 p-0 text-current/60 hover:text-current'
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Sidebar variant (default)
  return (
    <div className={cn('space-y-3', className)}>
      <AnimatePresence mode='popLayout'>
        {activeNudges.map((nudge, index) => renderNudge(nudge, index))}
      </AnimatePresence>
    </div>
  );
}

function getTrustScoreLevel(
  score: number
): 'basic' | 'comprehensive' | 'premium' | 'standard' {
  if (score >= 90) return 'comprehensive';
  if (score >= 75) return 'premium';
  if (score >= 50) return 'standard';
  return 'basic';
}
