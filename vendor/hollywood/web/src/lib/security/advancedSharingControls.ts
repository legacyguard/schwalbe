
/**
 * Advanced Sharing Controls for LegacyGuard
 * Provides sophisticated access control, time-limited sharing, view-only modes, and watermarking
 */

import { createHash } from 'crypto';
import _nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';

export interface SharePermissions {
  canComment: boolean;
  canCopy: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canPrint: boolean;
  canShare: boolean;
  canView: boolean;
  deviceRestrictions?: DeviceRestriction[];
  geofencing?: GeofenceConfig;
  ipWhitelist?: string[];
  maxDownloads?: number;
  maxViews?: number;
  requireAuth: boolean;
  timeLimit?: number; // Minutes
  watermark?: WatermarkConfig;
}

export interface WatermarkConfig {
  color?: string;
  enabled: boolean;
  fontSize?: number;
  imageUrl?: string;
  includeMeta: boolean; // Include timestamp, user info
  opacity: number; // 0-1
  position:
    | 'bottom-left'
    | 'bottom-right'
    | 'center'
    | 'tiled'
    | 'top-left'
    | 'top-right';
  rotation?: number; // degrees
  text?: string;
  type: 'both' | 'image' | 'text';
}

export interface DeviceRestriction {
  browserType?: string[];
  deviceFingerprint?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  os?: string[];
  type: 'allow' | 'block';
}

export interface GeofenceConfig {
  allowedRegions: GeoRegion[];
  enabled: boolean;
  requireGPSAccuracy?: number; // meters
  restrictedRegions: GeoRegion[];
}

export interface GeoRegion {
  coordinates: number[][]; // [lat, lng] pairs
  name: string;
  radius?: number; // meters for circle type
  type: 'circle' | 'polygon';
}

export interface ShareLink {
  accessCount: number;
  createdAt: string;
  documentId: string;
  downloadCount: number;
  encryptedAccessKey: string;
  expiresAt?: string;
  id: string;
  isActive: boolean;
  lastAccessedAt?: string;
  permissions: SharePermissions;
  restrictions: AccessRestriction[];
  sharedBy: string;
  sharedWith?: string; // Email or user ID
  shareToken: string;
}

export interface AccessRestriction {
  enforced: boolean;
  type: 'device' | 'ip' | 'location' | 'time' | 'usage';
  value: any;
  violationCount: number;
}

export interface AccessAttempt {
  deviceFingerprint: string;
  ipAddress: string;
  location?: {
    accuracy?: number;
    lat: number;
    lng: number;
  };
  reason?: string;
  shareId: string;
  success: boolean;
  timestamp: number;
  userAgent: string;
}

export interface ViewSession {
  actions: ViewAction[];
  ipAddress: string;
  lastActivityAt: number;
  restrictions: SessionRestriction[];
  sessionId: string;
  shareId: string;
  startedAt: number;
  userAgent: string;
  userId?: string;
}

export interface ViewAction {
  allowed: boolean;
  metadata?: Record<string, any>;
  reason?: string;
  timestamp: number;
  type: 'comment' | 'copy' | 'download' | 'print' | 'share' | 'view';
}

export interface SessionRestriction {
  enforced: boolean;
  type: 'devtools' | 'print' | 'rightclick' | 'screenshot' | 'selection';
}

class AdvancedSharingControlsService {
  private readonly TOKEN_LENGTH = 32;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private activeSessions: Map<string, ViewSession> = new Map();

  /**
   * Create a secure share link with advanced permissions
   */
  async createShareLink(
    documentId: string,
    permissions: SharePermissions,
    sharedBy: string,
    sharedWith?: string,
    customToken?: string
  ): Promise<ShareLink> {
    // Generate secure share token
    const shareToken = customToken || this.generateSecureToken();

    // Encrypt document access key
    const documentAccessKey = await this.getDocumentAccessKey(documentId);
    if (!documentAccessKey) {
      throw new Error('Document access key not found');
    }

    const encryptedAccessKey = await this.encryptAccessKey(
      documentAccessKey,
      shareToken
    );

    // Calculate expiration
    const expiresAt = permissions.timeLimit
      ? new Date(Date.now() + permissions.timeLimit * 60000).toISOString()
      : undefined;

    // Create access restrictions
    const restrictions = this.createAccessRestrictions(permissions);

    const shareLink: ShareLink = {
      id: this.generateId(),
      documentId,
      shareToken,
      encryptedAccessKey,
      permissions,
      sharedBy,
      sharedWith,
      createdAt: new Date().toISOString(),
      expiresAt,
      lastAccessedAt: undefined,
      accessCount: 0,
      downloadCount: 0,
      isActive: true,
      restrictions,
    };

    // Store share link
    await this.storeShareLink(shareLink);

    return shareLink;
  }

