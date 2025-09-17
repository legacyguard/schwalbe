
/**
 * Advanced Threat Detection System
 * Real-time monitoring and anomaly detection for security threats
 */

import supabase from '../supabaseClient';

interface ThreatSignal {
  confidence: number; // 0-100
  details: Record<string, unknown>;
  severity: 'critical' | 'high' | 'low' | 'medium';
  timestamp: Date;
  type:
    | 'brute_force'
    | 'data_exfiltration'
    | 'path_traversal'
    | 'sql_injection'
    | 'unusual_activity'
    | 'xss';
}

interface UserBehaviorProfile {
  lastUpdated: Date;
  normalPatterns: {
    avgDataVolumePerRequest: number;
    avgRequestsPerMinute: number;
    commonEndpoints: string[];
    commonIpRanges: string[];
    typicalActiveHours: number[];
  };
  userId: string;
}

export class ThreatDetectionSystem {
  private static instance: ThreatDetectionSystem;
  private behaviorProfiles: Map<string, UserBehaviorProfile> = new Map();
  private threatSignals: ThreatSignal[] = [];
  private blockedIps: Set<string> = new Set();
  private suspiciousPatterns: RegExp[] = [];

  private constructor() {
    this.initializePatterns();
    this.startMonitoring();
  }

  public static getInstance(): ThreatDetectionSystem {
    if (!ThreatDetectionSystem.instance) {
      ThreatDetectionSystem.instance = new ThreatDetectionSystem();
    }
    return ThreatDetectionSystem.instance;
  }

