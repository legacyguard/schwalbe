
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Flag,
  MapPin,
  Medal,
  PauseCircle,
  PlayCircle,
  Plus,
  Route,
  Sparkles,
  Star,
  Target,
  BarChart3 as Timeline,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LegacyArea {
  category: 'comprehensive' | 'essential' | 'important' | 'premium';
  completedAt?: Date;
  completeness: number;
  dependencies: string[];
  description: string;
  estimatedTime: string;
  id: string;
  maxScore: number;
  milestones: Milestone[];
  name: string;
  priority: 'critical' | 'high' | 'low' | 'medium';
  tasks: LegacyTask[];
  unlockedAt?: Date;
}

interface LegacyTask {
  actualMinutes?: number;
  category:
    | 'documentation'
    | 'maintenance'
    | 'planning'
    | 'quick-start'
    | 'review';
  completedAt?: Date;
  description: string;
  difficulty: 'easy' | 'expert' | 'hard' | 'medium';
  estimatedMinutes: number;
  id: string;
  impact: 'critical' | 'high' | 'low' | 'medium';
  prerequisites: string[];
  reward: number;
  status: 'available' | 'completed' | 'in-progress' | 'locked' | 'needs-review';
  streak?: number;
  title: string;
}

interface Milestone {
  achieved: boolean;
  achievedAt?: Date;
  badge: string;
  description: string;
  id: string;
  reward: string;
  threshold: number;
  title: string;
}

interface Goal {
  category: 'long-term' | 'medium-term' | 'short-term';
  createdAt: Date;
  currentProgress: number;
  description: string;
  id: string;
  isActive: boolean;
  milestones: string[];
  priority: 'critical' | 'high' | 'low' | 'medium';
  targetCompleteness: number;
  targetDate: Date;
  title: string;
}

interface Achievement {
  description: string;
  earnedAt: Date;
  icon: React.ReactNode;
  id: string;
  rarity: 'common' | 'epic' | 'legendary' | 'rare';
  reward: string;
  title: string;
  type: 'completeness' | 'consistency' | 'milestone' | 'speed' | 'streak';
}

interface LegacyCompletionTrackingProps {
  onGoalCreate?: (goal: Goal) => void;
  onMilestoneAchieved?: (milestoneId: string) => void;
  onTaskStart?: (taskId: string) => void;
}

export const LegacyCompletionTracking: React.FC<
  LegacyCompletionTrackingProps
