
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle,
  Clock,
  Lightbulb,
  PieChart,
  Shield,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface FamilyMember {
  age: number;
  id: string;
  name: string;
  protectionLevel: number;
  role: 'child' | 'guardian' | 'head' | 'spouse';
  vulnerabilityScore: number;
}

interface ProtectionArea {
  category: 'emergency' | 'family' | 'financial' | 'healthcare' | 'legal';
  currentScore: number;
  id: string;
  lastUpdated: Date;
  maxScore: number;
  name: string;
  priority: 'critical' | 'high' | 'low' | 'medium';
  recommendations: Recommendation[];
  risks: RiskFactor[];
  trend: 'declining' | 'improving' | 'stable';
  trendValue: number;
}

interface RiskFactor {
  affected: string[];
  description: string;
  id: string;
  impact: string;
  severity: 'critical' | 'high' | 'low' | 'medium';
  timeframe: 'immediate' | 'long-term' | 'short-term';
  type:
    | 'family-vulnerability'
    | 'legal-gap'
    | 'missing-document'
    | 'outdated-info';
}

interface Recommendation {
  actionUrl?: string;
  category: 'planning' | 'professional-help' | 'quick-fix';
  completed: boolean;
  description: string;
  estimatedTime: string;
  id: string;
  impactScore: number;
  priority: 'critical' | 'high' | 'low' | 'medium';
  title: string;
}

interface SecurityTrend {
  categories: {
    emergency: number;
    family: number;
    financial: number;
    healthcare: number;
    legal: number;
  };
  date: Date;
  overallScore: number;
}

interface FamilyProtectionAnalyticsProps {
  familyMembers?: FamilyMember[];
  onRecommendationAction?: (recommendationId: string) => void;
  onRiskMitigation?: (riskId: string) => void;
}

export const FamilyProtectionAnalytics: React.FC<
  FamilyProtectionAnalyticsProps
