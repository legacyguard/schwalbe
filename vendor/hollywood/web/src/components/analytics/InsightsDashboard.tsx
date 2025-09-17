
/**
 * Document Insights Analytics Dashboard
 * Phase 6: AI Intelligence & Document Analysis
 *
 * Comprehensive dashboard for document analytics, security insights,
 * usage patterns, and actionable recommendations.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  HardDrive,
  RefreshCw,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  type AnalyticsFilter,
  documentInsightsService,
  type InsightsDashboardData,
  type SecurityRecommendation,
} from '@/lib/ai/documentInsights';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
];

interface InsightsDashboardProps {
  className?: string;
}

export default function InsightsDashboard({
  className,
}: InsightsDashboardProps) {
  const { t } = useTranslation('ui/insights-dashboard');
  const [dashboardData, setDashboardData] =
    useState<InsightsDashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<
    SecurityRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter] = useState<AnalyticsFilter>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [data, recs] = await Promise.all([
        documentInsightsService.getDashboardData(filter),
        documentInsightsService.getRecommendations(filter),
      ]);
      setDashboardData(data);
      setRecommendations(recs);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatBytes = (bytes: number): string => {
    const sizes = [t('units.bytes'), t('units.kb'), t('units.mb'), t('units.gb')];
    if (bytes === 0) return `0 ${t('units.bytes')}`;
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const data = await documentInsightsService.exportInsights(format, filter);
      const blob = new Blob([data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insights-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground' />
          <p className='text-muted-foreground'>Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className='text-center py-12'>
        <AlertCircle className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
        <p className='text-muted-foreground'>Failed to load dashboard data</p>
        <Button onClick={loadDashboardData} className='mt-4'>
          Try Again
        </Button>
      </div>
    );
  }

  const categoryChartData = Object.entries(
    dashboardData.overview.categoryDistribution
  ).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: CHART_COLORS[
      Object.keys(dashboardData.overview.categoryDistribution).indexOf(name) %
        CHART_COLORS.length
    ],
  }));

  const storageGrowthData = dashboardData.trends.storageGrowth.map(item => ({
    ...item,
    sizeGB: item.size / (1024 * 1024 * 1024),
  }));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('title')}
          </h2>
          <p className='text-muted-foreground'>
            {t('description')}
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <span className='text-sm text-muted-foreground'>
            {t('labels.lastUpdated', { time: lastRefresh.toLocaleTimeString() })}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={loadDashboardData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')}
            />
            {t('buttons.refresh')}
          </Button>
          <Button variant='outline' size='sm' onClick={() => exportData('csv')}>
            <Download className='h-4 w-4 mr-2' />
            {t('buttons.export')}
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('metrics.totalDocuments')}
            </CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatNumber(dashboardData.overview.totalDocuments)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {dashboardData.overview.documentsThisMonth > 0 && (
                <span className='text-green-600'>
                  +{dashboardData.overview.documentsThisMonth} this month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('metrics.storageUsed')}</CardTitle>
            <HardDrive className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatBytes(dashboardData.overview.totalSize)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {dashboardData.overview.growthRate > 0 && (
                <span className='text-green-600'>
                  +{dashboardData.overview.growthRate.toFixed(1)}% growth
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('metrics.securityScore')}
            </CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                getHealthColor(dashboardData.security.complianceScore)
              )}
            >
              {dashboardData.security.complianceScore}%
            </div>
            <p className='text-xs text-muted-foreground'>
              {dashboardData.security.recommendations.length} recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Health Score</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                getHealthColor(dashboardData.health.healthScore)
              )}
            >
              {dashboardData.health.healthScore}%
            </div>
            <p className='text-xs text-muted-foreground'>
              {dashboardData.health.issues.length} issues found
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='usage'>Usage</TabsTrigger>
          <TabsTrigger value='health'>Health</TabsTrigger>
          <TabsTrigger value='trends'>Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Document Categories</CardTitle>
                <CardDescription>
                  Distribution of documents by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Storage Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Growth</CardTitle>
                <CardDescription>
                  Storage usage over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart data={storageGrowthData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip formatter={value => [`${value} GB`, 'Storage']} />
                    <Area
                      type='monotone'
                      dataKey='sizeGB'
                      stroke='#8884d8'
                      fill='#8884d8'
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Preview */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Zap className='h-5 w-5' />
                <span>Top Recommendations</span>
              </CardTitle>
              <CardDescription>
                Priority actions to improve your document management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div
                    key={index}
                    className='flex items-start space-x-3 p-4 border rounded-lg'
                  >
                    <AlertTriangle
                      className={cn('h-5 w-5 mt-0.5', {
                        'text-red-500': rec.severity === 'critical',
                        'text-orange-500': rec.severity === 'high',
                        'text-yellow-500': rec.severity === 'medium',
                        'text-blue-500': rec.severity === 'low',
                      })}
                    />
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-medium'>{rec.title}</h4>
                        <Badge
                          variant='outline'
                          className={getSeverityColor(rec.severity)}
                        >
                          {rec.severity}
                        </Badge>
                      </div>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {rec.description}
                      </p>
                      <p className='text-xs text-muted-foreground mt-2'>
                        Est. time: {rec.estimatedTime} •{' '}
                        {rec.documentIds.length} documents affected
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value='security' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>PII Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-orange-600'>
                  {dashboardData.security.documentsWithPII}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Documents contain PII
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Unprotected Docs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-red-600'>
                  {dashboardData.security.documentsWithoutPasswords}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Need password protection
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-yellow-600'>
                  {dashboardData.security.documentsNearingExpiry}
                </div>
                <p className='text-xs text-muted-foreground'>Within 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Security Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Actions to improve your document security posture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {recommendations.map((rec, index) => (
                  <div key={index} className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center space-x-2'>
                        <AlertTriangle
                          className={cn('h-4 w-4', {
                            'text-red-500': rec.severity === 'critical',
                            'text-orange-500': rec.severity === 'high',
                            'text-yellow-500': rec.severity === 'medium',
                            'text-blue-500': rec.severity === 'low',
                          })}
                        />
                        <h4 className='font-medium'>{rec.title}</h4>
                        <Badge
                          variant='outline'
                          className={getSeverityColor(rec.severity)}
                        >
                          {rec.severity}
                        </Badge>
                      </div>
                      <span className='text-sm text-muted-foreground'>
                        {rec.estimatedTime}
                      </span>
                    </div>
                    <p className='text-sm text-muted-foreground mb-2'>
                      {rec.description}
                    </p>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-muted-foreground'>
                        {rec.documentIds.length} documents affected
                      </span>
                      {rec.actionRequired && (
                        <Badge variant='outline' className='text-red-600'>
                          Action Required
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value='usage' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Most Active Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Patterns</CardTitle>
                <CardDescription>
                  When you're most active with document management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <h4 className='text-sm font-medium mb-2'>
                      Most Active Hours
                    </h4>
                    <div className='flex space-x-2'>
                      {dashboardData.usage.mostActiveHours.map(hour => (
                        <Badge key={hour} variant='outline'>
                          {hour}:00
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className='text-sm font-medium mb-2'>
                      Most Active Days
                    </h4>
                    <div className='flex space-x-2'>
                      {dashboardData.usage.mostActiveDays.map(day => (
                        <Badge key={day} variant='outline'>
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className='text-sm font-medium mb-2'>Top Categories</h4>
                    <div className='flex flex-wrap gap-2'>
                      {dashboardData.usage.frequentlyAccessedCategories.map(
                        category => (
                          <Badge key={category} variant='outline'>
                            {category}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Behavior */}
            <Card>
              <CardHeader>
                <CardTitle>Session Analytics</CardTitle>
                <CardDescription>
                  Your document management behavior patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Avg. Session Duration
                    </span>
                    <span className='font-medium'>
                      {dashboardData.usage.userBehavior.averageSessionDuration}{' '}
                      min
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Documents per Session
                    </span>
                    <span className='font-medium'>
                      {dashboardData.usage.userBehavior.documentsPerSession}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Searches per Session
                    </span>
                    <span className='font-medium'>
                      {dashboardData.usage.userBehavior.searchesPerSession}
                    </span>
                  </div>
                  <Separator />
                  <div>
                    <h4 className='text-sm font-medium mb-2'>
                      Most Common Actions
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {dashboardData.usage.userBehavior.mostCommonActions.map(
                        action => (
                          <Badge key={action} variant='outline'>
                            {action}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Trends</CardTitle>
              <CardDescription>
                Document upload patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart
                  data={dashboardData.usage.uploadTrends.daily.map(
                    (count, index) => ({
                      day: `Day ${index + 1}`,
                      uploads: count,
                    })
                  )}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='day' />
                  <YAxis />
                  <Tooltip />
                  <Line type='monotone' dataKey='uploads' stroke='#8884d8' />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value='health' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>System Health Score</CardTitle>
                <CardDescription>
                  Overall health of your document collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center'>
                  <div
                    className={cn(
                      'text-4xl font-bold mb-2',
                      getHealthColor(dashboardData.health.healthScore)
                    )}
                  >
                    {dashboardData.health.healthScore}%
                  </div>
                  <Progress
                    value={dashboardData.health.healthScore}
                    className='w-full'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues Summary</CardTitle>
                <CardDescription>
                  Breakdown of health issues found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Total Issues</span>
                    <span className='font-medium'>
                      {dashboardData.health.issues.length}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Duplicates</span>
                    <span className='font-medium'>
                      {dashboardData.health.duplicates.length}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Large Files</span>
                    <span className='font-medium'>
                      {dashboardData.health.largeSizeWarnings.length}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Old Documents</span>
                    <span className='font-medium'>
                      {dashboardData.health.oldDocuments.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Health Issues</CardTitle>
              <CardDescription>
                Specific issues that need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {dashboardData.health.issues.slice(0, 10).map(issue => (
                  <div
                    key={issue.id}
                    className='flex items-start space-x-3 p-3 border rounded-lg'
                  >
                    <AlertCircle
                      className={cn('h-4 w-4 mt-0.5', {
                        'text-red-500': issue.severity === 'high',
                        'text-yellow-500': issue.severity === 'medium',
                        'text-blue-500': issue.severity === 'low',
                      })}
                    />
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-medium text-sm'>
                          {issue.description}
                        </h4>
                        <Badge
                          variant='outline'
                          className={getSeverityColor(issue.severity)}
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {issue.resolution}
                      </p>
                      {issue.autoFixable && (
                        <Badge
                          variant='outline'
                          className='text-green-600 mt-2'
                        >
                          Auto-fixable
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value='trends' className='space-y-6'>
          {/* Category Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Category Trends</CardTitle>
              <CardDescription>
                How different document categories are trending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {dashboardData.trends.categoryTrends.map(trend => (
                  <div
                    key={trend.category}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div className='flex items-center space-x-3'>
                      <div
                        className={cn('w-3 h-3 rounded-full', {
                          'bg-green-500': trend.trend === 'up',
                          'bg-gray-500': trend.trend === 'stable',
                          'bg-red-500': trend.trend === 'down',
                        })}
                      />
                      <span className='font-medium capitalize'>
                        {trend.category}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={cn('text-sm font-medium', {
                          'text-green-600': trend.change > 0,
                          'text-gray-600': trend.change === 0,
                          'text-red-600': trend.change < 0,
                        })}
                      >
                        {trend.change > 0 ? '+' : ''}
                        {trend.change.toFixed(1)}%
                      </span>
                      <TrendingUp
                        className={cn('h-4 w-4', {
                          'text-green-500 rotate-0': trend.trend === 'up',
                          'text-gray-500 rotate-90': trend.trend === 'stable',
                          'text-red-500 rotate-180': trend.trend === 'down',
                        })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Security Score Trends</CardTitle>
              <CardDescription>
                Security score and issues over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={dashboardData.trends.securityTrends}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type='monotone'
                    dataKey='score'
                    stroke='#00C49F'
                    strokeWidth={2}
                  />
                  <Line
                    type='monotone'
                    dataKey='issues'
                    stroke='#FF8042'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Predictions */}
          <Card>
            <CardHeader>
              <CardTitle>Predictions & Forecasts</CardTitle>
              <CardDescription>
                Projected needs based on current trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Storage Needed (Next Month)
                    </span>
                    <span className='font-medium'>
                      {dashboardData.predictions.storageNeeded} GB
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Expected Documents
                    </span>
                    <span className='font-medium'>
                      {dashboardData.predictions.documentsExpected}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Estimated Cost
                    </span>
                    <span className='font-medium'>
                      ${dashboardData.predictions.costProjection}/mo
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className='text-sm font-medium mb-2'>
                    Maintenance Required
                  </h4>
                  <div className='space-y-1'>
                    {dashboardData.predictions.maintenanceRequired.map(
                      (item, index) => (
                        <div
                          key={index}
                          className='text-sm text-muted-foreground flex items-center space-x-2'
                        >
                          <CheckCircle2 className='h-3 w-3' />
                          <span>{item}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
