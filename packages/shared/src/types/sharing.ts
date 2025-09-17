import type { SharePermissions } from '../services/sharing/sharing.service';

export interface ShareLink {
  shareId: string;
  resourceType: string;
  resourceId: string;
  permissions: SharePermissions;
  createdAt: string;
  expiresAt?: string;
  maxAccessCount?: number;
  accessCount: number;
  isActive: boolean;
}