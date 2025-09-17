
/**
 * Advanced Session Security Management
 * Implements secure session handling with fingerprinting and anomaly detection
 */

import supabase from '../supabaseClient';
import { encryptionService } from '@hollywood/shared';

interface SessionFingerprint {
  audioFingerprint: string;
  canvasFingerprint: string;
  colorDepth: number;
  fontFingerprint: string;
  hardwareConcurrency: number;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  touchSupport: boolean;
  userAgent: string;
  webGLFingerprint: string;
}

interface SecureSession {
  createdAt: Date;
  deviceTrusted: boolean;
  encryptedToken: string;
  expiresAt: Date;
  fingerprint: string;
  id: string;
  ipAddress: string;
  isActive: boolean;
  lastActivity: Date;
  mfaVerified: boolean;
  trustScore: number;
  userId: string;
}

interface SessionAnomalySignal {
  details: Record<string, unknown>;
  severity: 'high' | 'low' | 'medium';
  type:
    | 'concurrent_sessions'
    | 'fingerprint_mismatch'
    | 'ip_change'
    | 'location_jump'
    | 'suspicious_timing';
}

export class SessionSecurityManager {
  private static instance: SessionSecurityManager;
  private sessions: Map<string, SecureSession> = new Map();
  private trustedDevices: Map<string, string[]> = new Map(); // userId -> fingerprints
  private sessionExpiryMinutes = 30;
  private maxConcurrentSessions = 3;
  private fingerprintCache: Map<string, SessionFingerprint> = new Map();

  private constructor() {
    this.startSessionMonitoring();
  }

  public static getInstance(): SessionSecurityManager {
    if (!SessionSecurityManager.instance) {
      SessionSecurityManager.instance = new SessionSecurityManager();
    }
    return SessionSecurityManager.instance;
  }

  /**
   * Generate device fingerprint
   */
  public async generateFingerprint(): Promise<SessionFingerprint> {
    const fingerprint: SessionFingerprint = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      colorDepth: screen.colorDepth,
      touchSupport: 'ontouchstart' in window,
      webGLFingerprint: await this.getWebGLFingerprint(),
      canvasFingerprint: await this.getCanvasFingerprint(),
      audioFingerprint: await this.getAudioFingerprint(),
      fontFingerprint: await this.getFontFingerprint(),
    };

