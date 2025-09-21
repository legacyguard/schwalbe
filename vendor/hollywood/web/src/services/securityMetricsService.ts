
/**
 * Security Metrics Service
 * Provides real-time security metrics for the dashboard
 */

export interface SecurityEvent {
  anomalyType?: string;
  blocked: boolean;
  createdAt: Date;
  description?: string;
  endpoint?: string;
  id: string;
  ipAddress?: string;
  sessionId?: string;
  severity?: string;
  threatType?: string;
  type: string;
  userId?: string;
}

export interface SecurityMetrics {
  activeSessions: number;
  avgResponseTime: number;
  blockedRequests: number;
  encryptionOps: number;
  failedLogins: number;
  rateLimitHits: number;
  threatDetections: number;
  totalRequests: number;
}

export interface ThreatInfo {
  blocked: boolean;
  description: string;
  endpoint: string;
  id: string;
  ip: string;
  severity: string;
  timestamp: Date;
  type: string;
}

export interface SessionAnomaly {
  details: string;
  sessionId: string;
  timestamp: Date;
  type: string;
  userId: string;
}

export interface ChartData {
  geoDistribution: Array<{
    country: string;
    requests: number;
    threats: number;
  }>;
  requestTrend: Array<{
    blocked: number;
    requests: number;
    time: string;
  }>;
  threatTypes: Array<{
    color: string;
    name: string;
    value: number;
  }>;
}

export interface SecurityMetricsResponse {
  anomalies: SessionAnomaly[];
  charts: ChartData;
  metrics: SecurityMetrics;
  threats: ThreatInfo[];
}

/**
 * Security Metrics Service
 * Handles fetching and processing security-related data
 */
export class SecurityMetricsService {
  /**
   * Get security metrics for the dashboard
   */
  static async getMetrics(
    range: string = '24h'
  ): Promise<SecurityMetricsResponse> {
    try {
      // Calculate time range
      const now = new Date();
      const startTime = new Date();

      switch (range) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
          break;
        case '24h':
          startTime.setDate(now.getDate() - 1);
          break;
        case '7d':
          startTime.setDate(now.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(now.getDate() - 30);
          break;
      }

      // Fetch metrics from Supabase
      const [securityEvents, sessions, rateLimits, encryptionOps] =
        await Promise.all([
          // Security events - using a mock table structure
          this.getSecurityEvents(startTime),

          // Active sessions - using Supabase auth sessions
          this.getActiveSessions(),

          // Rate limit hits - mock data for now
          this.getRateLimitHits(startTime),

          // Encryption operations - mock data for now
          this.getEncryptionOperations(startTime),
        ]);

      // Process security events
      const totalRequests = securityEvents.length;
      const blockedRequests = securityEvents.filter(e => e.blocked).length;
      const threatDetections = securityEvents.filter(
        e => e.type === 'threat'
      ).length;
      const failedLogins = securityEvents.filter(
        e => e.type === 'failed_login'
      ).length;

      // Calculate average response time (mock for now)
      const avgResponseTime = Math.floor(Math.random() * 50) + 100;

      // Process recent threats
      const recentThreats = securityEvents
        .filter(e => e.type === 'threat')
        .slice(0, 20)
        .map(event => ({
          id: event.id,
          timestamp: event.createdAt,
          type: event.threatType || 'Unknown',
          severity: event.severity || 'medium',
          ip: event.ipAddress || 'Unknown',
          endpoint: event.endpoint || '/',
          description: event.description || '',
          blocked: event.blocked || false,
        }));

      // Process session anomalies
      const sessionAnomalies = securityEvents
        .filter(e => e.type === 'session_anomaly')
        .slice(0, 10)
        .map(event => ({
          sessionId: event.sessionId || 'Unknown',
          userId: event.userId || 'Unknown',
          type: event.anomalyType || 'Unknown',
          timestamp: event.createdAt,
          details: event.description || '',
        }));

      // Generate chart data
      const chartData = this.generateChartData(securityEvents, range);

      return {
        metrics: {
          totalRequests,
          blockedRequests,
          threatDetections,
          activeSessions: sessions,
          failedLogins,
          rateLimitHits: rateLimits,
          encryptionOps,
          avgResponseTime,
        },
        threats: recentThreats,
        anomalies: sessionAnomalies,
        charts: chartData,
      };
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      throw new Error('Failed to fetch security metrics');
    }
  }