  /**
   * Validate access attempt and create session if allowed
   */
  async validateAccess(
    shareToken: string,
    accessRequest: {
      ipAddress: string;
      location?: { accuracy?: number; lat: number; lng: number };
      userAgent: string;
      userId?: string;
    }
  ): Promise<{ allowed: boolean; reason?: string; session?: ViewSession }> {
    const shareLink = await this.getShareLinkByToken(shareToken);

    if (!shareLink || !shareLink.isActive) {
      return { allowed: false, reason: 'Invalid or inactive share link' };
    }

    // Check expiration
    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      await this.deactivateShareLink(shareLink.id);
      return { allowed: false, reason: 'Share link has expired' };
    }

    // Check usage limits
    if (
      shareLink.permissions.maxViews &&
      shareLink.accessCount >= shareLink.permissions.maxViews
    ) {
      return { allowed: false, reason: 'Maximum view count exceeded' };
    }

    // Generate device fingerprint
    const deviceFingerprint = this.generateDeviceFingerprint(
      accessRequest.userAgent,
      accessRequest.ipAddress
    );

    // Validate restrictions
    const restrictionCheck = await this.validateRestrictions(shareLink, {
      ...accessRequest,
      deviceFingerprint,
    });

    if (!restrictionCheck.allowed) {
      await this.logAccessAttempt(shareLink.id, {
        shareId: shareLink.id,
        ...accessRequest,
        deviceFingerprint,
        timestamp: Date.now(),
        success: false,
        reason: restrictionCheck.reason,
      });
      return { allowed: false, reason: restrictionCheck.reason };
    }

    // Create view session
    const session = await this.createViewSession(
      shareLink,
      accessRequest,
      deviceFingerprint
    );

    // Update share link access count
    await this.incrementAccessCount(shareLink.id);

    // Log successful access
    await this.logAccessAttempt(shareLink.id, {
      shareId: shareLink.id,
      ...accessRequest,
      deviceFingerprint,
      timestamp: Date.now(),
      success: true,
    });