    return fingerprint;
  }

  /**
   * Get WebGL fingerprint
   */
  private async getWebGLFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'not-supported';

      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'no-debug-info';

      const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = (gl as any).getParameter(
        debugInfo.UNMASKED_RENDERER_WEBGL
      );

      return `${vendor}::${renderer}`;
    } catch {
      return 'error';
    }
  }

  /**
   * Get Canvas fingerprint
   */
  private async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'not-supported';

      // Draw test text
      ctx.textBaseline = 'top';
      ctx.font = '14px "Arial"';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('LegacyGuard 🔒', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('LegacyGuard 🔒', 4, 17);

      // Get fingerprint
      const dataURL = canvas.toDataURL();
      let hash = 0;
      for (let i = 0; i < dataURL.length; i++) {
        hash = (hash << 5) - hash + dataURL.charCodeAt(i);
        hash = hash & hash;
      }

      return hash.toString(16);
    } catch {
      return 'error';
    }
  }

  /**
   * Get Audio fingerprint
   */
  private async getAudioFingerprint(): Promise<string> {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return 'not-supported';

      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gainNode = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0; // Mute
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(0);

      return new Promise(resolve => {
        scriptProcessor.onaudioprocess = event => {
          const fingerprint = event.inputBuffer
            .getChannelData(0)
            .slice(0, 100)
            .reduce((acc, val) => acc + Math.abs(val), 0);

          oscillator.stop();
          context.close();
          resolve(fingerprint.toString(16));
        };
      });
    } catch {
      return 'error';
    }
  }

  /**
   * Get Font fingerprint
   */
  private async getFontFingerprint(): Promise<string> {
    const testFonts = [
      'Arial',
      'Verdana',
      'Times New Roman',
      'Courier New',
      'Georgia',
      'Palatino',
      'Garamond',
      'Bookman',
      'Comic Sans MS',
      'Trebuchet MS',
      'Arial Black',
      'Impact',
    ];

    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'not-supported';

    const testString = 'mmmmmmmmmmlli';
    const fontSize = '72px';
    const results: string[] = [];

    for (const font of testFonts) {
      for (const baseFont of baseFonts) {
        ctx.font = `${fontSize} ${font}, ${baseFont}`;
        const metrics = ctx.measureText(testString);
        results.push(`${font}-${baseFont}:${metrics.width}`);
      }
    }

    return results.join('|').substring(0, 100);
  }

  /**
   * Create secure session
   */
  public async createSession(
    userId: string,
    ipAddress: string,
    mfaVerified: boolean = false
  ): Promise<SecureSession> {
    const fingerprint = await this.generateFingerprint();
    const fingerprintHash = await this.hashFingerprint(fingerprint);

    // Check for concurrent sessions
    const userSessions = Array.from(this.sessions.values()).filter(
      s => s.userId === userId && s.isActive
    );

    if (userSessions.length >= this.maxConcurrentSessions) {
      // Invalidate oldest session
      const oldestSession = userSessions.sort(
        (a, b) => a.lastActivity.getTime() - b.lastActivity.getTime()
      )[0];
      await this.invalidateSession(oldestSession.id);
    }

    // Check if device is trusted
    const deviceTrusted = this.isDeviceTrusted(userId, fingerprintHash);

    // Generate secure session token
    const sessionToken = this.generateSecureToken();
    const encryptedToken = await this.encryptSessionToken(sessionToken);

    const session: SecureSession = {
      id: this.generateSessionId(),
      userId,
      fingerprint: fingerprintHash,
      ipAddress,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + this.sessionExpiryMinutes * 60000),
      isActive: true,
      trustScore: deviceTrusted ? 100 : 50,
      deviceTrusted,
      mfaVerified,
      encryptedToken,
    };

    this.sessions.set(session.id, session);
    this.fingerprintCache.set(session.id, fingerprint);

    // Store in database
    await this.persistSession(session);

    return session;
  }

  /**
   * Validate session with anomaly detection
   */
  public async validateSession(
    sessionId: string,
    currentIp: string,
    currentFingerprint?: SessionFingerprint
  ): Promise<{ anomalies: SessionAnomalySignal[]; valid: boolean }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { valid: false, anomalies: [] };
    }

    const anomalies: SessionAnomalySignal[] = [];

    // Check expiry
    if (session.expiresAt < new Date()) {
      await this.invalidateSession(sessionId);
      return { valid: false, anomalies: [] };
    }

    // Check IP change
    if (session.ipAddress !== currentIp) {
      anomalies.push({
        type: 'ip_change',
        severity: 'medium',
        details: {
          original: session.ipAddress,
          current: currentIp,
        },
      });

      // Check for impossible travel
      const locationJump = await this.checkLocationJump(
        session.ipAddress,
        currentIp,
        session.lastActivity
      );
      if (locationJump) {
        anomalies.push(locationJump);
      }
    }

    // Check fingerprint if provided
    if (currentFingerprint) {
      const fingerprintHash = await this.hashFingerprint(currentFingerprint);
      if (session.fingerprint !== fingerprintHash) {
        const similarity = await this.calculateFingerprintSimilarity(
          this.fingerprintCache.get(sessionId)!,
          currentFingerprint
        );

        if (similarity < 0.7) {
          anomalies.push({
            type: 'fingerprint_mismatch',
            severity: similarity < 0.5 ? 'high' : 'medium',
            details: { similarity },
          });
        }
      }
    }

    // Check for suspicious timing
    const timeSinceLastActivity = Date.now() - session.lastActivity.getTime();
    if (timeSinceLastActivity < 100) {
      // Less than 100ms
      anomalies.push({
        type: 'suspicious_timing',
        severity: 'low',
        details: { milliseconds: timeSinceLastActivity },
      });
    }

    // Update trust score based on anomalies
    if (anomalies.length > 0) {
      session.trustScore = Math.max(
        0,
        session.trustScore - anomalies.length * 10
      );
    } else {
      session.trustScore = Math.min(100, session.trustScore + 1);
    }

    // Update last activity
    session.lastActivity = new Date();

    // Require re-authentication for high-severity anomalies
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
    if (highSeverityAnomalies.length > 0 || session.trustScore < 30) {
      await this.invalidateSession(sessionId);
      return { valid: false, anomalies };
    }

    return { valid: true, anomalies };
  }

  /**
   * Check for impossible travel (location jump)
   */
  private async checkLocationJump(
    previousIp: string,
    currentIp: string,
    lastActivity: Date
  ): Promise<null | SessionAnomalySignal> {
    // This would normally use a GeoIP service
    // For now, we'll use a simple heuristic
    const timeDiff = Date.now() - lastActivity.getTime();
    const timeHours = timeDiff / 3600000;

    // If IPs are from different /16 subnets and time < 1 hour
    const prevSubnet = previousIp.split('.').slice(0, 2).join('.');
    const currSubnet = currentIp.split('.').slice(0, 2).join('.');

    if (prevSubnet !== currSubnet && timeHours < 1) {
      return {
        type: 'location_jump',
        severity: 'high',
        details: {
          previousIp,
          currentIp,
          timeHours,
          possibleVPN: true,
        },
      };
    }

    return null;
  }

  /**
   * Calculate fingerprint similarity
   */
  private async calculateFingerprintSimilarity(
    fp1: SessionFingerprint,
    fp2: SessionFingerprint
  ): Promise<number> {
    let matches = 0;
    const totalFields = 12;

    if (fp1.userAgent === fp2.userAgent) matches++;
    if (fp1.screenResolution === fp2.screenResolution) matches++;
    if (fp1.timezone === fp2.timezone) matches++;
    if (fp1.language === fp2.language) matches++;
    if (fp1.platform === fp2.platform) matches++;
    if (fp1.hardwareConcurrency === fp2.hardwareConcurrency) matches++;
    if (fp1.colorDepth === fp2.colorDepth) matches++;
    if (fp1.touchSupport === fp2.touchSupport) matches++;
    if (fp1.webGLFingerprint === fp2.webGLFingerprint) matches++;
    if (fp1.canvasFingerprint === fp2.canvasFingerprint) matches++;
    if (fp1.audioFingerprint === fp2.audioFingerprint) matches++;
    if (fp1.fontFingerprint === fp2.fontFingerprint) matches++;

    return matches / totalFields;
  }

  /**
   * Trust device for future sessions
   */
  public async trustDevice(
    userId: string,
    fingerprint: SessionFingerprint
  ): Promise<void> {
    const fingerprintHash = await this.hashFingerprint(fingerprint);
    const userDevices = this.trustedDevices.get(userId) || [];

    if (!userDevices.includes(fingerprintHash)) {
      userDevices.push(fingerprintHash);
      this.trustedDevices.set(userId, userDevices);

      // Persist to database
      const { error } = await (supabase as any).from('trusted_devices').insert([
        {
          user_id: userId,
          fingerprint_hash: fingerprintHash,
          trusted_at: new Date().toISOString(),
        },
      ]);
      if (error) console.error('Database insert error:', error);
    }
  }

  /**
   * Check if device is trusted
   */
  private isDeviceTrusted(userId: string, fingerprintHash: string): boolean {
    const userDevices = this.trustedDevices.get(userId) || [];
    return userDevices.includes(fingerprintHash);
  }

  /**
   * Invalidate session
   */
  public async invalidateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      const { error } = await (supabase as any)
        .from('sessions')
        .update({ is_active: false, invalidated_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) console.error('Database update error:', error);

      this.sessions.delete(sessionId);
      this.fingerprintCache.delete(sessionId);
    }
  }

  /**
   * Invalidate all user sessions
   */
  public async invalidateUserSessions(userId: string): Promise<void> {
    const userSessions = Array.from(this.sessions.values()).filter(
      s => s.userId === userId
    );

    for (const session of userSessions) {
      await this.invalidateSession(session.id);
    }
  }

  /**
   * Start session monitoring
   */
  private startSessionMonitoring(): void {
    // Clean up expired sessions every minute
    setInterval(() => {
      const now = new Date();
      for (const [id, session] of this.sessions) {
        if (session.expiresAt < now || !session.isActive) {
          this.invalidateSession(id);
        }
      }
    }, 60000);
  }

  /**
   * Persist session to database
   */
  private async persistSession(session: SecureSession): Promise<void> {
    try {
      const { error } = await (supabase as any).from('sessions').insert([
        {
          id: session.id,
          user_id: session.userId,
          fingerprint_hash: session.fingerprint,
          ip_address: session.ipAddress,
          created_at: session.createdAt.toISOString(),
          expires_at: session.expiresAt.toISOString(),
          trust_score: session.trustScore,
          device_trusted: session.deviceTrusted,
          mfa_verified: session.mfaVerified,
          encrypted_token: session.encryptedToken,
        },
      ]);
      if (error) console.error('Database insert error:', error);
    } catch (error) {
      console.error('Failed to persist session:', error);
    }
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  /**
   * Generate secure token
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(64);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  /**
   * Hash fingerprint
   */
  private async hashFingerprint(
    fingerprint: SessionFingerprint
  ): Promise<string> {
    const str = JSON.stringify(fingerprint);
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt session token
   */
  private async encryptSessionToken(token: string): Promise<string> {
    await encryptionService.initializeWithPassword(token);
    const encrypted = await encryptionService.encrypt(token);
    return encrypted.data;
  }

  /**
   * Get session metrics
   */
  public getMetrics(): {
    activeSessions: number;
    averageTrustScore: number;
    sessionsWithAnomalies: number;
    trustedDevices: number;
  } {
    const activeSessions = Array.from(this.sessions.values()).filter(
      s => s.isActive
    );

    const totalTrustScore = activeSessions.reduce(
      (sum, s) => sum + s.trustScore,
      0
    );

    const sessionsWithLowTrust = activeSessions.filter(
      s => s.trustScore < 70
    ).length;

    let totalTrustedDevices = 0;
    for (const devices of this.trustedDevices.values()) {
      totalTrustedDevices += devices.length;
    }

    return {
      activeSessions: activeSessions.length,
      trustedDevices: totalTrustedDevices,
      averageTrustScore:
        activeSessions.length > 0
          ? totalTrustScore / activeSessions.length
          : 100,
      sessionsWithAnomalies: sessionsWithLowTrust,
    };
  }
}

export const sessionSecurity = SessionSecurityManager.getInstance();
