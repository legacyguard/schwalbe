/**
 * API Client for monitoring endpoints
 * Handles RUM, bundle analysis, and CSP reporting
 */

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class MonitoringAPIClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = '/api';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // RUM Metrics
  async sendRUMMetrics(metrics: any[]): Promise<APIResponse> {
    return this.request('/analytics/rum', 'POST', { metrics });
  }

  async getRUMMetrics(timeRange: string = '24h'): Promise<APIResponse> {
    return this.request(`/analytics/rum?timeRange=${timeRange}`, 'GET');
  }

  // Bundle Analysis
  async sendBundleMetrics(metrics: any): Promise<APIResponse> {
    return this.request('/analytics/bundle-metrics', 'POST', metrics);
  }

  async getBundleMetrics(): Promise<APIResponse> {
    return this.request('/analytics/bundle-metrics', 'GET');
  }

  // CSP Violations
  async reportCSPViolation(violation: any): Promise<APIResponse> {
    return this.request('/security/csp-report', 'POST', violation);
  }

  // Performance Alerts
  async sendPerformanceAlert(alert: {
    type: string;
    severity: 'warning' | 'error';
    message: string;
    userId?: string;
    metrics?: any;
  }): Promise<APIResponse> {
    return this.request('/alerts/performance', 'POST', alert);
  }

  // Health Check
  async healthCheck(): Promise<APIResponse<{ status: string; timestamp: number }>> {
    return this.request('/health', 'GET');
  }
}

// Export singleton instance
export const monitoringAPI = new MonitoringAPIClient();

// Mock implementations for development
export class MockMonitoringAPI {
  async sendRUMMetrics(metrics: any[]): Promise<APIResponse> {
    console.log('📊 Mock RUM metrics sent:', metrics.length, 'metrics');
    return { success: true };
  }

  async getRUMMetrics(timeRange: string = '24h'): Promise<APIResponse> {
    return {
      success: true,
      data: {
        totalSessions: 42,
        avgLCP: 2500,
        avgFID: 50,
        avgCLS: 0.05,
        mobileUsers: 28,
        desktopUsers: 14,
      },
    };
  }

  async sendBundleMetrics(metrics: any): Promise<APIResponse> {
    console.log('📦 Mock bundle metrics sent:', metrics);
    return { success: true };
  }

  async getBundleMetrics(): Promise<APIResponse> {
    return {
      success: true,
      data: {
        totalSize: 102400, // 100KB
        gzipSize: 30720,   // 30KB
        chunkCount: 5,
        largestChunk: 'react-vendor',
        largestChunkSize: 45056, // 44KB
      },
    };
  }

  async reportCSPViolation(violation: any): Promise<APIResponse> {
    console.log('🔒 Mock CSP violation reported:', violation);
    return { success: true };
  }

  async sendPerformanceAlert(alert: any): Promise<APIResponse> {
    console.log('🚨 Mock performance alert sent:', alert);
    return { success: true };
  }

  async healthCheck(): Promise<APIResponse<{ status: string; timestamp: number }>> {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: Date.now(),
      },
    };
  }
}

// Use mock API in development
export const getMonitoringAPI = () => {
  if (import.meta.env.DEV) {
    return new MockMonitoringAPI();
  }
  return monitoringAPI;
};

// Export for use in components
export default getMonitoringAPI();