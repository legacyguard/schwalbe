
/**
 * Family Protection Header Component
 * Enhanced dashboard header with family protection messaging and protection days counter
 */

import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { calculateFamilyProtectionDays } from '@/lib/milestone-system';
import { getFamilyImpactMessage } from '@/lib/trust-score';
import { useTranslation } from 'react-i18next';

interface FamilyProtectionHeaderProps {
  className?: string;
  documents?: Array<{ created_at?: string }>;
  emergencyContactsCount?: number;
  familyMembersCount?: number;
  onAddFamily?: () => void;
  onViewProgress?: () => void;
  protectionLevel?: 'basic' | 'comprehensive' | 'premium' | 'standard';
  trustScore?: number;
  userName?: string;
  variant?: 'compact' | 'full' | 'minimal';
}

export function FamilyProtectionHeader({
  userName = 'Guardian',
  documents = [],
  familyMembersCount = 0,
  emergencyContactsCount = 0,
  trustScore = 0,
  protectionLevel = 'basic',
  onViewProgress,
  onAddFamily,
  variant = 'full',
  className,
}: FamilyProtectionHeaderProps) {
  const { t } = useTranslation('ui/family-protection-header');
  const [protectionDays, setProtectionDays] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<
    'afternoon' | 'evening' | 'morning'
  >('morning');
  const [animatedDays, setAnimatedDays] = useState(0);

  // Calculate protection days
  useEffect(() => {
    if (documents.length > 0) {
      const firstDocDate = documents[0]?.created_at;
      const days = calculateFamilyProtectionDays(firstDocDate);
      setProtectionDays(days);

      // Animate days counter
      let start = 0;
      const increment = Math.ceil(days / 20);
      const timer = setInterval(() => {
        start += increment;
        if (start >= days) {
          setAnimatedDays(days);
          clearInterval(timer);
        } else {
          setAnimatedDays(start);
        }
      }, 50);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [documents]);

  // Set time of day greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const getGreeting = () => {
    return t(`greetings.${timeOfDay}`);
  };

  const getProtectionLevelColor = () => {
    switch (protectionLevel) {
      case 'comprehensive':
        return 'from-emerald-500 to-green-600 text-white';
      case 'premium':
        return 'from-blue-500 to-indigo-600 text-white';
      case 'standard':
        return 'from-yellow-500 to-orange-600 text-white';
      case 'basic':
        return 'from-gray-500 to-gray-600 text-white';
      default:
        return 'from-gray-400 to-gray-500 text-white';
    }
  };

  const getProtectionMessage = () => {
    const totalProtected = familyMembersCount + emergencyContactsCount;

    if (protectionDays === 0) {
      return t('protectionMessages.ready');
    } else if (protectionDays === 1) {
      return t('protectionMessages.firstDay');
    } else if (protectionDays < 7) {
      const peopleLabel = totalProtected === 1 ? t('peopleLabels.person') : t('peopleLabels.lovedOnes');
      return t('protectionMessages.growing', {
        days: protectionDays,
        totalProtected: totalProtected || t('peopleLabels.your'),
        peopleLabel
      });
    } else if (protectionDays < 30) {
      return t('protectionMessages.strong', { days: protectionDays });
    } else {
      return t('protectionMessages.comprehensive', { days: protectionDays });
    }
  };

  const getDaysDisplay = () => {
    if (protectionDays === 0) return null;

    return (
      <motion.div
        className='flex items-center gap-2 text-2xl font-bold'
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <motion.span
          key={animatedDays}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className='text-emerald-600'
        >
          {animatedDays}
        </motion.span>
        <span className='text-sm text-gray-600 font-normal'>
          {protectionDays === 1 ? t('stats.dayOfProtection').split(' ')[0] : t('stats.daysOfProtection').split(' ')[0]}
        </span>
      </motion.div>
    );
  };

  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg',
          className
        )}
      >
        <div>
          <h2 className='font-semibold text-gray-800'>
            {getGreeting()}, {userName}
          </h2>
          <p className='text-sm text-gray-600'>{getProtectionMessage()}</p>
        </div>

        {getDaysDisplay() && (
          <div className='text-right'>
            {getDaysDisplay()}
            <p className='text-xs text-gray-500'>{t('stats.protected')}</p>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0',
          className
        )}
      >
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <h1 className='text-xl font-bold text-gray-800'>
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className='text-sm text-gray-700 max-w-md leading-relaxed'>
              {getProtectionMessage()}
            </p>
            <div className='flex items-center gap-4 text-sm'>
              <div className='flex items-center gap-1'>
                <Shield className='h-4 w-4 text-blue-600' />
                <span>{documents.length} {t('stats.documents')}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Users className='h-4 w-4 text-green-600' />
                <span>
                  {familyMembersCount + emergencyContactsCount} {t('stats.protected')}
                </span>
              </div>
            </div>
          </div>

          <div className='text-right space-y-2'>
            {getDaysDisplay()}
            {trustScore > 0 && (
              <Badge
                className={cn(
                  'text-xs',
                  `bg-gradient-to-r ${getProtectionLevelColor()}`
                )}
              >
                {t('trustScoreBadge', { score: trustScore })}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={cn('overflow-hidden border-0 shadow-lg', className)}>
      <div className='relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-6'>
        {/* Background decorative elements */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20' />
        <div className='absolute top-4 right-4 opacity-10'>
          <Sparkles className='h-24 w-24' />
        </div>

        <div className='relative space-y-4'>
          {/* Main greeting */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className='text-3xl font-bold mb-2'>
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className='text-blue-100 text-lg leading-relaxed max-w-2xl'>
              {getProtectionMessage()}
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className='flex items-center gap-6 pt-2'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Days Protected */}
            {protectionDays > 0 && (
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
                  <Calendar className='h-5 w-5' />
                </div>
                <div>
                  {getDaysDisplay()}
                  <p className='text-blue-100 text-sm'>{t('stats.daysOfProtection')}</p>
                </div>
              </div>
            )}

            {/* Documents Count */}
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
                <Shield className='h-5 w-5' />
              </div>
              <div>
                <div className='text-2xl font-bold'>{documents.length}</div>
                <p className='text-blue-100 text-sm'>{t('stats.documentsSecured')}</p>
              </div>
            </div>

            {/* People Protected */}
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
                <Users className='h-5 w-5' />
              </div>
              <div>
                <div className='text-2xl font-bold'>
                  {familyMembersCount + emergencyContactsCount}
                </div>
                <p className='text-blue-100 text-sm'>{t('stats.peopleProtected')}</p>
              </div>
            </div>

            {/* Trust Score */}
            {trustScore > 0 && (
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
                  <TrendingUp className='h-5 w-5' />
                </div>
                <div>
                  <div className='text-2xl font-bold'>{trustScore}</div>
                  <p className='text-blue-100 text-sm'>{t('stats.trustScore')}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className='flex gap-3 pt-2'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {onViewProgress && (
              <Button
                variant='outline'
                size='sm'
                onClick={onViewProgress}
                className='bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm'
              >
                <Clock className='h-4 w-4 mr-2' />
                {t('buttons.viewProgress')}
              </Button>
            )}

            {familyMembersCount + emergencyContactsCount === 0 &&
              onAddFamily && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onAddFamily}
                  className='bg-emerald-500/20 border-emerald-300/30 text-emerald-100 hover:bg-emerald-500/30'
                >
                  <Users className='h-4 w-4 mr-2' />
                  {t('buttons.protectFirstFamilyMember')}
                </Button>
              )}
          </motion.div>
        </div>
      </div>

      {/* Bottom message bar */}
      <div className='bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-3'>
        <motion.p
          className='text-sm text-gray-700 text-center italic'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {getFamilyImpactMessage(trustScore, familyMembersCount)}
        </motion.p>
      </div>
    </Card>
  );
}
