
/**
 * Performance Monitor Component
 * Phase 5A: Production Operations & DevOps
 */

import React, { useEffect, useState } from 'react';
import { getPerformanceMetrics } from '@/lib/monitoring/performance';
import {
  getLastHealthStatus,
  runHealthCheck,
} from '@/lib/monitoring/healthCheck';
import { captureError } from '@/lib/monitoring/sentry';
// import { trackPerformance, trackAction } from '@/lib/monitoring/analytics';

interface PerformanceData {
  connection: any;
  memory: any;
  routes: any[];
  userTimings: any[];
  webVitals: any;
}

interface HealthData {
  checks: Record<string, any>;
  overall: 'degraded' | 'healthy' | 'unhealthy';
  timestamp: number;
  uptime: number;
  version: string;
}

/**
 * Performance monitoring component that runs in the background
 */
export const PerformanceMonitor: React.FC = () => {
  const [isEnabled, _setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;

    let healthCheckInterval: number;
    let performanceReportInterval: number;

    const startMonitoring = async () => {
      try {
        // Initial health check
        await runHealthCheck();
        // trackAction('monitoring_started', { component: 'PerformanceMonitor' });

        // Periodic health checks
        healthCheckInterval = window.setInterval(async () => {
          try {
            const health = await runHealthCheck();

            // Track health status changes
            if (health.overall !== 'healthy') {
              // trackPerformance('health_status', health.overall === 'degraded' ? 0.5 : 0, {
              //   status: health.overall,
              //   failedChecks: Object.entries(health.checks)
              //     .filter(([, result]) => result.status !== 'healthy')
              //     .map(([name]) => name)
              // });
            }
          } catch (error) {
            captureError(
              error instanceof Error ? error : new Error(String(error)),
              {
                tags: { source: 'health_check' },
              }
            );
          }
        }, 60000); // Every minute

        // Periodic performance reporting
        performanceReportInterval = window.setInterval(() => {
          try {
            const metrics = getPerformanceMetrics();

            // Report key metrics to analytics
            if (metrics.webVitals.LCP) {
              // trackPerformance('lcp', metrics.webVitals.LCP.value, {
              //   rating: metrics.webVitals.LCP.rating
              // });
            }

            if (metrics.webVitals.FID) {
              // trackPerformance('fid', metrics.webVitals.FID.value, {
              //   rating: metrics.webVitals.FID.rating
              // });
            }

            if (metrics.webVitals.CLS) {
              // trackPerformance('cls', metrics.webVitals.CLS.value, {
              //   rating: metrics.webVitals.CLS.rating
              // });
            }

            // Report memory usage if available
            if (metrics.memory) {
  // const _memoryUsage = // Unused
                (metrics.memory.usedJSHeapSize /
                  metrics.memory.jsHeapSizeLimit) *
                100;
              // trackPerformance('memory_usage', memoryUsage, {
              //   usedMB: Math.round(metrics.memory.usedJSHeapSize / 1024 / 1024),
              //   totalMB: Math.round(metrics.memory.totalJSHeapSize / 1024 / 1024)
              // });
            }
          } catch (error) {
            captureError(
              error instanceof Error ? error : new Error(String(error)),
              {
                tags: { source: 'performance_reporting' },
              }
            );
          }
        }, 30000); // Every 30 seconds
      } catch (error) {
        captureError(
          error instanceof Error ? error : new Error(String(error)),
          {
            tags: { source: 'monitoring_startup' },
          }
        );
      }
    };

    startMonitoring();

    // Cleanup
    return () => {
      if (healthCheckInterval) clearInterval(healthCheckInterval);
      if (performanceReportInterval) clearInterval(performanceReportInterval);
    };
  }, [isEnabled]);

  // This component doesn't render anything
  return null;
};

/**
 * Performance Dashboard Component (for development/admin use)
 */