  /**
   * Initialize suspicious pattern detection
   */
  private initializePatterns(): void {
    this.suspiciousPatterns = [
      // SQL Injection patterns
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|FROM|WHERE)\b.*\b(FROM|WHERE|AND|OR)\b)/gi,
      // eslint-disable-next-line no-control-regex
      /('|"|;|--|\||\x00|\n|\r|\t)/g,
      /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
      /(\bOR\b\s*'[^']*'\s*=\s*'[^']*')/gi,

      // XSS patterns
      /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi,
      /(javascript:|onerror=|onload=|onclick=|onmouseover=)/gi,
      /(<iframe|<object|<embed|<applet)/gi,
      /(document\.|window\.|eval\(|setTimeout\(|setInterval\()/gi,

      // Path traversal patterns
      /(\.\.\/|\.\.\\|%2e%2e%2f|%252e%252e%252f)/gi,
      /(\/etc\/passwd|\/etc\/shadow|c:\\windows\\system32)/gi,

      // Command injection patterns
      /(;|\||`|\$\(|\${|&&|\|\|)/g,
      /(nc\s+-|bash\s+-|sh\s+-|cmd\s+\/|powershell)/gi,

      // LDAP injection patterns
      /(\*|\(|\)|\\|\/|,|=|\+|<|>|#|;)/g,

      // NoSQL injection patterns
      /(\$ne|\$gt|\$lt|\$gte|\$lte|\$eq|\$regex|\$where)/gi,
    ];
  }

  /**
   * Start continuous monitoring
   */
  private startMonitoring(): void {
    // Monitor every 30 seconds
    setInterval(() => {
      this.analyzeRecentActivity();
      this.updateBehaviorProfiles();
      this.cleanupOldData();
    }, 30000);
  }

  /**
   * Analyze request for threats
   */
  public async analyzeRequest(request: {
    body?: unknown;
    endpoint: string;
    headers: Record<string, string>;
    ip: string;
    method: string;
    query?: Record<string, string>;
    userId?: string;
  }): Promise<ThreatSignal[]> {
    const threats: ThreatSignal[] = [];

    // Check if IP is blocked
    if (this.blockedIps.has(request.ip)) {
      threats.push({
        type: 'unusual_activity',
        severity: 'critical',
        confidence: 100,
        details: { reason: 'Blocked IP address', ip: request.ip },
        timestamp: new Date(),
      });
      return threats;
    }

    // Check for SQL injection
    const sqlInjectionThreat = this.detectSqlInjection(request);
    if (sqlInjectionThreat) threats.push(sqlInjectionThreat);

    // Check for XSS
    const xssThreat = this.detectXss(request);
    if (xssThreat) threats.push(xssThreat);

    // Check for path traversal
    const pathTraversalThreat = this.detectPathTraversal(request);
    if (pathTraversalThreat) threats.push(pathTraversalThreat);

    // Check for unusual activity
    if (request.userId) {
      const unusualActivityThreat = await this.detectUnusualActivity(
        request.userId,
        request
      );
      if (unusualActivityThreat) threats.push(unusualActivityThreat);
    }

    // Check for data exfiltration
    const dataExfiltrationThreat = this.detectDataExfiltration(request);
    if (dataExfiltrationThreat) threats.push(dataExfiltrationThreat);

    // Store threats for analysis
    this.threatSignals.push(...threats);

    // Auto-block critical threats
    if (threats.some(t => t.severity === 'critical' && t.confidence > 80)) {
      this.blockIp(request.ip, 3600000); // Block for 1 hour
      await this.notifySecurityTeam(threats, request);
    }

    return threats;
  }

  /**
   * Detect SQL injection attempts
   */
  private detectSqlInjection(request: {
    body?: unknown;
    endpoint: string;
    query?: Record<string, string>;
  }): null | ThreatSignal {
    const checkString =
      JSON.stringify(request.body) + JSON.stringify(request.query);
    let confidence = 0;
    const matches: string[] = [];

    for (const pattern of this.suspiciousPatterns.slice(0, 4)) {
      const match = checkString.match(pattern);
      if (match) {
        confidence += 25;
        matches.push(match[0]);
      }
    }

    if (confidence > 0) {
      return {
        type: 'sql_injection',
        severity:
          confidence >= 75 ? 'critical' : confidence >= 50 ? 'high' : 'medium',
        confidence,
        details: { matches, endpoint: request.endpoint },
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Detect XSS attempts
   */
  private detectXss(request: {
    body?: unknown;
    endpoint: string;
    query?: Record<string, string>;
  }): null | ThreatSignal {
    const checkString =
      JSON.stringify(request.body) + JSON.stringify(request.query);
    let confidence = 0;
    const matches: string[] = [];

    for (const pattern of this.suspiciousPatterns.slice(4, 8)) {
      const match = checkString.match(pattern);
      if (match) {
        confidence += 25;
        matches.push(match[0]);
      }
    }

    if (confidence > 0) {
      return {
        type: 'xss',
        severity:
          confidence >= 75 ? 'high' : confidence >= 50 ? 'medium' : 'low',
        confidence,
        details: { matches, endpoint: request.endpoint },
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Detect path traversal attempts
   */
  private detectPathTraversal(request: {
    endpoint: string;
    query?: Record<string, string>;
  }): null | ThreatSignal {
    const checkString = request.endpoint + JSON.stringify(request.query);

    for (const pattern of this.suspiciousPatterns.slice(8, 10)) {
      const match = checkString.match(pattern);
      if (match) {
        return {
          type: 'path_traversal',
          severity: 'high',
          confidence: 90,
          details: { match: match[0], endpoint: request.endpoint },
          timestamp: new Date(),
        };
      }
    }

    return null;
  }

  /**
   * Detect unusual user activity
   */
  private async detectUnusualActivity(
    userId: string,
    request: {
      endpoint: string;
      method: string;
    }
  ): Promise<null | ThreatSignal> {
    const profile = this.behaviorProfiles.get(userId);
    if (!profile) return null;

    const currentHour = new Date().getHours();
    const isUnusualTime =
      !profile.normalPatterns.typicalActiveHours.includes(currentHour);
    const isUnusualEndpoint = !profile.normalPatterns.commonEndpoints.includes(
      request.endpoint
    );

    if (isUnusualTime && isUnusualEndpoint) {
      return {
        type: 'unusual_activity',
        severity: 'medium',
        confidence: 60,
        details: {
          reason: 'Activity outside normal patterns',
          unusualTime: isUnusualTime,
          unusualEndpoint: isUnusualEndpoint,
        },
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Detect potential data exfiltration
   */
  private detectDataExfiltration(request: {
    endpoint: string;
    query?: Record<string, string>;
  }): null | ThreatSignal {
    // Check for large response sizes or bulk data requests
    const suspiciousEndpoints = ['/api/export', '/api/download', '/api/backup'];
    const isBulkRequest =
      request.query?.['limit'] && parseInt(request.query['limit']) > 1000;
    const isSuspiciousEndpoint = suspiciousEndpoints.some(ep =>
      request.endpoint.includes(ep)
    );

    if (isBulkRequest || isSuspiciousEndpoint) {
      return {
        type: 'data_exfiltration',
        severity: 'high',
        confidence: 70,
        details: {
          endpoint: request.endpoint,
          limit: request.query?.['limit'],
        },
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Block IP address temporarily
   */
  public blockIp(ip: string, duration: number): void {
    this.blockedIps.add(ip);
    setTimeout(() => {
      this.blockedIps.delete(ip);
    }, duration);
  }

  /**
   * Analyze recent activity for patterns
   */
  private async analyzeRecentActivity(): Promise<void> {
    const recentThreats = this.threatSignals.filter(
      t => t.timestamp > new Date(Date.now() - 300000) // Last 5 minutes
    );

    // Check for coordinated attacks
    const threatsByType = new Map<string, number>();
    recentThreats.forEach(t => {
      threatsByType.set(t.type, (threatsByType.get(t.type) || 0) + 1);
    });

    // If more than 10 threats of same type, escalate
    for (const [type, count] of threatsByType) {
      if (count > 10) {
        await this.escalateThreat(type, count);
      }
    }
  }

  /**
   * Update user behavior profiles
   */
  private async updateBehaviorProfiles(): Promise<void> {
    // This would normally fetch from database
    // For now, we'll maintain in-memory profiles
  }

  /**
   * Clean up old data
   */
  private cleanupOldData(): void {
    const cutoff = new Date(Date.now() - 3600000); // 1 hour
    this.threatSignals = this.threatSignals.filter(t => t.timestamp > cutoff);
  }

  /**
   * Notify security team of critical threats
   */
  private async notifySecurityTeam(
    threats: ThreatSignal[],
    request: any
  ): Promise<void> {
    try {
      const { error } = await (supabase as any).from('security_alerts').insert([
        {
          threats: threats,
          request_details: request,
          created_at: new Date().toISOString(),
          severity: 'critical',
          auto_blocked: true,
        },
      ]);
      if (error) console.error('Security alert insert error:', error);

      // In production, also send email/SMS alerts
      console.error('SECURITY ALERT:', threats);
    } catch (error) {
      console.error('Failed to notify security team:', error);
    }
  }

  /**
   * Escalate threat based on patterns
   */
  private async escalateThreat(type: string, count: number): Promise<void> {
    console.warn(
      `Escalating threat: ${type} detected ${count} times in 5 minutes`
    );

    // Increase monitoring sensitivity
    // Notify admins
    // Enable additional security measures
  }

  /**
   * Get current threat level
   */
  public getThreatLevel(): 'critical' | 'high' | 'low' | 'medium' {
    const recentThreats = this.threatSignals.filter(
      t => t.timestamp > new Date(Date.now() - 300000)
    );

    const criticalCount = recentThreats.filter(
      t => t.severity === 'critical'
    ).length;
    const highCount = recentThreats.filter(t => t.severity === 'high').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 5) return 'high';
    if (recentThreats.length > 10) return 'medium';
    return 'low';
  }

  /**
   * Get security metrics
   */
  public getMetrics(): {
    blockedIps: number;
    recentThreats: number;
    threatLevel: string;
    topThreatTypes: Array<{ count: number; type: string }>;
  } {
    const recentThreats = this.threatSignals.filter(
      t => t.timestamp > new Date(Date.now() - 3600000)
    );

    const threatTypes = new Map<string, number>();
    recentThreats.forEach(t => {
      threatTypes.set(t.type, (threatTypes.get(t.type) || 0) + 1);
    });

    return {
      threatLevel: this.getThreatLevel(),
      blockedIps: this.blockedIps.size,
      recentThreats: recentThreats.length,
      topThreatTypes: Array.from(threatTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }
}

export const threatDetection = ThreatDetectionSystem.getInstance();
