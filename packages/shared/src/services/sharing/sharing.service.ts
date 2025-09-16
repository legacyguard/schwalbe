export interface SharePermissions {
  read: boolean;
  download: boolean;
  comment: boolean;
  share: boolean;
}

export interface CreateShareLinkInput {
  resourceType: 'document' | 'will' | 'vault' | 'family';
  resourceId: string;
  permissions?: Partial<SharePermissions>;
  expiresAt?: string; // ISO string
  maxAccessCount?: number;
  password?: string;
}

export interface CreateShareLinkResult {
  shareId: string;
  expiresAt: string | null;
  permissions: SharePermissions;
}

export interface VerifyShareAccessResult {
  status: 'ok' | 'invalid' | 'expired' | 'password_required' | 'password_incorrect';
  reason?: string | null;
  resourceType?: CreateShareLinkInput['resourceType'];
  resourceId?: string;
  permissions?: SharePermissions;
  expiresAt?: string | null;
  hasPassword?: boolean;
}

import { supabase } from '../../supabase/client';

function normalizePermissions(p?: Partial<SharePermissions>): SharePermissions {
  return {
    read: p?.read ?? true,
    download: p?.download ?? false,
    comment: p?.comment ?? false,
    share: p?.share ?? false,
  };
}

export class SharingService {
  /**
   * Create a share link via RPC. Requires an authenticated session.
   */
  static async createShareLink(input: CreateShareLinkInput): Promise<CreateShareLinkResult> {
    const permissions = normalizePermissions(input.permissions);
    const { data, error } = await supabase.rpc('create_share_link', {
      p_resource_type: input.resourceType,
      p_resource_id: input.resourceId,
      p_permissions: permissions,
      p_expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
      p_max_access_count: input.maxAccessCount ?? null,
      p_password: input.password ?? null,
    });

    if (error) {
      // Avoid logging RPC error details
      console.error('createShareLink RPC error');
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      shareId: row.share_id,
      expiresAt: row.expires_at,
      permissions: row.permissions,
    };
  }

  /**
   * Verify a share link (anonymous allowed). Returns status and resource identifiers if allowed.
   */
  static async verifyShareAccess(shareId: string, password?: string): Promise<VerifyShareAccessResult> {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

    const { data, error } = await supabase.rpc('verify_share_access', {
      p_share_id: shareId,
      p_password: password ?? null,
      p_user_agent: userAgent ?? null,
      p_ip: null, // server functions can enrich; browsers cannot
    });

    if (error) {
      // Avoid logging RPC error details
      console.error('verifyShareAccess RPC error');
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      status: row.status,
      reason: row.reason,
      resourceType: row.resource_type ?? undefined,
      resourceId: row.resource_id ?? undefined,
      permissions: row.permissions ?? undefined,
      expiresAt: row.expires_at ?? undefined,
      hasPassword: row.has_password ?? undefined,
    };
  }
}

export const sharingService = SharingService;
