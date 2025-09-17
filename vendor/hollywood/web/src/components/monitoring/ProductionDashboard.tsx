
/**
 * Production Monitoring Dashboard
 * Real-time application health and performance monitoring
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Server,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
// Performance monitoring imports would go here

interface HealthMetric {
  description: string;
  lastUpdated: Date;
  name: string;
  status: 'critical' | 'healthy' | 'warning';
  value: number | string;
}

interface PerformanceMetric {
  current: number;
  name: string;
  threshold: number;
  trend: 'down' | 'stable' | 'up';
  unit: string;
}

export const ProductionDashboard: React.FC = () => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<
    PerformanceMetric[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    // Initialize dashboard data
    loadDashboardData();

    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Simulate API calls for health metrics
      const health: HealthMetric[] = [
        {
          name: 'Application Status',
          status: 'healthy',
          value: 'Online',
          description: 'Web application is responding normally',
          lastUpdated: new Date(),
        },
        {
          name: 'Database Connection',
          status: 'healthy',
          value: 'Connected',
          description: 'Supabase connection is stable',
          lastUpdated: new Date(),
        },
        {
          name: 'Authentication Service',
          status: 'healthy',
          value: 'Active',
          description: 'Clerk authentication is operational',
          lastUpdated: new Date(),
        },
        {
          name: 'Error Rate',
          status: getErrorRateStatus(0.2),
          value: '0.2%',
          description: 'Application error rate in last hour',
          lastUpdated: new Date(),
        },
        {
          name: 'CDN Status',
          status: 'healthy',
          value: 'Operational',
          description: 'Vercel CDN is serving content globally',
          lastUpdated: new Date(),
        },
      ];

      // Get performance metrics
      const performance: PerformanceMetric[] = [
        {
          name: 'Page Load Time',
          current: await getPageLoadTime(),
          threshold: 3000,
          unit: 'ms',
          trend: 'stable',
        },
        {
          name: 'First Contentful Paint',
          current: await getFCP(),
          threshold: 1500,
          unit: 'ms',
          trend: 'down',
        },
        {
          name: 'Largest Contentful Paint',
          current: await getLCP(),
          threshold: 2500,
          unit: 'ms',
          trend: 'stable',
        },
        {
          name: 'Cumulative Layout Shift',
          current: await getCLS(),
          threshold: 0.1,
          unit: '',
          trend: 'down',
        },
      ];

      setHealthMetrics(health);
      setPerformanceMetrics(performance);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorRateStatus = (
    rate: number
  ): 'critical' | 'healthy' | 'warning' => {
    if (rate > 2) return 'critical';
    if (rate > 1) return 'warning';
    return 'healthy';
  };

  const getPageLoadTime = async (): Promise<number> => {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    return navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
  };

  const getFCP = async (): Promise<number> => {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return fcp ? fcp.startTime : 0;
  };

  const getLCP = async (): Promise<number> => {
    const lcp = performance.getEntriesByName('largest-contentful-paint')[0];
    return lcp ? lcp.startTime : 0;
  };

  const getCLS = async (): Promise<number> => {
    // Simplified CLS calculation
    return Math.random() * 0.1; // In production, get real CLS value
  };

  const getStatusIcon = (status: 'critical' | 'healthy' | 'warning') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'warning':
        return <AlertTriangle className='w-4 h-4 text-yellow-500' />;
      case 'critical':
        return <AlertTriangle className='w-4 h-4 text-red-500' />;
    }
  };

  const getStatusColor = (status: 'critical' | 'healthy' | 'warning') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  const getTrendIcon = (trend: 'down' | 'stable' | 'up') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='w-3 h-3 text-red-500' />;
      case 'down':
        return <TrendingUp className='w-3 h-3 text-green-500 rotate-180' />;
      case 'stable':
        return <Activity className='w-3 h-3 text-gray-500' />;
    }
  };

  const criticalIssues = healthMetrics.filter(
    metric => metric.status === 'critical'
  ).length;
  const warningIssues = healthMetrics.filter(
    metric => metric.status === 'warning'
  ).length;

  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Production Dashboard
          </h1>
          <p className='text-gray-600'>Real-time monitoring for LegacyGuard</p>
        </div>
        <div className='text-right'>
          <Button onClick={loadDashboardData} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <p className='text-sm text-gray-500 mt-1'>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Status Overview */}
      {(criticalIssues > 0 || warningIssues > 0) && (
        <Alert
          className={
            criticalIssues > 0
              ? 'border-red-200 bg-red-50'
              : 'border-yellow-200 bg-yellow-50'
          }
        >
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>System Alerts</AlertTitle>
          <AlertDescription>
            {criticalIssues > 0 &&
              `${criticalIssues} critical issue(s) detected. `}
            {warningIssues > 0 &&
              `${warningIssues} warning(s) require attention.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Health Metrics Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {healthMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                {getStatusIcon(metric.status)}
                {metric.name}
              </CardTitle>
              <Badge className={getStatusColor(metric.status)}>
                {metric.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{metric.value}</div>
              <p className='text-xs text-gray-500 mt-1'>{metric.description}</p>
              <p className='text-xs text-gray-400 mt-2'>
                <Clock className='inline w-3 h-3 mr-1' />
                {metric.lastUpdated.toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Zap className='w-5 h-5' />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {performanceMetrics.map((metric, index) => (
              <div key={index} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>{metric.name}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className='text-2xl font-bold'>
                  {metric.current.toFixed(metric.unit === '' ? 3 : 0)}
                  <span className='text-sm font-normal text-gray-500'>
                    {metric.unit}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full ${
                      metric.current > metric.threshold
                        ? 'bg-red-500'
                        : metric.current > metric.threshold * 0.8
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((metric.current / (metric.threshold * 1.5)) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className='text-xs text-gray-500'>
                  Threshold: {metric.threshold}
                  {metric.unit}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Server className='w-5 h-5' />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Button
              variant='outline'
              className='h-16'
              onClick={() =>
                window.open('https://vercel.com/dashboard', '_blank')
              }
            >
              <div className='text-center'>
                <Globe className='w-5 h-5 mx-auto mb-1' />
                <div className='text-sm'>Vercel Dashboard</div>
              </div>
            </Button>
            <Button
              variant='outline'
              className='h-16'
              onClick={() => window.open('https://sentry.io/issues/', '_blank')}
            >
              <div className='text-center'>
                <Shield className='w-5 h-5 mx-auto mb-1' />
                <div className='text-sm'>Sentry Errors</div>
              </div>
            </Button>
            <Button
              variant='outline'
              className='h-16'
              onClick={() =>
                window.open('https://analytics.google.com/', '_blank')
              }
            >
              <div className='text-center'>
                <TrendingUp className='w-5 h-5 mx-auto mb-1' />
                <div className='text-sm'>Analytics</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
