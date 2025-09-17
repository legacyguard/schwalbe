
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { cn } from '@/lib/utils';

interface PerformanceMetric {
  description: string;
  name: string;
  status: 'good' | 'needs-improvement' | 'poor';
  target: number;
  unit: string;
  value: null | number;
}

export const PerformanceDashboard: React.FC = () => {
  const { metrics, insights, getPerformanceScore } = usePerformanceMonitoring();
  const [isExpanded, setIsExpanded] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<
    PerformanceMetric[]
  >([]);

  // Convert metrics to display format
  useEffect(() => {
    const metricData: PerformanceMetric[] = [
      {
        name: 'LCP',
        value: metrics.LCP,
        unit: 'ms',
        target: 2500,
        status: metrics.LCP
          ? metrics.LCP <= 2500
            ? 'good'
            : metrics.LCP <= 4000
              ? 'needs-improvement'
              : 'poor'
          : 'good',
        description:
          'Largest Contentful Paint - Time for the largest content element to become visible',
      },
      {
        name: 'FID',
        value: metrics.FID,
        unit: 'ms',
        target: 100,
        status: metrics.FID
          ? metrics.FID <= 100
            ? 'good'
            : metrics.FID <= 300
              ? 'needs-improvement'
              : 'poor'
          : 'good',
        description:
          'First Input Delay - Time from first interaction to response',
      },
      {
        name: 'CLS',
        value: metrics.CLS,
        unit: '',
        target: 0.1,
        status: metrics.CLS
          ? metrics.CLS <= 0.1
            ? 'good'
            : metrics.CLS <= 0.25
              ? 'needs-improvement'
              : 'poor'
          : 'good',
        description: 'Cumulative Layout Shift - Visual stability measure',
      },
      {
        name: 'FCP',
        value: metrics.FCP,
        unit: 'ms',
        target: 1800,
        status: metrics.FCP
          ? metrics.FCP <= 1800
            ? 'good'
            : metrics.FCP <= 3000
              ? 'needs-improvement'
              : 'poor'
          : 'good',
        description:
          'First Contentful Paint - Time for first content to appear',
      },
      {
        name: 'TTFB',
        value: metrics.TTFB,
        unit: 'ms',
        target: 600,
        status: metrics.TTFB
          ? metrics.TTFB <= 600
            ? 'good'
            : metrics.TTFB <= 800
              ? 'needs-improvement'
              : 'poor'
          : 'good',
        description: 'Time to First Byte - Server response time',
      },
    ];

    setPerformanceHistory(metricData);
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-status-success text-status-success-foreground';
      case 'needs-improvement':
        return 'bg-status-warning text-status-warning-foreground';
      case 'poor':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return 'check-circle';
      case 'needs-improvement':
        return 'alert-triangle';
      case 'poor':
        return 'x-circle';
      default:
        return 'help-circle';
    }
  };

  const formatValue = (value: null | number, unit: string) => {
    if (value === null) return 'Measuring...';
    if (unit === '') return value.toFixed(3);
    return `${value.toFixed(0)}${unit}`;
  };

  const getPerformanceGrade = () => {
    const score = getPerformanceScore();
    if (score >= 90) return { grade: 'A', color: 'text-status-success' };
    if (score >= 80) return { grade: 'B', color: 'text-status-warning' };
    if (score >= 70) return { grade: 'C', color: 'text-status-warning' };
    return { grade: 'D', color: 'text-destructive' };
  };

  const { grade, color } = getPerformanceGrade();

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Icon name='activity' className='h-5 w-5' />
            Performance Dashboard
          </CardTitle>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className={cn('text-lg font-bold', color)}>
              {grade}
            </Badge>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='h-8 w-8 p-0'
            >
              <Icon
                name={isExpanded ? 'chevronUp' : 'chevronDown'}
                className='h-4 w-4'
              />
            </Button>
          </div>
        </div>

        {/* Performance Score */}
        <div className='flex items-center gap-4'>
          <div className='flex-1'>
            <div className='text-2xl font-bold text-foreground'>
              {getPerformanceScore()}/100
            </div>
            <div className='text-sm text-muted-foreground'>
              Overall Performance Score
            </div>
          </div>
          <div className='flex-1'>
            <div className='w-full bg-muted rounded-full h-2'>
              <motion.div
                className='bg-primary h-2 rounded-full'
                initial={{ width: 0 }}
                animate={{ width: `${getPerformanceScore()}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className='space-y-4'
            >
              {/* Performance Metrics */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {performanceHistory.map(metric => (
                  <Card key={metric.name} className='p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='font-medium text-sm'>{metric.name}</div>
                      <Badge
                        variant='secondary'
                        className={getStatusColor(metric.status)}
                      >
                        <Icon
                          name={getStatusIcon(metric.status) as any}
                          className='h-3 w-3 mr-1'
                        />
                        {metric.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className='text-2xl font-bold text-foreground mb-1'>
                      {formatValue(metric.value, metric.unit)}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Target: {metric.target}
                      {metric.unit}
                    </div>
                    <div className='text-xs text-muted-foreground mt-2'>
                      {metric.description}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Optimization Recommendations */}
              {insights.recommendations.length > 0 && (
                <Card className='p-4 border-l-4 border-l-primary'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Icon name='lightbulb' className='h-5 w-5 text-primary' />
                    <h3 className='font-semibold'>
                      Optimization Recommendations
                    </h3>
                  </div>
                  <ul className='space-y-2'>
                    {insights.recommendations.map((recommendation, index) => (
                      <li
                        key={index}
                        className='flex items-start gap-2 text-sm'
                      >
                        <Icon
                          name='arrow-right'
                          className='h-4 w-4 text-primary mt-0.5 flex-shrink-0'
                        />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Performance Actions */}
              <div className='flex flex-wrap gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => window.location.reload()}
                  className='text-xs'
                >
                  <Icon name='refresh-cw' className='h-3 w-3 mr-1' />
                  Refresh Metrics
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    if ('performance' in window) {
                      performance.clearMarks();
                      performance.clearMeasures();
                    }
                  }}
                  className='text-xs'
                >
                  <Icon name='trash' className='h-3 w-3 mr-1' />
                  Clear Metrics
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    // Open browser dev tools
                    // 🚀 Performance Metrics: ${JSON.stringify(metrics)}
                    // 💡 Performance Insights: ${JSON.stringify(insights)}
                  }}
                  className='text-xs'
                >
                  <Icon name='terminal' className='h-3 w-3 mr-1' />
                  View in Console
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default PerformanceDashboard;
