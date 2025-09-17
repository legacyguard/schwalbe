/**
 * Performance Monitoring Dashboard
 * Real-time view of RUM metrics, bundle analysis, and performance trends
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';
import { rumMonitor } from '@/lib/monitoring/rum';
import { getBundleReport } from '@/lib/monitoring/bundle-analyzer';
import { monitoringAPI } from '@/lib/monitoring/api-client';
import { useUser } from '@clerk/clerk-react';

interface PerformanceMetrics {
  webVitals: {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    fcp: number | null;
    ttfb: number | null;
  };
  bundleMetrics: {
    totalSize: number;
    gzipSize: number;
    chunkCount: number;
    largestChunk: string;
    largestChunkSize: number;
  };
  trends: {
    loadTime: number[];
    bundleSize: number[];
    errorRate: number[];
  };
  alerts: Array<{
    id: string;
    type: string;
    severity: 'warning' | 'error';
    message: string;
    timestamp: number;
  }>;
}

export function PerformanceDashboard() {
  const { user } = useUser();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    webVitals: {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
    },
    bundleMetrics: {
      totalSize: 0,
      gzipSize: 0,
      chunkCount: 0,
      largestChunk: '',
      largestChunkSize: 0,
    },
    trends: {
      loadTime: [],
      bundleSize: [],
      errorRate: [],
    },
    alerts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
    return undefined;
  }, [selectedTimeRange, autoRefresh, user]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);

      // Get RUM metrics from API
      const rumResponse = await monitoringAPI.getRUMMetrics(selectedTimeRange);
      const rumData = rumResponse.success ? rumResponse.data : null;

      // Get bundle metrics
      const bundleResponse = await monitoringAPI.getBundleMetrics();
      const bundleData = bundleResponse.success ? bundleResponse.data : getBundleReport();

      // Get current RUM metrics from monitor
      const currentMetrics = rumMonitor.getSessionMetrics();
      const latestMetric = currentMetrics[currentMetrics.length - 1];

      setMetrics({
        webVitals: {
          lcp: latestMetric?.lcp || rumData?.avgLCP || null,
          fid: latestMetric?.fid || rumData?.avgFID || null,
          cls: latestMetric?.cls || rumData?.avgCLS || null,
          fcp: latestMetric?.fcp || null,
          ttfb: latestMetric?.ttfb || rumData?.avgTTFB || null,
        },
        bundleMetrics: {
          totalSize: bundleData.totalSize,
          gzipSize: bundleData.gzipSize,
          chunkCount: bundleData.chunkCount,
          largestChunk: bundleData.largestChunk,
          largestChunkSize: bundleData.largestChunkSize,
        },
        trends: {
          loadTime: rumData ? [rumData.avgPageLoadTime] : [],
          bundleSize: [bundleData.totalSize],
          errorRate: rumData ? [rumData.totalErrors] : [],
        },
        alerts: generateAlerts(rumData, bundleData),
      });

    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAlerts = (rumData: any, bundleData: any): PerformanceMetrics['alerts'] => {
    const alerts: PerformanceMetrics['alerts'] = [];

    // Web Vitals alerts
    if (rumData?.avgLCP > 4000) {
      alerts.push({
        id: 'lcp-alert',
        type: 'LCP',
        severity: rumData.avgLCP > 6000 ? 'error' : 'warning',
        message: `Largest Contentful Paint is ${rumData.avgLCP.toFixed(0)}ms (target: <2500ms)`,
        timestamp: Date.now(),
      });
    }

    if (rumData?.avgFID > 100) {
      alerts.push({
        id: 'fid-alert',
        type: 'FID',
        severity: rumData.avgFID > 300 ? 'error' : 'warning',
        message: `First Input Delay is ${rumData.avgFID.toFixed(0)}ms (target: <100ms)`,
        timestamp: Date.now(),
      });
    }

    if (rumData?.avgCLS > 0.1) {
      alerts.push({
        id: 'cls-alert',
        type: 'CLS',
        severity: rumData.avgCLS > 0.25 ? 'error' : 'warning',
        message: `Cumulative Layout Shift is ${rumData.avgCLS.toFixed(3)} (target: <0.1)`,
        timestamp: Date.now(),
      });
    }

    // Bundle size alerts
    if (bundleData.totalSize > 500 * 1024) { // 500KB
      alerts.push({
        id: 'bundle-size-alert',
        type: 'BundleSize',
        severity: bundleData.totalSize > 1024 * 1024 ? 'error' : 'warning',
        message: `Bundle size is ${(bundleData.totalSize / 1024).toFixed(1)}KB (target: <500KB)`,
        timestamp: Date.now(),
      });
    }

    return alerts;
  };

  const getWebVitalsColor = (value: number | null, threshold: number, goodThreshold: number) => {
    if (value === null) return 'text-gray-500';
    if (value <= goodThreshold) return 'text-green-600';
    if (value <= threshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of your application's performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
          </Button>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Alerts */}
      {metrics.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Performance Alerts
          </h3>
          {metrics.alerts.map(alert => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.severity === 'error' ? 'border-l-red-500' : 'border-l-yellow-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.severity === 'error' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{alert.type}</span>
                  </div>
                  <Badge variant={alert.severity === 'error' ? 'destructive' : 'secondary'}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="web-vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="bundle">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="web-vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LCP */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest Contentful Paint</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  getWebVitalsColor(metrics.webVitals.lcp, 4000, 2500)
                }`}>
                  {metrics.webVitals.lcp ? `${metrics.webVitals.lcp.toFixed(0)}ms` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {'<2500ms (Good), <4000ms (Needs Improvement)'}
                </p>
                {metrics.webVitals.lcp && (
                  <Progress 
                    value={Math.min((metrics.webVitals.lcp / 4000) * 100, 100)} 
                    className="mt-2"
                  />
                )}
              </CardContent>
            </Card>

            {/* FID */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First Input Delay</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  getWebVitalsColor(metrics.webVitals.fid, 300, 100)
                }`}>
                  {metrics.webVitals.fid ? `${metrics.webVitals.fid.toFixed(0)}ms` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {'<100ms (Good), <300ms (Needs Improvement)'}
                </p>
                {metrics.webVitals.fid && (
                  <Progress 
                    value={Math.min((metrics.webVitals.fid / 300) * 100, 100)} 
                    className="mt-2"
                  />
                )}
              </CardContent>
            </Card>

            {/* CLS */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cumulative Layout Shift</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  getWebVitalsColor(metrics.webVitals.cls, 0.25, 0.1)
                }`}>
                  {metrics.webVitals.cls ? metrics.webVitals.cls.toFixed(3) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {'<0.1 (Good), <0.25 (Needs Improvement)'}
                </p>
                {metrics.webVitals.cls && (
                  <Progress 
                    value={Math.min((metrics.webVitals.cls / 0.25) * 100, 100)} 
                    className="mt-2"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bundle" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Bundle Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatBytes(metrics.bundleMetrics.totalSize)}</div>
                <p className="text-sm text-muted-foreground">
                  Gzipped: {formatBytes(metrics.bundleMetrics.gzipSize)}
                </p>
                <Progress 
                  value={Math.min((metrics.bundleMetrics.totalSize / (500 * 1024)) * 100, 100)} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {'<500KB (Current: ' + (metrics.bundleMetrics.totalSize / 1024).toFixed(1) + 'KB)'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chunk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Chunks:</span>
                    <span className="font-medium">{metrics.bundleMetrics.chunkCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Largest Chunk:</span>
                    <span className="font-medium">{metrics.bundleMetrics.largestChunk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Largest Size:</span>
                    <span className="font-medium">{formatBytes(metrics.bundleMetrics.largestChunkSize)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Load Time Trend</h4>
                  <div className="flex items-center gap-2">
                    {metrics.trends.loadTime.length > 1 ? (
                      <>
                        {metrics.trends.loadTime[metrics.trends.loadTime.length - 1] > 
                         metrics.trends.loadTime[metrics.trends.loadTime.length - 2] ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm">
                          {metrics.trends.loadTime[metrics.trends.loadTime.length - 1]?.toFixed(0)}ms
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Insufficient data</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Bundle Size Trend</h4>
                  <div className="flex items-center gap-2">
                    {metrics.trends.bundleSize.length > 1 ? (
                      <>
                        {metrics.trends.bundleSize[metrics.trends.bundleSize.length - 1] > 
                         metrics.trends.bundleSize[metrics.trends.bundleSize.length - 2] ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm">
                          {formatBytes(metrics.trends.bundleSize[metrics.trends.bundleSize.length - 1])}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Insufficient data</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={loadMetrics}>
          Refresh Data
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.open('/api/analytics/rum?timeRange=24h', '_blank')}>
          Export Raw Data
        </Button>
        <Button variant="outline" size="sm" onClick={() => {
          const report = getBundleReport();
          console.log('Bundle Analysis Report:', report);
          alert('Bundle report logged to console');
        }}>
          Analyze Bundle
        </Button>
      </div>
    </div>
  );
}