  /**
   * Get security events from database
   * Note: This is a mock implementation since the actual table structure may vary
   */
  private static async getSecurityEvents(
    _startTime: Date
  ): Promise<SecurityEvent[]> {
    try {
      // For now, return mock data since we don't have a security_events table
      // In a real implementation, you would query your Supabase table:
      // const { data, error } = await supabase
      //   .from('security_events')
      //   .select('*')
      //   .gte('created_at', startTime.toISOString())
      //   .order('created_at', { ascending: false });

      // Mock data for demonstration
      return [
        {
          id: '1',
          type: 'threat',
          blocked: true,
          threatType: 'SQL Injection',
          severity: 'high',
          ipAddress: '192.168.1.100',
          endpoint: '/api/documents',
          description: 'Attempted SQL injection in document query',
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
        {
          id: '2',
          type: 'failed_login',
          blocked: false,
          ipAddress: '192.168.1.101',
          endpoint: '/auth/signin',
          description: 'Failed login attempt',
          createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        },
        {
          id: '3',
          type: 'session_anomaly',
          blocked: false,
          sessionId: 'sess_123',
          userId: 'user_456',
          anomalyType: 'unusual_location',
          description: 'Login from new location',
          createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
      ];
    } catch (error) {
      console.error('Error fetching security events:', error);
      return [];
    }
  }

  /**
   * Get active sessions count
   */
  private static async getActiveSessions(): Promise<number> {
    try {
      // In a real implementation, you might track sessions in a custom table
      // For now, return a mock value
      return Math.floor(Math.random() * 50) + 10;
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return 0;
    }
  }

  /**
   * Get rate limit hits
   */
  private static async getRateLimitHits(_startTime: Date): Promise<number> {
    try {
      // Mock implementation
      return Math.floor(Math.random() * 20) + 5;
    } catch (error) {
      console.error('Error fetching rate limit hits:', error);
      return 0;
    }
  }

  /**
   * Get encryption operations count
   */
  private static async getEncryptionOperations(
    _startTime: Date
  ): Promise<number> {
    try {
      // Mock implementation
      return Math.floor(Math.random() * 100) + 50;
    } catch (error) {
      console.error('Error fetching encryption operations:', error);
      return 0;
    }
  }

  /**
   * Generate chart data for visualization
   */
  private static generateChartData(
    _events: SecurityEvent[],
    range: string
  ): ChartData {
    // Generate time-based trend data
    const trendData: Array<{
      blocked: number;
      requests: number;
      time: string;
    }> = [];
    const intervals =
      range === '1h' ? 6 : range === '24h' ? 6 : range === '7d' ? 7 : 30;

    for (let i = 0; i < intervals; i++) {
      const requests = Math.floor(Math.random() * 1000) + 200;
      const blocked = Math.floor(requests * 0.02);

      trendData.push({
        time: this.getTimeLabel(i, range),
        requests,
        blocked,
      });
    }

    // Threat type distribution
    const threatTypes = [
      { name: 'SQL Injection', value: 45, color: '#FF6B6B' },
      { name: 'XSS', value: 32, color: '#4ECDC4' },
      { name: 'Brute Force', value: 28, color: '#45B7D1' },
      { name: 'Path Traversal', value: 15, color: '#96CEB4' },
      { name: 'Other', value: 20, color: '#DDA0DD' },
    ];

    // Geographic distribution
    const geoDistribution = [
      { country: 'USA', requests: 3500, threats: 45 },
      { country: 'China', requests: 1200, threats: 230 },
      { country: 'Russia', requests: 800, threats: 180 },
      { country: 'Germany', requests: 650, threats: 12 },
      { country: 'UK', requests: 540, threats: 8 },
    ];

    return {
      requestTrend: trendData,
      threatTypes,
      geoDistribution,
    };
  }

  /**
   * Get time label for chart data
   */
  private static getTimeLabel(index: number, range: string): string {
    if (range === '1h') {
      return `${index * 10}m`;
    } else if (range === '24h') {
      return `${index * 4}:00`;
    } else if (range === '7d') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[index];
    } else {
      return `Day ${index + 1}`;
    }
  }
}

// Export the service as default
export default SecurityMetricsService;
