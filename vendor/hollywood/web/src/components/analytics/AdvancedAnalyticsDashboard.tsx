
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FamilyProtectionAnalytics } from './FamilyProtectionAnalytics';
import { LegacyCompletionTracking } from './LegacyCompletionTracking';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardMetrics {
  achievementCount: number;
  activeRisks: number;
  completionPercentage: number;
  documentsSecured: number;
  familyMembers: number;
  protectionScore: number;
  streakDays: number;
  timeInvested: string;
}

interface SmartInsight {
  action?: string;
  actionUrl?: string;
  category: 'family' | 'optimization' | 'progress' | 'protection';
  confidence: number;
  generated: Date;
  id: string;
  message: string;
  priority: 'critical' | 'high' | 'low' | 'medium';
  title: string;
  type: 'celebration' | 'opportunity' | 'recommendation' | 'warning';
}

interface AdvancedAnalyticsDashboardProps {
  compactMode?: boolean;
  familyId?: string;
  onInsightAction?: (insightId: string) => void;
}

export const AdvancedAnalyticsDashboard: React.FC<
  AdvancedAnalyticsDashboardProps
> = ({
  onInsightAction,
  compactMode: _compactMode = false,
  familyId: _familyId,
}) => {
  const { t } = useTranslation('ui/advanced-analytics-dashboard');
  const [showSmartInsights, setShowSmartInsights] = useState(true);
  const [_selectedTimeframe, _setSelectedTimeframe] = useState<
    '1y' | '7d' | '30d' | '90d'
  >('30d');
  const [activeView, setActiveView] = useState<
    'overview' | 'progress' | 'protection'
  >('overview');

  // Mock metrics data
  const metrics: DashboardMetrics = {
    protectionScore: 78,
    completionPercentage: 65,
    activeRisks: 3,
    achievementCount: 8,
    timeInvested: '12.5h',
    streakDays: 7,
    familyMembers: 4,
    documentsSecured: 23,
  };

  // Mock smart insights
  const smartInsights: SmartInsight[] = [
    {
      id: 'critical-healthcare',
      type: 'warning',
      priority: 'critical',
      title: t('smartInsights.insights.healthcareDirectives.title'),
      message: t('smartInsights.insights.healthcareDirectives.message'),
      action: t('smartInsights.insights.healthcareDirectives.action'),
      confidence: 95,
      category: 'protection',
      generated: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: 'streak-opportunity',
      type: 'opportunity',
      priority: 'medium',
      title: t('smartInsights.insights.streakOpportunity.title'),
      message: t('smartInsights.insights.streakOpportunity.message'),
      action: t('smartInsights.insights.streakOpportunity.action'),
      confidence: 88,
      category: 'progress',
      generated: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: 'family-collaboration',
      type: 'recommendation',
      priority: 'high',
      title: t('smartInsights.insights.familyCollaboration.title'),
      message: t('smartInsights.insights.familyCollaboration.message'),
      action: t('smartInsights.insights.familyCollaboration.action'),
      confidence: 82,
      category: 'family',
      generated: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    },
    {
      id: 'achievement-unlocked',
      type: 'celebration',
      priority: 'low',
      title: t('smartInsights.insights.achievementUnlocked.title'),
      message: t('smartInsights.insights.achievementUnlocked.message'),
      confidence: 100,
      category: 'progress',
      generated: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ];

  const getInsightIcon = (type: SmartInsight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-red-600' />;
      case 'recommendation':
        return <Brain className='h-4 w-4 text-blue-600' />;
      case 'celebration':
        return <Award className='h-4 w-4 text-green-600' />;
      case 'opportunity':
        return <Zap className='h-4 w-4 text-purple-600' />;
      default:
        return <Activity className='h-4 w-4 text-gray-600' />;
    }
  };

  const getInsightColor = (
    type: SmartInsight['type'],
    priority: SmartInsight['priority']
  ) => {
    if (priority === 'critical') return 'border-red-500 bg-red-50';

    switch (type) {
      case 'warning':
        return 'border-orange-500 bg-orange-50';
      case 'recommendation':
        return 'border-blue-500 bg-blue-50';
      case 'celebration':
        return 'border-green-500 bg-green-50';
      case 'opportunity':
        return 'border-purple-500 bg-purple-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: SmartInsight['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return t('timeAgo.daysAgo', { days: diffDays });
    if (diffHours > 0) return t('timeAgo.hoursAgo', { hours: diffHours });
    return t('timeAgo.justNow');
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {t('header.title')}
          </h1>
          <p className='text-gray-600'>
            {t('header.description')}
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => setShowSmartInsights(!showSmartInsights)}
            className='gap-2'
          >
            {showSmartInsights ? (
              <EyeOff className='h-4 w-4' />
            ) : (
              <Eye className='h-4 w-4' />
            )}
            {showSmartInsights ? t('buttons.hideInsights') : t('buttons.showInsights')}
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4'>
        <Card className='hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Shield className='h-4 w-4 text-blue-600' />
              <span className='text-sm font-medium'>{t('metrics.protection.title')}</span>
            </div>
            <div className='text-2xl font-bold text-blue-600'>
              {metrics.protectionScore}
            </div>
            <p className='text-xs text-gray-500'>{t('metrics.protection.label')}</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Target className='h-4 w-4 text-green-600' />
              <span className='text-sm font-medium'>{t('metrics.completion.title')}</span>
            </div>
            <div className='text-2xl font-bold text-green-600'>
              {metrics.completionPercentage}%
            </div>
            <p className='text-xs text-gray-500'>{t('metrics.completion.label')}</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <AlertTriangle className='h-4 w-4 text-red-600' />
              <span className='text-sm font-medium'>{t('metrics.risks.title')}</span>
            </div>
            <div className='text-2xl font-bold text-red-600'>
              {metrics.activeRisks}
            </div>
            <p className='text-xs text-gray-500'>{t('metrics.risks.label')}</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Award className='h-4 w-4 text-purple-600' />
              <span className='text-sm font-medium'>{t('metrics.achievements.title')}</span>
            </div>
            <div className='text-2xl font-bold text-purple-600'>
              {metrics.achievementCount}
            </div>
            <p className='text-xs text-gray-500'>{t('metrics.achievements.label')}</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Clock className='h-4 w-4 text-yellow-600' />
              <span className='text-sm font-medium'>{t('metrics.time.title')}</span>
            </div>
            <div className='text-2xl font-bold text-yellow-600'>
              {metrics.timeInvested}
            </div>
            <p className='text-xs text-gray-500'>{t('metrics.time.label')}</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Star className='h-4 w-4 text-orange-600' />
              <span className='text-sm font-medium'>{t('metrics.streak.title')}</span>
            </div>
            <div className='text-2xl font-bold text-orange-600'>
              {metrics.streakDays}
            </div>
            <p className='text-xs text-gray-500'>{t('metrics.streak.label')}</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Users className='h-4 w-4 text-indigo-600' />
              <span className='text-sm font-medium'>{t('metrics.family.title')}</span>
            </div>
            <div className='text-2xl font-bold text-indigo-600'>
              {metrics.familyMembers}
            </div>
            <p className='text-xs text-gray-500'>{t('metrics.family.label')}</p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <CheckCircle className='h-4 w-4 text-teal-600' />
              <span className='text-sm font-medium'>{t('metrics.documents.title')}</span>
            </div>
            <div className='text-2xl font-bold text-teal-600'>
              {metrics.documentsSecured}
            </div>
            <p className='text-xs text-gray-500'>{t('metrics.documents.label')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights */}
      {showSmartInsights && smartInsights.length > 0 && (
        <Card className='border-2 border-blue-200 bg-blue-50'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <Brain className='h-5 w-5 text-blue-600' />
                {t('smartInsights.title')}
                <Badge variant='secondary' className='text-xs'>
                  {t('smartInsights.poweredBy')}
                </Badge>
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-xs'>
                  {
                    smartInsights.filter(
                      i => i.priority === 'critical' || i.priority === 'high'
                    ).length
                  }{' '}
                  {t('smartInsights.urgent')}
                </Badge>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setShowSmartInsights(false)}
                >
                  <EyeOff className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {smartInsights.slice(0, 4).map(insight => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type, insight.priority)}`}
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex items-center gap-2'>
                      {getInsightIcon(insight.type)}
                      <h4 className='font-medium text-gray-900'>
                        {insight.title}
                      </h4>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge
                        className={getPriorityBadgeColor(insight.priority)}
                      >
                        {t(`priority.${insight.priority}`)}
                      </Badge>
                      <span className='text-xs text-gray-500'>
                        {formatTimeAgo(insight.generated)}
                      </span>
                    </div>
                  </div>
                  <p className='text-sm text-gray-700 mb-3'>
                    {insight.message}
                  </p>
                  <div className='flex items-center justify-between'>
                    <div className='text-xs text-gray-500'>
                      {t('smartInsights.confidence', { percentage: insight?.confidence })}
                    </div>
                    {insight.action && (
                      <Button
                        size='sm'
                        onClick={() => onInsightAction?.(insight.id)}
                        className='gap-2'
                      >
                        <Zap className='h-3 w-3' />
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Tabs */}
      <Tabs
        value={activeView}
        onValueChange={value =>
          setActiveView(value as 'overview' | 'progress' | 'protection')
        }
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='overview' className='gap-2'>
            <BarChart3 className='h-4 w-4' />
            {t('tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value='protection' className='gap-2'>
            <Shield className='h-4 w-4' />
            {t('tabs.protection')}
          </TabsTrigger>
          <TabsTrigger value='progress' className='gap-2'>
            <Target className='h-4 w-4' />
            {t('tabs.progress')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* Quick Overview Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5 text-green-600' />
                  {t('overview.progressTrends.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>{t('overview.progressTrends.thisWeek')}</span>
                    <div className='flex items-center gap-2'>
                      <div className='text-sm font-medium text-green-600'>
                        +12%
                      </div>
                      <TrendingUp className='h-3 w-3 text-green-600' />
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>{t('overview.progressTrends.thisMonth')}</span>
                    <div className='flex items-center gap-2'>
                      <div className='text-sm font-medium text-green-600'>
                        +28%
                      </div>
                      <TrendingUp className='h-3 w-3 text-green-600' />
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>{t('overview.progressTrends.familyProtection')}</span>
                    <div className='flex items-center gap-2'>
                      <div className='text-sm font-medium text-blue-600'>
                        78/100
                      </div>
                      <Shield className='h-3 w-3 text-blue-600' />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5 text-blue-600' />
                  {t('overview.recentActivity.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>
                        {t('overview.recentActivity.items.healthcareProxyCompleted')}
                      </div>
                      <div className='text-xs text-gray-500'>{t('timeAgo.hoursAgoSingle')}</div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Clock className='h-4 w-4 text-yellow-600' />
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>
                        {t('overview.recentActivity.items.assetInventoryStarted')}
                      </div>
                      <div className='text-xs text-gray-500'>{t('timeAgo.yesterday')}</div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Award className='h-4 w-4 text-purple-600' />
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>
                        {t('overview.recentActivity.items.achievementUnlocked')}
                      </div>
                      <div className='text-xs text-gray-500'>{t('timeAgo.daysAgoThree')}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='protection'>
          <FamilyProtectionAnalytics
            onRecommendationAction={id =>
              console.warn('Recommendation action:', id)
            }
            onRiskMitigation={id => console.warn('Risk mitigation:', id)}
          />
        </TabsContent>

        <TabsContent value='progress'>
          <LegacyCompletionTracking
            onTaskStart={id => console.warn('Task started:', id)}
            onGoalCreate={goal => console.warn('Goal created:', goal)}
            onMilestoneAchieved={id => console.warn('Milestone achieved:', id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