    return { allowed: true, session };
  }

  /**
   * Create watermarked version of document
   */
  async applyWatermark(
    documentData: ArrayBuffer,
    watermarkConfig: WatermarkConfig,
    userInfo: { email: string; name: string; timestamp: string }
  ): Promise<ArrayBuffer> {
    if (!watermarkConfig.enabled) {
      return documentData;
    }

    // For MVP, create metadata overlay (in production, would use image processing libraries)
    const watermarkData = {
      type: watermarkConfig.type,
      text: watermarkConfig.text || `© ${userInfo.name}`,
      timestamp: userInfo.timestamp,
      user: watermarkConfig.includeMeta ? userInfo.email : undefined,
      position: watermarkConfig.position,
      opacity: watermarkConfig.opacity,
      id: this.generateId(),
    };

    // In production implementation:
    // - For images: Use canvas or image processing library
    // - For PDFs: Use PDF manipulation library
    // - For documents: Embed invisible watermark in metadata

    // For now, return original data with watermark metadata
    const watermarkedData = new Uint8Array(documentData.byteLength + 1024);
    watermarkedData.set(new Uint8Array(documentData));

    // Append watermark metadata (in production, this would be embedded properly)
    const metadataString = JSON.stringify(watermarkData);
    const metadataBytes = new TextEncoder().encode(metadataString);
    watermarkedData.set(metadataBytes, documentData.byteLength);

    return watermarkedData.buffer;
  }

  /**
   * Track user action during view session
   */
  async trackViewAction(
    sessionId: string,
    action: Omit<ViewAction, 'allowed' | 'reason' | 'timestamp'>
  ): Promise<{ allowed: boolean; reason?: string }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return { allowed: false, reason: 'Invalid session' };
    }

    const shareLink = await this.getShareLinkById(session.shareId);
    if (!shareLink) {
      return { allowed: false, reason: 'Share link not found' };
    }

    // Check action permissions
    const actionAllowed = this.isActionAllowed(
      action.type,
      shareLink.permissions
    );
    const reason = actionAllowed ? undefined : `${action.type} not permitted`;

    // Create action record
    const viewAction: ViewAction = {
      ...action,
      timestamp: Date.now(),
      allowed: actionAllowed,
      reason,
    };

    // Update session
    session.actions.push(viewAction);
    session.lastActivityAt = Date.now();

    // Update download count for download actions
    if (action.type === 'download' && actionAllowed) {
      await this.incrementDownloadCount(shareLink.id);
    }

    // Store updated session
    await this.updateViewSession(session);

    return { allowed: actionAllowed, reason };
  }

  /**
   * Get client-side restrictions for session
   */
  getClientRestrictions(permissions: SharePermissions): SessionRestriction[] {
    const restrictions: SessionRestriction[] = [];

    if (!permissions.canCopy) {
      restrictions.push({ type: 'selection', enforced: true });
      restrictions.push({ type: 'rightclick', enforced: true });
    }

    if (!permissions.canPrint) {
      restrictions.push({ type: 'print', enforced: true });
    }

    // Always restrict screenshots and dev tools for sensitive documents
    restrictions.push({ type: 'screenshot', enforced: true });
    restrictions.push({ type: 'devtools', enforced: true });

    return restrictions;
  }

  /**
   * Validate location-based restrictions
   */
  private async validateLocationRestrictions(
    geofencing: GeofenceConfig,
    location?: { accuracy?: number; lat: number; lng: number }
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!geofencing.enabled) {
      return { allowed: true };
    }

    if (!location) {
      return { allowed: false, reason: 'Location required but not provided' };
    }

    // Check accuracy requirements
    if (
      geofencing.requireGPSAccuracy &&
      location.accuracy &&
      location.accuracy > geofencing.requireGPSAccuracy
    ) {
      return { allowed: false, reason: 'GPS accuracy insufficient' };
    }

    // Check allowed regions
    if (geofencing.allowedRegions.length > 0) {
      const inAllowedRegion = geofencing.allowedRegions.some(region =>
        this.isLocationInRegion(location, region)
      );

      if (!inAllowedRegion) {
        return { allowed: false, reason: 'Location not in allowed region' };
      }
    }

    // Check restricted regions
    if (geofencing.restrictedRegions.length > 0) {
      const inRestrictedRegion = geofencing.restrictedRegions.some(region =>
        this.isLocationInRegion(location, region)
      );

      if (inRestrictedRegion) {
        return { allowed: false, reason: 'Location in restricted region' };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if location is within a geographic region
   */
  private isLocationInRegion(
    location: { lat: number; lng: number },
    region: GeoRegion
  ): boolean {
    if (region.type === 'circle') {
      const center = region.coordinates[0];
      const distance = this.calculateDistance(
        location.lat,
        location.lng,
        center[0],
        center[1]
      );
      return distance <= (region.radius || 1000); // Default 1km radius
    }

    if (region.type === 'polygon') {
      return this.isPointInPolygon(location, region.coordinates);
    }

    return false;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Point-in-polygon test using ray casting algorithm
   */
  private isPointInPolygon(
    point: { lat: number; lng: number },
    polygon: number[][]
  ): boolean {
    let inside = false;
    const x = point.lng;
    const y = point.lat;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][1];
      const yi = polygon[i][0];
      const xj = polygon[j][1];
      const yj = polygon[j][0];

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Helper methods
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return encodeBase64(array)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private generateDeviceFingerprint(
    userAgent: string,
    ipAddress: string
  ): string {
    return createHash('sha256')
      .update(userAgent + ipAddress + Date.now().toString())
      .digest('hex');
  }

  private createAccessRestrictions(
    permissions: SharePermissions
  ): AccessRestriction[] {
    const restrictions: AccessRestriction[] = [];

    if (permissions.timeLimit) {
      restrictions.push({
        type: 'time',
        value: permissions.timeLimit,
        enforced: true,
        violationCount: 0,
      });
    }

    if (permissions.maxViews) {
      restrictions.push({
        type: 'usage',
        value: { maxViews: permissions.maxViews },
        enforced: true,
        violationCount: 0,
      });
    }

    if (permissions.ipWhitelist) {
      restrictions.push({
        type: 'ip',
        value: permissions.ipWhitelist,
        enforced: true,
        violationCount: 0,
      });
    }

    return restrictions;
  }

  private async validateRestrictions(
    shareLink: ShareLink,
    accessRequest: any
  ): Promise<{ allowed: boolean; reason?: string }> {
    // IP whitelist check
    if (
      shareLink.permissions.ipWhitelist &&
      shareLink.permissions.ipWhitelist.length > 0
    ) {
      if (
        !shareLink.permissions.ipWhitelist.includes(accessRequest.ipAddress)
      ) {
        return { allowed: false, reason: 'IP address not whitelisted' };
      }
    }

    // Device restrictions
    if (
      shareLink.permissions.deviceRestrictions &&
      shareLink.permissions.deviceRestrictions.length > 0
    ) {
      const deviceValidation = this.validateDeviceRestrictions(
        shareLink.permissions.deviceRestrictions,
        accessRequest.userAgent
      );
      if (!deviceValidation.allowed) {
        return deviceValidation;
      }
    }

    // Geofencing
    if (shareLink.permissions.geofencing) {
      const locationValidation = await this.validateLocationRestrictions(
        shareLink.permissions.geofencing,
        accessRequest.location
      );
      if (!locationValidation.allowed) {
        return locationValidation;
      }
    }

    return { allowed: true };
  }

  private validateDeviceRestrictions(
    restrictions: DeviceRestriction[],
    _userAgent: string
  ): { allowed: boolean; reason?: string } {
    for (const restriction of restrictions) {
      if (restriction.type === 'block') {
        // Check if current device matches block criteria
        // TODO: Implement device detection logic
        // This would parse userAgent to detect OS, browser, device type
      }
    }

    return { allowed: true };
  }

  private isActionAllowed(
    actionType: ViewAction['type'],
    permissions: SharePermissions
  ): boolean {
    switch (actionType) {
      case 'view':
        return permissions.canView;
      case 'download':
        return permissions.canDownload;
      case 'print':
        return permissions.canPrint;
      case 'copy':
        return permissions.canCopy;
      case 'share':
        return permissions.canShare;
      case 'comment':
        return permissions.canComment;
      default:
        return false;
    }
  }

  private async createViewSession(
    shareLink: ShareLink,
    accessRequest: any,
    _deviceFingerprint: string
  ): Promise<ViewSession> {
    const session: ViewSession = {
      sessionId: this.generateId(),
      shareId: shareLink.id,
      userId: accessRequest.userId,
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
      ipAddress: accessRequest.ipAddress,
      userAgent: accessRequest.userAgent,
      actions: [],
      restrictions: this.getClientRestrictions(shareLink.permissions),
    };

    this.activeSessions.set(session.sessionId, session);

    // Auto-expire session
    setTimeout(() => {
      this.activeSessions.delete(session.sessionId);
    }, this.SESSION_TIMEOUT);

    return session;
  }

  // Placeholder methods for data operations (would integrate with IndexedDB/Supabase)
  private async storeShareLink(_shareLink: ShareLink): Promise<void> {
    // TODO: Store in database
  }

  private async getShareLinkByToken(_token: string): Promise<null | ShareLink> {
    // TODO: Retrieve from database
    return null;
  }

  private async getShareLinkById(_id: string): Promise<null | ShareLink> {
    // TODO: Retrieve from database
    return null;
  }

  private async getDocumentAccessKey(
    _documentId: string
  ): Promise<null | string> {
    // TODO: Retrieve from secure storage
    return null;
  }

  private async encryptAccessKey(
    accessKey: string,
    _shareToken: string
  ): Promise<string> {
    // TODO: Encrypt access key with share token
    return encodeBase64(new TextEncoder().encode(accessKey));
  }

  private async deactivateShareLink(_id: string): Promise<void> {
    // TODO: Mark as inactive in database
  }

  private async incrementAccessCount(_id: string): Promise<void> {
    // TODO: Increment access count in database
  }

  private async incrementDownloadCount(_id: string): Promise<void> {
    // TODO: Increment download count in database
  }

  private async logAccessAttempt(
    _shareId: string,
    _attempt: AccessAttempt
  ): Promise<void> {
    // TODO: Log access attempt
  }

  private async updateViewSession(_session: ViewSession): Promise<void> {
    // TODO: Update session in storage
  }
}

// Export singleton instance
export const advancedSharingControls = new AdvancedSharingControlsService();
export default advancedSharingControls;
