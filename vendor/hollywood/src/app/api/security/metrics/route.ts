
/**
 * Security Metrics Service
 * Provides security-related metrics and analytics
 */
class SecurityMetricsService {
  /**
   * Get time label for metrics
   */
  private getTimeLabel(index: number, range: string): string {
    const now = new Date();
    const time = new Date(now.getTime() - index * 60 * 60 * 1000);
    return time.toISOString();
  }

  /**
   * Generate security metrics data
   */
  generateMetrics(range: string = '24h') {
    const trendData: Array<{
      blocked: number;
      requests: number;
      time: string;
    }> = [];

    // Generate sample trend data
    for (let i = 0; i < 24; i++) {
      const requests = Math.floor(Math.random() * 1000) + 100;
      const blocked = Math.floor(requests * 0.02);

      trendData.push({
        time: this.getTimeLabel(i, range),
        requests: requests,
        blocked: blocked,
      });
    }

    // Threat type distribution
    const threatTypes = [
      { type: 'SQL Injection', count: 45 },
      { type: 'XSS', count: 32 },
      { type: 'CSRF', count: 18 },
      { type: 'Brute Force', count: 25 },
      { type: 'Other', count: 12 },
    ];

    return {
      trendData,
      threatTypes,
      totalRequests: trendData.reduce((sum, item) => sum + item.requests, 0),
      totalBlocked: trendData.reduce((sum, item) => sum + item.blocked, 0),
    };
  }
}

export default SecurityMetricsService;
