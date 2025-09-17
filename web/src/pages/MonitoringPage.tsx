
/**
 * Monitoring Dashboard Page
 * Phase 5A: Production Operations & DevOps
 */

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  HardDrive,
  Network,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { runHealthCheck } from '@/lib/monitoring/healthCheck';
import { getPerformanceMetrics } from '@/lib/monitoring/performance';
import { captureError } from '@/lib/monitoring/sentry';

interface SystemHealth {
  checks: Record<string, any>;
  overall: 'degraded' | 'healthy' | 'unhealthy';
  timestamp: number;
  uptime: number;
  version: string;
}

export default function MonitoringPage() {
  const [healthData, setHealthData] = useState<null | SystemHealth>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [health, performance] = await Promise.all([
        runHealthCheck(),
        Promise.resolve(getPerformanceMetrics()),
      ]);

      setHealthData(health);
      setPerformanceData(performance);
      // Mock session data since getSessionData is not available
      setSessionData({
        totalSessions: 0,
        activeUsers: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
      });
      setLastRefresh(new Date());
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        tags: { source: 'monitoring_page' },
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className='h-5 w-5 text-green-500' />;
      case 'degraded':
        return <AlertCircle className='h-5 w-5 text-yellow-500' />;
      default:
        return <AlertCircle className='h-5 w-5 text-red-500' />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge
            variant='outline'
            className='bg-green-50 text-green-700 border-green-200'
          >
            Healthy
          </Badge>
        );
      case 'degraded':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-50 text-yellow-700 border-yellow-200'
          >
            Degraded
          </Badge>
        );
      default:
        return (
          <Badge
            variant='outline'
            className='bg-red-50 text-red-700 border-red-200'
          >
            Unhealthy
          </Badge>
        );
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <DashboardLayout>
      <div className='container mx-auto p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              System Monitoring
            </h1>
            <p className='text-muted-foreground'>
              Real-time system health and performance monitoring
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='text-sm text-muted-foreground'>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <Button
              onClick={refreshData}
              disabled={isRefreshing}
              size='sm'
              variant='outline'
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Overall Health
              </CardTitle>
              <Activity className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-2'>
                {healthData && getStatusIcon(healthData.overall)}
                {healthData && getStatusBadge(healthData.overall)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Uptime</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {healthData ? formatUptime(healthData.uptime) : '--'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Memory Usage
              </CardTitle>
              <HardDrive className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {performanceData?.memory
                  ? `${Math.round((performanceData.memory.usedJSHeapSize / performanceData.memory.jsHeapSizeLimit) * 100)}%`
                  : '--'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Session Duration
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {sessionData
                  ? formatUptime(Date.now() - sessionData.startTime)
                  : '--'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Checks */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <CheckCircle2 className='h-5 w-5' />
              <span>Health Checks</span>
            </CardTitle>
            <CardDescription>
              Detailed system component health status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {healthData?.checks ? (
              <div className='space-y-4'>
                {Object.entries(healthData.checks).map(
                  ([name, check]: [string, any]) => (
                    <div
                      key={name}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex items-center space-x-3'>
                        {getStatusIcon(check.status)}
                        <div>
                          <div className='font-medium capitalize'>
                            {name.replace('_', ' ')}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {check.message}
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-medium'>
                          {check.duration}ms
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {new Date(check.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                No health check data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <TrendingUp className='h-5 w-5' />
                <span>Web Vitals</span>
              </CardTitle>
              <CardDescription>
                Core Web Vitals performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData?.webVitals ? (
                <div className='space-y-3'>
                  {Object.entries(performanceData.webVitals).map(
                    ([key, metric]: [string, any]) => (
                      <div
                        key={key}
                        className='flex items-center justify-between'
                      >
                        <div className='font-medium'>{key}</div>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm'>
                            {Math.round(metric.value)}ms
                          </span>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              metric.rating === 'good'
                                ? 'bg-green-500'
                                : metric.rating === 'needs-improvement'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  No Web Vitals data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <HardDrive className='h-5 w-5' />
                <span>Memory Details</span>
              </CardTitle>
              <CardDescription>
                Detailed memory usage information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData?.memory ? (
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Used Heap</span>
                    <span className='font-medium'>
                      {formatBytes(performanceData.memory.usedJSHeapSize)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Total Heap</span>
                    <span className='font-medium'>
                      {formatBytes(performanceData.memory.totalJSHeapSize)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Heap Limit</span>
                    <span className='font-medium'>
                      {formatBytes(performanceData.memory.jsHeapSizeLimit)}
                    </span>
                  </div>
                  <Separator />
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Usage</span>
                    <span
                      className={`font-medium ${
                        performanceData.memory.usedJSHeapSize /
                          performanceData.memory.jsHeapSizeLimit >
                        0.8
                          ? 'text-red-600'
                          : performanceData.memory.usedJSHeapSize /
                                performanceData.memory.jsHeapSizeLimit >
                              0.6
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}
                    >
                      {Math.round(
                        (performanceData.memory.usedJSHeapSize /
                          performanceData.memory.jsHeapSizeLimit) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  No memory data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Connection Info */}
        {performanceData?.connection && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Network className='h-5 w-5' />
                <span>Network Information</span>
              </CardTitle>
              <CardDescription>
                Current network connection details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div>
                  <div className='text-sm text-muted-foreground'>
                    Connection Type
                  </div>
                  <div className='font-medium'>
                    {performanceData.connection.effectiveType || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className='text-sm text-muted-foreground'>Downlink</div>
                  <div className='font-medium'>
                    {performanceData.connection.downlink} Mbps
                  </div>
                </div>
                <div>
                  <div className='text-sm text-muted-foreground'>RTT</div>
                  <div className='font-medium'>
                    {performanceData.connection.rtt}ms
                  </div>
                </div>
                <div>
                  <div className='text-sm text-muted-foreground'>Save Data</div>
                  <div className='font-medium'>
                    {performanceData.connection.saveData ? 'On' : 'Off'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