> = ({
  familyMembers: _familyMembers = [],
  onRecommendationAction,
  onRiskMitigation,
}) => {
  const { t } = useTranslation('ui/family-protection-analytics');
  const [protectionAreas, setProtectionAreas] = useState<ProtectionArea[]>([]);
  const [_securityTrends, _setSecurityTrends] = useState<SecurityTrend[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    '1y' | '7d' | '30d' | '90d'
  >('30d');
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  // Mock data generation for demonstration
  useEffect(() => {
    const mockProtectionAreas: ProtectionArea[] = [
      {
        id: 'financial',
        name: 'Financial Protection',
        category: 'financial',
        currentScore: 78,
        maxScore: 100,
        trend: 'improving',
        trendValue: 12,
        priority: 'high',
        lastUpdated: new Date(),
        risks: [
          {
            id: 'missing-life-insurance',
            type: 'missing-document',
            severity: 'high',
            description:
              'Life insurance coverage may be insufficient for family needs',
            impact:
              'Family could face financial hardship without adequate income replacement',
            timeframe: 'immediate',
            affected: ['spouse', 'children'],
          },
        ],
        recommendations: [
          {
            id: 'review-insurance',
            title: 'Review Life Insurance Coverage',
            description:
              'Calculate optimal coverage based on family needs and debts',
            priority: 'high',
            category: 'planning',
            estimatedTime: '2-3 hours',
            impactScore: 85,
            completed: false,
          },
        ],
      },
      {
        id: 'legal',
        name: 'Legal Documentation',
        category: 'legal',
        currentScore: 65,
        maxScore: 100,
        trend: 'stable',
        trendValue: 0,
        priority: 'critical',
        lastUpdated: new Date(),
        risks: [
          {
            id: 'outdated-will',
            type: 'outdated-info',
            severity: 'high',
            description: 'Will was last updated 3 years ago',
            impact: 'Current wishes may not be accurately reflected',
            timeframe: 'short-term',
            affected: ['all-family'],
          },
        ],
        recommendations: [
          {
            id: 'update-will',
            title: 'Update Will and Estate Plan',
            description:
              'Review and update will to reflect current family situation',
            priority: 'critical',
            category: 'professional-help',
            estimatedTime: '4-6 hours',
            impactScore: 95,
            completed: false,
          },
        ],
      },
      {
        id: 'healthcare',
        name: 'Healthcare Directives',
        category: 'healthcare',
        currentScore: 42,
        maxScore: 100,
        trend: 'declining',
        trendValue: -8,
        priority: 'critical',
        lastUpdated: new Date(),
        risks: [
          {
            id: 'missing-healthcare-proxy',
            type: 'legal-gap',
            severity: 'critical',
            description: 'No healthcare proxy or living will in place',
            impact:
              'Family may be unable to make medical decisions on your behalf',
            timeframe: 'immediate',
            affected: ['user', 'family'],
          },
        ],
        recommendations: [
          {
            id: 'create-healthcare-directives',
            title: 'Create Healthcare Directives',
            description: 'Establish healthcare proxy and living will documents',
            priority: 'critical',
            category: 'quick-fix',
            estimatedTime: '1-2 hours',
            impactScore: 90,
            completed: false,
          },
        ],
      },
    ];

    // Generate mock trend data
    const mockTrends: SecurityTrend[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockTrends.push({
        date,
        overallScore: 60 + Math.random() * 20 + (30 - i) * 0.5,
        categories: {
          financial: 65 + Math.random() * 15 + (30 - i) * 0.3,
          legal: 55 + Math.random() * 20 + (30 - i) * 0.4,
          healthcare: 35 + Math.random() * 25 + (30 - i) * 0.2,
          family: 70 + Math.random() * 15 + (30 - i) * 0.3,
          emergency: 50 + Math.random() * 20 + (30 - i) * 0.4,
        },
      });
    }

    setProtectionAreas(mockProtectionAreas);
    _setSecurityTrends(mockTrends);
    setOverallScore(
      Math.round(
        mockProtectionAreas.reduce(
          (sum, area) => sum + (area.currentScore / area.maxScore) * 100,
          0
        ) / mockProtectionAreas.length
      )
    );
  }, []);

  const criticalRisks = useMemo(() => {
    return protectionAreas
      .flatMap(area => area.risks)
      .filter(risk => risk.severity === 'critical' || risk.severity === 'high')
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
  }, [protectionAreas]);

  const topRecommendations = useMemo(() => {
    return protectionAreas
      .flatMap(area => area.recommendations)
      .filter(rec => !rec.completed)
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.impactScore - a.impactScore;
      })
      .slice(0, 5);
  }, [protectionAreas]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 75) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend: string, _value: number) => {
    if (trend === 'improving')
      return <TrendingUp className='h-4 w-4 text-green-600' />;
    if (trend === 'declining')
      return <TrendingDown className='h-4 w-4 text-red-600' />;
    return <Activity className='h-4 w-4 text-gray-600' />;
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
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
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            className='gap-2'
          >
            <BarChart3 className='h-4 w-4' />
            {showDetailedAnalysis ? t('header.simple') : t('header.detailed')}
          </Button>
        </div>
      </div>

      {/* Overall Security Score */}
      <Card className={`border-2 ${getScoreBackground(overallScore)}`}>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-white rounded-lg shadow-sm'>
                <Shield className={`h-6 w-6 ${getScoreColor(overallScore)}`} />
              </div>
              <div>
                <CardTitle className='text-xl'>{t('score.title')}</CardTitle>
                <p className='text-sm text-gray-600'>
                  {t('score.subtitle')}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <div
                className={`text-3xl font-bold ${getScoreColor(overallScore)}`}
              >
                {overallScore}
                <span className='text-lg text-gray-500'>{t('score.outOf')}</span>
              </div>
              <div className='flex items-center gap-1 text-sm'>
                <TrendingUp className='h-3 w-3 text-green-600' />
                <span className='text-green-600'>{t('score.deltaMonth', { value: 8 })}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallScore} className='h-2 mb-4' />
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <span>
                {protectionAreas.filter(area => area.currentScore >= 75).length}{' '}
                {t('score.wellProtected')}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-yellow-600' />
              <span>
                {
                  protectionAreas.filter(
                    area => area.currentScore < 75 && area.currentScore >= 50
                  ).length
                }{' '}
                {t('score.needAttention')}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4 text-red-600' />
              <span>
                {protectionAreas.filter(area => area.currentScore < 50).length}{' '}
                {t('score.criticalAreas')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalRisks.length > 0 && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertTriangle className='h-4 w-4 text-red-600' />
          <AlertDescription>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-red-800'>
                {t('alerts.criticalDetected', { count: criticalRisks.length, suffix: criticalRisks.length > 1 ? 's' : '' })}
              </span>
              <Button size='sm' variant='destructive'>
                {t('alerts.reviewNow')}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value='recommendations'>{t('tabs.recommendations')}</TabsTrigger>
          <TabsTrigger value='trends'>{t('tabs.trends')}</TabsTrigger>
          <TabsTrigger value='risks'>{t('tabs.risks')}</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          {/* Protection Areas Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <AnimatePresence>
              {protectionAreas.map(area => (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                >
                  <Card className='hover:shadow-lg transition-shadow'>
                    <CardHeader className='pb-2'>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='text-base'>{area.name}</CardTitle>
                        <div className='flex items-center gap-1'>
                          {getTrendIcon(area.trend, area.trendValue)}
                          <Badge className={getPriorityColor(area.priority)}>
                            {area.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div>
                          <div className='flex items-center justify-between text-sm mb-1'>
                            <span>{t('overview.protectionLevel')}</span>
                            <span className={getScoreColor(area.currentScore)}>
                              {area.currentScore}/{area.maxScore}
                            </span>
                          </div>
                          <Progress
                            value={(area.currentScore / area.maxScore) * 100}
                            className='h-2'
                          />
                        </div>

                        {area.trend !== 'stable' && (
                          <div className='flex items-center gap-1 text-xs'>
                            {area.trend === 'improving' ? (
                              <ArrowUp className='h-3 w-3 text-green-600' />
                            ) : (
                              <ArrowDown className='h-3 w-3 text-red-600' />
                            )}
                            <span
                              className={
                                area.trend === 'improving'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {Math.abs(area.trendValue)}%{' '}
                              {area.trend === 'improving'
                                ? t('overview.improvement')
                                : t('overview.decline')}
                            </span>
                          </div>
                        )}

                        <div className='space-y-1 text-xs text-gray-600'>
                          <div className='flex items-center justify-between'>
                            <span>{t('overview.risks')}</span>
                            <span className='font-medium'>
                              {area.risks.length}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span>{t('overview.recommendations')}</span>
                            <span className='font-medium'>
                              {
                                area.recommendations.filter(r => !r.completed)
                                  .length
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value='recommendations' className='space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Lightbulb className='h-5 w-5 text-yellow-600' />
            <h3 className='text-lg font-medium'>
              {t('recommendations.title')}
            </h3>
            <Badge variant='secondary'>{t('recommendations.powered')}</Badge>
          </div>

          <div className='space-y-3'>
            {topRecommendations.map((recommendation, index) => (
              <Card
                key={recommendation.id}
                className='hover:shadow-md transition-shadow'
              >
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Badge
                          className={getPriorityColor(recommendation.priority)}
                        >
                          {recommendation.priority}
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                          {recommendation.category.replace('-', ' ')}
                        </Badge>
                        <span className='text-xs text-gray-500'>
                          ~{recommendation.estimatedTime}
                        </span>
                      </div>
                      <h4 className='font-medium text-gray-900 mb-1'>
                        {recommendation.title}
                      </h4>
                      <p className='text-sm text-gray-600 mb-3'>
                        {recommendation.description}
                      </p>
                      <div className='flex items-center gap-4 text-xs text-gray-500'>
                        <div className='flex items-center gap-1'>
                          <Target className='h-3 w-3' />
                          {t('recommendations.impactScore', { score: recommendation.impactScore })}
                        </div>
                        <div className='flex items-center gap-1'>
                          <Star className='h-3 w-3 text-yellow-500' />
                          {t('recommendations.priority', { rank: index + 1 })}
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        onClick={() =>
                          onRecommendationAction?.(recommendation.id)
                        }
                        className='gap-2'
                      >
                        <Zap className='h-3 w-3' />
                        {t('recommendations.takeAction')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='trends' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>{t('trends.title')}</h3>
            <div className='flex gap-2'>
              {(['7d', '30d', '90d', '1y'] as const).map(timeframe => (
                <Button
                  key={timeframe}
                  size='sm'
                  variant={
                    selectedTimeframe === timeframe ? 'default' : 'outline'
                  }
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className='p-6'>
              <div className='h-64 flex items-center justify-center text-gray-500'>
                <div className='text-center'>
                  <PieChart className='h-12 w-12 mx-auto mb-2 text-gray-300' />
                  <p>{t('trends.placeholder')}</p>
                  <p className='text-sm'>
                    {t('trends.shows', { timeframe: selectedTimeframe })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <TrendingUp className='h-4 w-4 text-green-600' />
                  <span className='text-sm font-medium'>{t('trends.improving')}</span>
                </div>
                <div className='text-2xl font-bold text-green-600'>2</div>
                <p className='text-xs text-gray-500'>{t('trends.financialFamily')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Activity className='h-4 w-4 text-gray-600' />
                  <span className='text-sm font-medium'>{t('trends.stable')}</span>
                </div>
                <div className='text-2xl font-bold text-gray-600'>1</div>
                <p className='text-xs text-gray-500'>{t('trends.legal')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <TrendingDown className='h-4 w-4 text-red-600' />
                  <span className='text-sm font-medium'>{t('trends.declining')}</span>
                </div>
                <div className='text-2xl font-bold text-red-600'>1</div>
                <p className='text-xs text-gray-500'>{t('trends.healthcare')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='risks' className='space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <AlertTriangle className='h-5 w-5 text-red-600' />
            <h3 className='text-lg font-medium'>{t('risks.title')}</h3>
            <Badge variant='destructive'>{t('risks.criticalCount', { count: criticalRisks.length })}</Badge>
          </div>

          <div className='space-y-3'>
            {criticalRisks.map(risk => (
              <Card
                key={risk.id}
                className={`border-l-4 ${getSeverityColor(risk.severity)}`}
              >
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Badge className={getPriorityColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                          {risk.timeframe.replace('-', ' ')}
                        </Badge>
                        <span className='text-xs text-gray-500'>
                          {t('risks.affects', { list: risk.affected.join(', ') })}
                        </span>
                      </div>
                      <h4 className='font-medium text-gray-900 mb-1'>
                        {risk.description}
                      </h4>
                      <p className='text-sm text-gray-600 mb-2'>
                        <strong>{t('risks.impact')}</strong> {risk.impact}
                      </p>
                    </div>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => onRiskMitigation?.(risk.id)}
                      className='gap-2'
                    >
                      <Shield className='h-3 w-3' />
                      {t('risks.mitigate')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