> = ({
  onTaskStart,
  onGoalCreate: _onGoalCreate,
  onMilestoneAchieved: _onMilestoneAchieved,
}) => {
  const { t } = useTranslation('ui/legacy-completion-tracking');
  const [legacyAreas, setLegacyAreas] = useState<LegacyArea[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [_selectedTimeframe, _setSelectedTimeframe] = useState<
    'month' | 'quarter' | 'week' | 'year'
  >('month');
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalRewardPoints, setTotalRewardPoints] = useState(0);

  // Mock data initialization
  useEffect(() => {
    const mockLegacyAreas: LegacyArea[] = [
      {
        id: 'essential-protection',
        name: 'Essential Family Protection',
        category: 'essential',
        description: 'Critical documents and plans every family needs',
        completeness: 85,
        maxScore: 100,
        priority: 'critical',
        estimatedTime: '4-6 hours',
        dependencies: [],
        unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        tasks: [
          {
            id: 'basic-will',
            title: 'Create Basic Will',
            description:
              'Essential will covering asset distribution and guardianship',
            category: 'documentation',
            status: 'completed',
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            estimatedMinutes: 120,
            actualMinutes: 95,
            impact: 'critical',
            difficulty: 'medium',
            prerequisites: [],
            reward: 100,
            streak: 1,
          },
          {
            id: 'emergency-contacts',
            title: 'Emergency Contact List',
            description: 'Comprehensive list of emergency contacts for family',
            category: 'quick-start',
            status: 'completed',
            completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            estimatedMinutes: 30,
            actualMinutes: 25,
            impact: 'high',
            difficulty: 'easy',
            prerequisites: [],
            reward: 50,
          },
          {
            id: 'healthcare-proxy',
            title: 'Healthcare Proxy',
            description: 'Designate someone to make healthcare decisions',
            category: 'documentation',
            status: 'in-progress',
            estimatedMinutes: 60,
            impact: 'critical',
            difficulty: 'medium',
            prerequisites: [],
            reward: 80,
          },
        ],
        milestones: [
          {
            id: 'essential-50',
            title: 'Foundation Builder',
            description: 'Complete 50% of essential protection',
            threshold: 50,
            achieved: true,
            achievedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            reward: 'Priority support access',
            badge: '🏗️',
          },
          {
            id: 'essential-complete',
            title: 'Family Guardian',
            description: 'Complete all essential protection items',
            threshold: 100,
            achieved: false,
            reward: 'Professional review credit',
            badge: '🛡️',
          },
        ],
      },
      {
        id: 'financial-planning',
        name: 'Financial Legacy Planning',
        category: 'important',
        description: 'Comprehensive financial planning and asset management',
        completeness: 45,
        maxScore: 100,
        priority: 'high',
        estimatedTime: '6-8 hours',
        dependencies: ['essential-protection'],
        unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        tasks: [
          {
            id: 'asset-inventory',
            title: 'Complete Asset Inventory',
            description: 'Comprehensive list of all assets and accounts',
            category: 'planning',
            status: 'completed',
            completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            estimatedMinutes: 180,
            actualMinutes: 160,
            impact: 'high',
            difficulty: 'medium',
            prerequisites: [],
            reward: 75,
          },
          {
            id: 'beneficiary-review',
            title: 'Review All Beneficiaries',
            description: 'Update beneficiaries on all accounts and policies',
            category: 'review',
            status: 'available',
            estimatedMinutes: 90,
            impact: 'high',
            difficulty: 'easy',
            prerequisites: ['asset-inventory'],
            reward: 60,
          },
        ],
        milestones: [
          {
            id: 'financial-foundation',
            title: 'Financial Foundation',
            description: 'Complete basic financial planning tasks',
            threshold: 50,
            achieved: false,
            reward: 'Financial planning guide',
            badge: '💰',
          },
        ],
      },
      {
        id: 'family-harmony',
        name: 'Family Harmony & Communication',
        category: 'comprehensive',
        description: 'Advanced family collaboration and communication systems',
        completeness: 20,
        maxScore: 100,
        priority: 'medium',
        estimatedTime: '8-12 hours',
        dependencies: ['essential-protection', 'financial-planning'],
        tasks: [
          {
            id: 'family-meetings',
            title: 'Establish Family Meetings',
            description: 'Set up regular family legacy planning discussions',
            category: 'planning',
            status: 'locked',
            estimatedMinutes: 120,
            impact: 'medium',
            difficulty: 'medium',
            prerequisites: ['basic-will', 'asset-inventory'],
            reward: 70,
          },
        ],
        milestones: [],
      },
    ];

    const mockGoals: Goal[] = [
      {
        id: 'q1-essential',
        title: 'Complete Essential Protection',
        description:
          'Finish all critical family protection items by end of quarter',
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        targetCompleteness: 100,
        currentProgress: 85,
        category: 'short-term',
        priority: 'high',
        milestones: ['essential-complete'],
        isActive: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'year-comprehensive',
        title: 'Comprehensive Legacy Plan',
        description:
          'Build complete family legacy plan with all advanced features',
        targetDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        targetCompleteness: 90,
        currentProgress: 35,
        category: 'long-term',
        priority: 'medium',
        milestones: ['essential-complete', 'financial-foundation'],
        isActive: true,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
    ];

    const mockAchievements: Achievement[] = [
      {
        id: 'first-task',
        title: 'Getting Started',
        description: 'Complete your first legacy planning task',
        type: 'milestone',
        earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        rarity: 'common',
        icon: <PlayCircle className='h-4 w-4' />,
        reward: '25 bonus points',
      },
      {
        id: 'speed-demon',
        title: 'Speed Demon',
        description: 'Complete a task 25% faster than estimated',
        type: 'speed',
        earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        rarity: 'rare',
        icon: <Zap className='h-4 w-4' />,
        reward: 'Priority feature access',
      },
    ];

    setLegacyAreas(mockLegacyAreas);
    setGoals(mockGoals);
    setAchievements(mockAchievements);
    setCurrentStreak(7);
    setTotalRewardPoints(485);
  }, []);

  const overallCompleteness = useMemo(() => {
    const totalTasks = legacyAreas.reduce(
      (sum, area) => sum + area.tasks.length,
      0
    );
    const completedTasks = legacyAreas.reduce(
      (sum, area) =>
        sum + area.tasks.filter(task => task.status === 'completed').length,
      0
    );
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }, [legacyAreas]);

  const nextMilestones = useMemo(() => {
    return legacyAreas
      .flatMap(area => area.milestones)
      .filter(milestone => !milestone.achieved)
      .sort((a, b) => a.threshold - b.threshold)
      .slice(0, 3);
  }, [legacyAreas]);

  const availableTasks = useMemo(() => {
    return legacyAreas
      .flatMap(area => area.tasks)
      .filter(
        task => task.status === 'available' || task.status === 'in-progress'
      )
      .sort((a, b) => {
        const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      })
      .slice(0, 5);
  }, [legacyAreas]);

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 90) return 'text-green-600';
    if (completeness >= 75) return 'text-blue-600';
    if (completeness >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletenessBackground = (completeness: number) => {
    if (completeness >= 90) return 'bg-green-50 border-green-200';
    if (completeness >= 75) return 'bg-blue-50 border-blue-200';
    if (completeness >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getPriorityColor = (priority: string) => {
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'available':
        return 'text-yellow-600';
      case 'locked':
        return 'text-gray-400';
      case 'needs-review':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'epic':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'rare':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'common':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            {t('header.title')}
          </h2>
          <p className='text-gray-600'>
            {t('header.subtitle')}
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='text-right'>
            <div className='text-sm text-gray-500'>{t('header.currentStreak')}</div>
            <div className='text-xl font-bold text-orange-600 flex items-center gap-1'>
              <Sparkles className='h-4 w-4' />
              {currentStreak} {t('header.days')}
            </div>
          </div>
          <div className='text-right'>
            <div className='text-sm text-gray-500'>{t('header.rewardPoints')}</div>
            <div className='text-xl font-bold text-purple-600 flex items-center gap-1'>
              <Star className='h-4 w-4' />
              {totalRewardPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <Card
        className={`border-2 ${getCompletenessBackground(overallCompleteness)}`}
      >
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white rounded-lg shadow-sm'>
                <Target
                  className={`h-6 w-6 ${getCompletenessColor(overallCompleteness)}`}
                />
              </div>
              <div>
                <CardTitle className='text-xl'>
                  {t('overallProgress.title')}
                </CardTitle>
                <p className='text-sm text-gray-600'>
                  {t('overallProgress.subtitle')}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <div
                className={`text-3xl font-bold ${getCompletenessColor(overallCompleteness)}`}
              >
                {overallCompleteness}{t('units.percent')}
              </div>
              <div className='text-sm text-gray-500'>
                {legacyAreas.reduce(
                  (sum, area) =>
                    sum +
                    area.tasks.filter(t => t.status === 'completed').length,
                  0
                )}{' '}
                /{legacyAreas.reduce((sum, area) => sum + area.tasks.length, 0)}{' '}
                {t('overallProgress.tasksCompleted')}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallCompleteness} className='h-3 mb-4' />

          {/* Quick Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <Crown className='h-4 w-4 text-yellow-600' />
              <span>
                {legacyAreas.filter(area => area.completeness >= 90).length}{' '}
                {t('quickStats.areasMastered')}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Trophy className='h-4 w-4 text-blue-600' />
              <span>{achievements.length} {t('quickStats.achievementsEarned')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-green-600' />
              <span>{availableTasks.length} {t('quickStats.tasksReady')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Flag className='h-4 w-4 text-purple-600' />
              <span>{nextMilestones.length} {t('quickStats.milestonesPending')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='progress' className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='progress'>{t('tabs.progress')}</TabsTrigger>
          <TabsTrigger value='roadmap'>{t('tabs.roadmap')}</TabsTrigger>
          <TabsTrigger value='goals'>{t('tabs.goals')}</TabsTrigger>
          <TabsTrigger value='achievements'>{t('tabs.achievements')}</TabsTrigger>
          <TabsTrigger value='analytics'>{t('tabs.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value='progress' className='space-y-4'>
          {/* Next Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <PlayCircle className='h-5 w-5 text-blue-600' />
                {t('progress.recommendedActions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {availableTasks.map(task => (
                  <div
                    key={task.id}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                  >
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <Badge className={getPriorityColor(task.impact)}>
                          {t(`priorities.${task.impact}`)}
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                          ~{task.estimatedMinutes}{t('units.minutes')}
                        </Badge>
                        <span className='text-xs text-gray-500'>
                          +{task.reward} {t('units.points')}
                        </span>
                      </div>
                      <h4 className='font-medium text-gray-900'>
                        {task.title}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {task.description}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`text-sm ${getTaskStatusColor(task.status)}`}
                      >
                        {task.status === 'in-progress' && (
                          <PauseCircle className='h-4 w-4' />
                        )}
                        {task.status === 'available' && (
                          <PlayCircle className='h-4 w-4' />
                        )}
                      </div>
                      <Button
                        size='sm'
                        onClick={() => onTaskStart?.(task.id)}
                        disabled={task.status === 'locked'}
                        className='gap-2'
                      >
                        {task.status === 'in-progress' ? t('progress.continue') : t('progress.start')}
                        <ArrowRight className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legacy Areas */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {legacyAreas.map(area => (
              <Card key={area.id} className='hover:shadow-lg transition-shadow'>
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-base'>{area.name}</CardTitle>
                    <Badge className={getPriorityColor(area.priority)}>
                      {t(`priorities.${area.priority}`)}
                    </Badge>
                  </div>
                  <p className='text-sm text-gray-600'>{area.description}</p>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div>
                      <div className='flex items-center justify-between text-sm mb-1'>
                        <span>{t('progress.completeness')}</span>
                        <span
                          className={getCompletenessColor(area.completeness)}
                        >
                          {area.completeness}{t('units.percent')}
                        </span>
                      </div>
                      <Progress value={area.completeness} className='h-2' />
                    </div>

                    <div className='flex items-center justify-between text-xs text-gray-500'>
                      <span>
                        {
                          area.tasks.filter(t => t.status === 'completed')
                            .length
                        }
                        /{area.tasks.length} {t('progress.tasks')}
                      </span>
                      <span>{area.estimatedTime}</span>
                    </div>

                    {/* Milestones */}
                    {area.milestones.length > 0 && (
                      <div className='space-y-1'>
                        {area.milestones.map(milestone => (
                          <div
                            key={milestone.id}
                            className='flex items-center gap-2 text-xs'
                          >
                            {milestone.achieved ? (
                              <CheckCircle className='h-3 w-3 text-green-600' />
                            ) : (
                              <Clock className='h-3 w-3 text-gray-400' />
                            )}
                            <span
                              className={
                                milestone.achieved
                                  ? 'text-green-600'
                                  : 'text-gray-500'
                              }
                            >
                              {milestone.title}
                            </span>
                            <span>{milestone.badge}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='roadmap' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>{t('roadmap.title')}</h3>
            <Button
              variant='outline'
              onClick={() => setShowRoadmap(!showRoadmap)}
              className='gap-2'
            >
              <Route className='h-4 w-4' />
              {showRoadmap ? t('roadmap.simpleView') : t('roadmap.detailedRoadmap')}
            </Button>
          </div>

          {/* Roadmap Timeline */}
          <Card>
            <CardContent className='p-6'>
              <div className='relative'>
                {/* Timeline Line */}
                <div className='absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200'></div>

                <div className='space-y-8'>
                  {legacyAreas.map(area => (
                    <div
                      key={area.id}
                      className='relative flex items-start gap-4'
                    >
                      {/* Timeline Node */}
                      <div
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                          area.completeness >= 100
                            ? 'bg-green-100 border-green-500'
                            : area.completeness > 0
                              ? 'bg-blue-100 border-blue-500'
                              : 'bg-gray-100 border-gray-300'
                        }`}
                      >
                        {area.completeness >= 100 ? (
                          <CheckCircle className='h-6 w-6 text-green-600' />
                        ) : area.completeness > 0 ? (
                          <Clock className='h-6 w-6 text-blue-600' />
                        ) : (
                          <MapPin className='h-6 w-6 text-gray-400' />
                        )}
                      </div>

                      {/* Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h4 className='font-medium text-gray-900'>
                            {area.name}
                          </h4>
                          <Badge className={getPriorityColor(area.category)}>
                            {t(`categories.${area.category}`)}
                          </Badge>
                        </div>
                        <p className='text-sm text-gray-600 mb-2'>
                          {area.description}
                        </p>

                        <div className='flex items-center gap-4 text-xs text-gray-500 mb-2'>
                          <span>{area.completeness}{t('units.percent')} {t('roadmap.complete')}</span>
                          <span>{area.estimatedTime}</span>
                          <span>{area.tasks.length} {t('progress.tasks')}</span>
                        </div>

                        {/* Progress Bar */}
                        <Progress
                          value={area.completeness}
                          className='h-1.5 mb-2'
                        />

                        {/* Dependencies */}
                        {area.dependencies.length > 0 && (
                          <div className='text-xs text-gray-500'>
                            <span>{t('progress.requires')}</span>
                            {area.dependencies.map((dep, i) => (
                              <span key={dep}>
                                {legacyAreas.find(a => a.id === dep)?.name}
                                {i < area.dependencies.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='goals' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>{t('goals.title')}</h3>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              {t('goals.setNewGoal')}
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {goals.map(goal => (
              <Card key={goal.id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-base'>{goal.title}</CardTitle>
                    <Badge className={getPriorityColor(goal.priority)}>
                      {t(`priorities.${goal.priority}`)}
                    </Badge>
                  </div>
                  <p className='text-sm text-gray-600'>{goal.description}</p>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div>
                      <div className='flex items-center justify-between text-sm mb-1'>
                        <span>{t('goals.progress')}</span>
                        <span
                          className={getCompletenessColor(goal.currentProgress)}
                        >
                          {goal.currentProgress}{t('units.percent')}
                        </span>
                      </div>
                      <Progress value={goal.currentProgress} className='h-2' />
                    </div>

                    <div className='flex items-center justify-between text-xs text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {t('goals.target')}: {goal.targetDate.toLocaleDateString()}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Target className='h-3 w-3' />
                        {goal.targetCompleteness}{t('units.percent')}
                      </div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <Badge variant='outline' className='text-xs'>
                        {t(`goalCategories.${goal.category.replace('-', '').toLowerCase()}`)}
                      </Badge>
                      <div
                        className={`text-xs ${goal.isActive ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        {goal.isActive ? t('goals.active') : t('goals.paused')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='achievements' className='space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Medal className='h-5 w-5 text-yellow-600' />
            <h3 className='text-lg font-medium'>{t('achievements.title')}</h3>
            <Badge variant='secondary'>{achievements.length} {t('achievements.total')}</Badge>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {achievements.map(achievement => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <Card
                  className={`border-2 ${getRarityColor(achievement.rarity)} hover:shadow-lg transition-all`}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 bg-white rounded-lg shadow-sm'>
                        {achievement.icon}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h4 className='font-medium text-gray-900'>
                            {achievement.title}
                          </h4>
                          <Badge
                            className={getRarityColor(achievement.rarity)
                              .replace('text-', 'bg-')
                              .replace('bg-', 'text-')}
                          >
                            {t(`rarities.${achievement.rarity}`)}
                          </Badge>
                        </div>
                        <p className='text-sm text-gray-600 mb-2'>
                          {achievement.description}
                        </p>
                        <div className='flex items-center justify-between text-xs text-gray-500'>
                          <span>
                            {t('achievements.earned')} {achievement.earnedAt.toLocaleDateString()}
                          </span>
                          <span className='font-medium'>
                            {achievement.reward}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <BarChart3 className='h-5 w-5 text-blue-600' />
            <h3 className='text-lg font-medium'>{t('analytics.title')}</h3>
          </div>

          {/* Time-based Analytics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Clock className='h-4 w-4 text-blue-600' />
                  <span className='text-sm font-medium'>{t('analytics.timeInvested.label')}</span>
                </div>
                <div className='text-2xl font-bold text-blue-600'>12.5{t('units.hours')}</div>
                <p className='text-xs text-gray-500'>{t('analytics.timeInvested.subtitle')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <TrendingUp className='h-4 w-4 text-green-600' />
                  <span className='text-sm font-medium'>{t('analytics.velocity.label')}</span>
                </div>
                <div className='text-2xl font-bold text-green-600'>3.2</div>
                <p className='text-xs text-gray-500'>{t('analytics.velocity.subtitle')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Target className='h-4 w-4 text-purple-600' />
                  <span className='text-sm font-medium'>{t('analytics.efficiency.label')}</span>
                </div>
                <div className='text-2xl font-bold text-purple-600'>87{t('units.percent')}</div>
                <p className='text-xs text-gray-500'>
                  {t('analytics.efficiency.subtitle')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Sparkles className='h-4 w-4 text-orange-600' />
                  <span className='text-sm font-medium'>{t('analytics.bestStreak.label')}</span>
                </div>
                <div className='text-2xl font-bold text-orange-600'>14</div>
                <p className='text-xs text-gray-500'>{t('analytics.bestStreak.subtitle')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Chart Placeholder */}
          <Card>
            <CardContent className='p-6'>
              <div className='h-64 flex items-center justify-center text-gray-500'>
                <div className='text-center'>
                  <Timeline className='h-12 w-12 mx-auto mb-2 text-gray-300' />
                  <p>{t('analytics.chartPlaceholder.title')}</p>
                  <p className='text-sm'>{t('analytics.chartPlaceholder.subtitle')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
