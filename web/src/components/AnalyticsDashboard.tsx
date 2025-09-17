
import React, { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
  CheckCircle,
  DollarSign,
  Loader2,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { supabase } from '@hollywood/shared';
import { useTranslation } from 'react-i18next';

interface MetricCard {
  change: number;
  color: string;
  icon: React.ReactNode;
  title: string;
  value: number | string;
}

interface SubscriptionMetrics {
  arr: number;
  cancellations: number;
  churn_rate: number;
  date: string;
  essential_users: number;
  family_users: number;
  free_users: number;
  mrr: number;
  new_subscriptions: number;
  premium_users: number;
  total_users: number;
}

interface SystemHealth {
  error_rate: number;
  response_time_ms: number;
  service_name: string;
  status: 'degraded' | 'down' | 'healthy';
}

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SubscriptionMetrics[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [currentMetrics, setCurrentMetrics] = useState<MetricCard[]>([]);
  const { t } = useTranslation('ui/analytics-dashboard');

  const loadAnalytics = useCallback(async () => {
    try {
      // Load subscription metrics
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: metricsData, error: metricsError } = await supabase
        .from('subscription_metrics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (!metricsError && metricsData) {
        setMetrics(metricsData);
        calculateCurrentMetrics(metricsData);
      }

      // Load system health
      const { data: healthData, error: healthError } = await supabase
        .from('system_health')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(10);

      if (!healthError && healthData) {
        // Group by service and get latest status
        const latestHealth = healthData.reduce((acc: SystemHealth[], curr) => {
          const existing = acc.find(h => h.service_name === curr.service_name);
          if (!existing) {
            acc.push(curr);
          }
          return acc;
        }, []);
        setSystemHealth(latestHealth);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [dateRange, loadAnalytics]);

  const calculateCurrentMetrics = (data: SubscriptionMetrics[]) => {
    if (data.length === 0) return;

    const latest = data[data.length - 1] || null;
    const previous = data.length > 1 ? data[data.length - 2] : latest;

    const metrics: MetricCard[] = [
      {
        title: t('metrics.totalUsers'),
        value: (latest?.total_users || 0).toLocaleString(),
        change:
          (((latest?.total_users || 0) - (previous?.total_users || 0)) /
            ((previous?.total_users || 1))) *
          100,
        icon: <Users className='w-6 h-6' />,
        color: '#667eea',
      },
      {
        title: t('metrics.mrr'),
        value: `$${(latest?.mrr || 0).toLocaleString()}`,
        change: (((latest?.mrr || 0) - (previous?.mrr || 0)) / ((previous?.mrr || 1))) * 100,
        icon: <DollarSign className='w-6 h-6' />,
        color: '#48bb78',
      },
      {
        title: t('metrics.churnRate'),
        value: `${(latest?.churn_rate || 0).toFixed(1)}%`,
        change: (latest?.churn_rate || 0) - (previous?.churn_rate || 0),
        icon: <Activity className='w-6 h-6' />,
        color: (latest?.churn_rate || 0) > 5 ? '#f56565' : '#48bb78',
      },
      {
        title: t('metrics.newSubscriptions'),
        value: latest?.new_subscriptions || 0,
        change:
          (((latest?.new_subscriptions || 0) - (previous?.new_subscriptions || 0)) /
            ((previous?.new_subscriptions || 1))) *
          100,
        icon: <TrendingUp className='w-6 h-6' />,
        color: '#4299e1',
      },
    ];

    setCurrentMetrics(metrics);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const planDistribution =
    metrics.length > 0
      ? [
          {
            name: t('plans.free'),
            value: metrics[metrics.length - 1]?.free_users || 0,
            color: '#cbd5e0',
          },
          {
            name: t('plans.essential'),
            value: metrics[metrics.length - 1]?.essential_users || 0,
            color: '#4299e1',
          },
          {
            name: t('plans.family'),
            value: metrics[metrics.length - 1]?.family_users || 0,
            color: '#48bb78',
          },
          {
            name: t('plans.premium'),
            value: metrics[metrics.length - 1]?.premium_users || 0,
            color: '#667eea',
          },
        ]
      : [];

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'degraded':
        return <AlertCircle className='w-5 h-5 text-yellow-500' />;
      case 'down':
        return <XCircle className='w-5 h-5 text-red-500' />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  return (
    <div className='p-6 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            {t('header.title')}
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-2'>
            {t('header.subtitle')}
          </p>
        </div>

        {/* Date Range Selector */}
        <div className='mb-6 flex gap-2'>
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t(`dateRange.${range}`)}
            </button>
          ))}
        </div>

        {/* Metric Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {currentMetrics.map(metric => (
            <div
              key={metric.title}
              className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'
            >
              <div className='flex items-center justify-between mb-4'>
                <div
                  className='p-2 rounded-lg'
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <div style={{ color: metric.color }}>{metric.icon}</div>
                </div>
                <div
                  className={`flex items-center text-sm font-medium ${
                    metric.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {metric.change > 0 ? (
                    <TrendingUp className='w-4 h-4 mr-1' />
                  ) : (
                    <TrendingDown className='w-4 h-4 mr-1' />
                  )}
                  {Math.abs(metric.change).toFixed(1)}%
                </div>
              </div>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {metric.value}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                {metric.title}
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Revenue Chart */}
          <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              {t('charts.revenueTrend')}
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis
                  dataKey='date'
                  tickFormatter={formatDate}
                  stroke='#9ca3af'
                />
                <YAxis stroke='#9ca3af' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Area
                  type='monotone'
                  dataKey='mrr'
                  stroke='#667eea'
                  fill='#667eea'
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Chart */}
          <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              {t('charts.userGrowth')}
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis
                  dataKey='date'
                  tickFormatter={formatDate}
                  stroke='#9ca3af'
                />
                <YAxis stroke='#9ca3af' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Line
                  type='monotone'
                  dataKey='total_users'
                  stroke='#48bb78'
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type='monotone'
                  dataKey='new_subscriptions'
                  stroke='#4299e1'
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type='monotone'
                  dataKey='cancellations'
                  stroke='#f56565'
                  strokeWidth={2}
                  dot={false}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Plan Distribution */}
          <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              {t('charts.planDistribution')}
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={entry => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Churn Rate */}
          <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              {t('metrics.churnRate')}
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis
                  dataKey='date'
                  tickFormatter={formatDate}
                  stroke='#9ca3af'
                />
                <YAxis stroke='#9ca3af' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar
                  dataKey='churn_rate'
                  fill='#f56565'
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            {t('charts.systemHealth')}
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {systemHealth.map(service => (
              <div
                key={service.service_name}
                className='flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  {getHealthIcon(service.status)}
                  <div>
                    <div className='font-medium text-gray-900 dark:text-white'>
                      {service.service_name}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      {t('system.response', { ms: service.response_time_ms })} •{' '}
                      {t('system.errors', { percent: service.error_rate.toFixed(1) })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
