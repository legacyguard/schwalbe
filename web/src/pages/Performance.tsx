/**
 * Performance Monitoring Page
 * Main page for the performance dashboard
 */

import { PerformanceDashboard } from '@/components/monitoring/PerformanceDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PerformancePage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            {t('performance.title', 'Performance Monitoring')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('performance.subtitle', 'Monitor your application performance in real-time')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('performance.export', 'Export Report')}
          </Button>
          <Button variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            {t('performance.optimize', 'Optimization Tips')}
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('performance.status', 'System Status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {t('performance.operational', 'Operational')}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('performance.allSystems', 'All systems running normally')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('performance.monitoring', 'Monitoring')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {t('performance.active', 'Active')}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('performance.realTime', 'Real-time data collection')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('performance.lastUpdate', 'Last Update')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('performance.autoRefresh', 'Auto-refreshing every 30s')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Dashboard */}
      <PerformanceDashboard />

      {/* Footer Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('performance.about', 'About Performance Monitoring')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-1">
                {t('performance.webVitals', 'Web Vitals')}
              </h4>
              <p>
                {t('performance.webVitalsDesc', 
                  'Core Web Vitals are a set of metrics that measure real-world user experience for loading performance, interactivity, and visual stability of the page.'
                )}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">
                {t('performance.bundleAnalysis', 'Bundle Analysis')}
              </h4>
              <p>
                {t('performance.bundleAnalysisDesc',
                  'Monitor your JavaScript bundle size to ensure optimal loading performance. Large bundles can significantly impact page load times.'
                )}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">
                {t('performance.realUserMonitoring', 'Real User Monitoring')}
              </h4>
              <p>
                {t('performance.rumDesc',
                  'RUM collects performance data from actual users in production, providing insights into real-world performance experiences.'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