export const PerformanceDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] =
    useState<null | PerformanceData>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    const updateData = () => {
      try {
        const performance = getPerformanceMetrics();
        const health = getLastHealthStatus();

        setPerformanceData(performance as PerformanceData);
        setHealthData(health);
      } catch (error) {
        captureError(
          error instanceof Error ? error : new Error(String(error)),
          {
            tags: { source: 'performance_dashboard' },
          }
        );
      }
    };

    updateData();
    const interval = setInterval(updateData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Only show in development mode
  if (import.meta.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className='fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-xs font-mono max-h-96 overflow-y-auto z-50'>
      <div className='flex items-center justify-between mb-2'>
        <h3 className='font-semibold text-gray-800 dark:text-gray-200'>
          Performance Monitor
        </h3>
        <select
          value={refreshInterval}
          onChange={e => setRefreshInterval(Number(e.target.value))}
          className='text-xs bg-gray-100 dark:bg-gray-700 border rounded px-1'
        >
          <option value={1000}>1s</option>
          <option value={5000}>5s</option>
          <option value={10000}>10s</option>
        </select>
      </div>

      {/* Health Status */}
      {healthData && (
        <div className='mb-4'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-600 dark:text-gray-400'>Health:</span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                healthData.overall === 'healthy'
                  ? 'bg-green-100 text-green-800'
                  : healthData.overall === 'degraded'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {healthData.overall.toUpperCase()}
            </span>
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
            Uptime: {Math.round(healthData.uptime / 1000 / 60)}min
          </div>
        </div>
      )}

      {/* Web Vitals */}
      {performanceData?.webVitals && (
        <div className='mb-4'>
          <h4 className='font-semibold text-gray-700 dark:text-gray-300 mb-2'>
            Web Vitals
          </h4>
          {Object.entries(performanceData.webVitals).map(
            ([key, metric]: [string, any]) => (
              <div key={key} className='flex justify-between items-center'>
                <span className='text-gray-600 dark:text-gray-400'>{key}:</span>
                <div className='flex items-center space-x-2'>
                  <span>{Math.round(metric.value)}ms</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      metric.rating === 'good'
                        ? 'bg-green-400'
                        : metric.rating === 'needs-improvement'
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                    }`}
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Memory Usage */}
      {performanceData?.memory && (
        <div className='mb-4'>
          <h4 className='font-semibold text-gray-700 dark:text-gray-300 mb-2'>
            Memory
          </h4>
          <div className='flex justify-between'>
            <span className='text-gray-600 dark:text-gray-400'>Used:</span>
            <span>
              {Math.round(performanceData.memory.usedJSHeapSize / 1024 / 1024)}
              MB
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-600 dark:text-gray-400'>Total:</span>
            <span>
              {Math.round(performanceData.memory.totalJSHeapSize / 1024 / 1024)}
              MB
            </span>
          </div>
        </div>
      )}

      {/* Connection Info */}
      {performanceData?.connection && (
        <div className='mb-4'>
          <h4 className='font-semibold text-gray-700 dark:text-gray-300 mb-2'>
            Connection
          </h4>
          <div className='flex justify-between'>
            <span className='text-gray-600 dark:text-gray-400'>Type:</span>
            <span>{performanceData.connection.effectiveType}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-600 dark:text-gray-400'>Downlink:</span>
            <span>{performanceData.connection.downlink} Mbps</span>
          </div>
        </div>
      )}

      {/* Recent Routes */}
      {performanceData?.routes && performanceData.routes.length > 0 && (
        <div>
          <h4 className='font-semibold text-gray-700 dark:text-gray-300 mb-2'>
            Recent Routes
          </h4>
          {performanceData.routes.slice(-3).map((route: any, index: number) => (
            <div key={index} className='flex justify-between text-xs'>
              <span className='text-gray-600 dark:text-gray-400 truncate'>
                {route.route}
              </span>
              <span>{Math.round(route.loadTime)}ms</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
