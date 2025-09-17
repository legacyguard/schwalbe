/**
 * Mobile-Optimized Analytics Dashboard
 * Simplified, touch-friendly interface for analytics on mobile devices
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Progress } from '@/components/ui/progress';

import {
  Activity,
  Award,
  BarChart3,
  Calendar,
  ChevronRight,
  FileText,
  Shield,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  mobileOptimized,
  useBreakpoint,
} from '@/lib/performance/mobile-optimization';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface MobileAnalyticsDashboardProps {
  onNavigate?: (section: string) => void;
  userId: string;
}

export const MobileAnalyticsDashboard: React.FC<
  MobileAnalyticsDashboardProps
> = ({ userId: _userId, onNavigate }) => {
  const { t } = useTranslation('ui/mobile-analytics-dashboard');
  const { isSmall } = useBreakpoint();
  const [_selectedTab, _setSelectedTab] = useState('overview');

  // Mobile-optimized metrics data
  const metrics = {
    protectionScore: 78,
    completionPercentage: 65,
    activeRisks: 3,
    familyMembers: 4,
    documentsSecured: 23,
    streakDays: 7,
  };

  const quickActions = [
    {
      id: 'upload',
      title: t('quickActions.upload.title'),
      description: t('quickActions.upload.description'),
      icon: FileText,
      color: 'bg-blue-500',
      action: () => onNavigate?.('upload'),
    },
    {
      id: 'invite',
      title: t('quickActions.invite.title'),
      description: t('quickActions.invite.description'),
      icon: Users,
      color: 'bg-green-500',
      action: () => onNavigate?.('invite'),
    },
    {
      id: 'review',
      title: t('quickActions.review.title'),
      description: t('quickActions.review.description'),
      icon: Shield,
      color: 'bg-purple-500',
      action: () => onNavigate?.('review'),
    },
    {
      id: 'calendar',
      title: t('quickActions.calendar.title'),
      description: t('quickActions.calendar.description'),
      icon: Calendar,
      color: 'bg-orange-500',
      action: () => onNavigate?.('calendar'),
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'upload',
      message: t('recentActivity.messages.willUploaded'),
      time: t('recentActivity.timeAgo.hoursAgo', { count: 2 }),
    },
    {
      id: 2,
      type: 'review',
      message: t('recentActivity.messages.reviewCompleted'),
      time: t('recentActivity.timeAgo.dayAgo', { count: 1 }),
    },
    {
      id: 3,
      type: 'milestone',
      message: t('recentActivity.messages.milestoneReached'),
      time: t('recentActivity.timeAgo.daysAgo', { count: 3 }),
    },
  ];

  if (!isSmall) {
    // Return desktop version for larger screens
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      {/* Mobile Header */}
      <div className='bg-white shadow-sm p-4 sticky top-0 z-10'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-lg font-bold text-gray-900'>
              {t('header.title')}
            </h1>
            <p className='text-sm text-gray-600'>{t('header.subtitle')}</p>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold text-blue-600'>
              {metrics.protectionScore}
            </div>
            <div className='text-xs text-gray-500'>{t('header.protectionScore')}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards - Mobile Optimized */}
      <div className='p-4 space-y-3'>
        <div className='grid grid-cols-2 gap-3'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              {...mobileOptimized.card(true)}
              className='hover:shadow-md transition-shadow'
              onClick={() => onNavigate?.('progress')}
            >
              <CardContent className='p-4'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-green-100 rounded-full'>
                    <Target className='h-5 w-5 text-green-600' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='text-lg font-bold text-green-600'>
                      {metrics.completionPercentage}%
                    </div>
                    <div className='text-xs text-gray-600 truncate'>
                      {t('metrics.progress')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              {...mobileOptimized.card(true)}
              className='hover:shadow-md transition-shadow'
              onClick={() => onNavigate?.('family')}
            >
              <CardContent className='p-4'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-blue-100 rounded-full'>
                    <Users className='h-5 w-5 text-blue-600' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='text-lg font-bold text-blue-600'>
                      {metrics.familyMembers}
                    </div>
                    <div className='text-xs text-gray-600 truncate'>
                      {t('metrics.members')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              {...mobileOptimized.card(true)}
              className='hover:shadow-md transition-shadow'
              onClick={() => onNavigate?.('documents')}
            >
              <CardContent className='p-4'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-purple-100 rounded-full'>
                    <FileText className='h-5 w-5 text-purple-600' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='text-lg font-bold text-purple-600'>
                      {metrics.documentsSecured}
                    </div>
                    <div className='text-xs text-gray-600 truncate'>
                      {t('metrics.documents')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              {...mobileOptimized.card(true)}
              className='hover:shadow-md transition-shadow'
              onClick={() => onNavigate?.('achievements')}
            >
              <CardContent className='p-4'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-orange-100 rounded-full'>
                    <Award className='h-5 w-5 text-orange-600' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='text-lg font-bold text-orange-600'>
                      {metrics.streakDays}
                    </div>
                    <div className='text-xs text-gray-600 truncate'>
                      {t('metrics.dayStreak')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center space-x-2'>
                <Shield className='h-5 w-5 text-blue-600' />
                <span className='font-medium text-gray-900'>
                  {t('familyProtection.title')}
                </span>
              </div>
              <div className='flex items-center space-x-1'>
                <TrendingUp className='h-4 w-4 text-green-500' />
                <span className='text-sm text-green-500'>{t('familyProtection.trendUp')}</span>
              </div>
            </div>
            <Progress value={metrics.protectionScore} className='h-3 mb-2' />
            <div className='flex justify-between text-sm text-gray-600'>
              <span>{metrics.protectionScore}/100</span>
              <span>{t('metrics.risksToAddress', { count: metrics.activeRisks })}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center space-x-2'>
              <Activity className='h-5 w-5' />
              <span>{t('quickActions.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 pt-0'>
            <div className='grid grid-cols-2 gap-3'>
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  {...mobileOptimized.button('lg')}
                  onClick={action.action}
                  className={cn(
                    'p-4 rounded-xl text-left space-y-2 transition-all',
                    'hover:shadow-md active:scale-95',
                    'border border-gray-200 bg-white'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      action.color
                    )}
                  >
                    <action.icon className='h-4 w-4 text-white' />
                  </div>
                  <div>
                    <div className='font-medium text-sm text-gray-900'>
                      {action.title}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {action.description}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <BarChart3 className='h-5 w-5' />
                <span>{t('recentActivity.title')}</span>
              </div>
              <Button
                variant='ghost'
                size='sm'
                {...mobileOptimized.button('sm')}
                onClick={() => onNavigate?.('activity')}
              >
                {t('recentActivity.viewAll')}
                <ChevronRight className='h-4 w-4 ml-1' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 pt-0'>
            <div className='space-y-3'>
              {recentActivity.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='flex items-center space-x-3 p-2 rounded-lg bg-gray-50'
                >
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-medium text-gray-900 truncate'>
                      {item.message}
                    </div>
                    <div className='text-xs text-gray-500'>{item.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
