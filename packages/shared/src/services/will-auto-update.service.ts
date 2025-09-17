/**
 * Will Auto-Update Service
 * Orchestrates detection, proposal, approval, application, rollback, and notifications.
 *
 * All code and comments are in English. UI strings should be i18n in the UI layer.
 */

import { supabase } from '../supabase/client';
import { emailService } from './email.service';
import { monitoringService } from './monitoring.service';
import type { WillPatch, WillSnapshot, ExternalState } from '@schwalbe/logic';
import { detectChanges, buildPatch, applyPatch } from '@schwalbe/logic';

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'applied' | 'rolled_back';

export interface ProposalRow {
  id: string;
  will_id: string;
  user_id: string;
  status: ProposalStatus;
  patch: WillPatch;
  summary: string;
  created_at: string;
  approved_at?: string | null;
  applied_at?: string | null;
  rolled_back_at?: string | null;
}

class WillAutoUpdateService {
  async detectAndPropose(willId: string): Promise<{ proposalId?: string; summary?: string } | { error: string } > {
    try {
      const will = await this.getWillSnapshot(willId);
      if (!will) return { error: 'Will not found' };

      const external = await this.fetchExternalState(will.userId);
      const detected = detectChanges(will, external);
      if (detected.summary === 'No relevant changes detected') {
        return { proposalId: undefined, summary: detected.summary };
      }

      const patch = buildPatch(will, detected, { safeMode: true });

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id as string | undefined;
      if (!userId) return { error: 'Unauthorized' };

      const { data, error } = await supabase
        .from('will_update_proposals')
        .insert({
          will_id: will.id,
          user_id: userId,
          status: 'pending',
          patch,
          summary: patch.summary,
        })
        .select('id')
        .single();

      if (error) {
        await monitoringService.error('create_proposal_failed', { will_id: will.id });
        return { error: 'Failed to create proposal' };
      }

      // Notify user via email (non-PII)
      await emailService.sendWillUpdateProposal(user?.email ?? '', {
        changeSummary: patch.summary,
      });

      return { proposalId: data.id, summary: patch.summary };
    } catch (err) {
      await monitoringService.error('detect_and_propose_failed', {}, err);
      return { error: 'Internal error' };
    }
  }

  async approveAndApply(proposalId: string): Promise<{ appliedVersionId?: string } | { error: string }> {
    try {
      const { data: proposal, error: pErr } = await supabase
        .from('will_update_proposals')
        .select('*')
        .eq('id', proposalId)
        .single();
      if (pErr || !proposal) return { error: 'Proposal not found' };
      if (proposal.status !== 'pending' && proposal.status !== 'approved') return { error: 'Proposal is not approvable' };

      // Load the will row
      const { data: willRow, error: wErr } = await supabase
        .from('wills')
        .select('*')
        .eq('id', proposal.will_id)
        .single();
      if (wErr || !willRow) return { error: 'Will not found' };

      // Apply patch to existing will JSON
      const { next } = applyPatch(
        {
          assets: willRow.assets || {},
          beneficiaries: willRow.beneficiaries || [],
          guardianship: willRow.guardianship_data || {},
        },
        proposal.patch as WillPatch
      );

      // Persist: create will_versions snapshot AFTER
      const afterVersion = {
        assets: (next as any).assets,
        beneficiaries: (next as any).beneficiaries,
        guardianship_data: (next as any).guardianship,
        version_number: (willRow.version_number || 1) + 1,
      };

      // Transactional-like sequence (best-effort; Supabase has no multi-statement transactions via JS client)
      // 1) Insert new will_version
      const { data: vrow, error: vErr } = await supabase
        .from('will_versions')
        .insert({
          will_id: willRow.id,
          version_number: afterVersion.version_number,
          version_data: afterVersion,
          change_summary: proposal.summary,
        })
        .select('id')
        .single();
      if (vErr || !vrow) return { error: 'Failed to record version' };

      // 2) Update the will document
      const { error: uErr } = await supabase
        .from('wills')
        .update({
          assets: (next as any).assets,
          beneficiaries: (next as any).beneficiaries,
          guardianship_data: (next as any).guardianship,
          version_number: afterVersion.version_number,
        })
        .eq('id', willRow.id);
      if (uErr) return { error: 'Failed to update will' };

      // 3) Mark proposal applied
      const { error: pUpdateErr } = await supabase
        .from('will_update_proposals')
        .update({ status: 'applied', applied_at: new Date().toISOString() })
        .eq('id', proposalId);
      if (pUpdateErr) {
        await monitoringService.warn('proposal_mark_applied_failed', { proposalId });
      }

      // Notify user
      const { data: { user } } = await supabase.auth.getUser();
      await emailService.sendWillUpdateApplied(user?.email ?? '', { changeSummary: proposal.summary });

      return { appliedVersionId: vrow.id };
    } catch (err) {
      await monitoringService.error('approve_and_apply_failed', { proposalId }, err);
      return { error: 'Internal error' };
    }
  }

  async rollbackToVersion(willId: string, versionNumber: number): Promise<{ ok: true } | { error: string }> {
    try {
      const { data: ver, error } = await supabase
        .from('will_versions')
        .select('*')
        .eq('will_id', willId)
        .eq('version_number', versionNumber)
        .single();
      if (error || !ver) return { error: 'Version not found' };

      const v = ver.version_data || {};
      const { error: uErr } = await supabase
        .from('wills')
        .update({
          assets: v.assets || {},
          beneficiaries: v.beneficiaries || [],
          guardianship_data: v.guardianship_data || {},
          version_number: versionNumber,
        })
        .eq('id', willId);
      if (uErr) return { error: 'Failed to rollback' };

      return { ok: true };
    } catch (err) {
      await monitoringService.error('rollback_failed', { willId, versionNumber }, err);
      return { error: 'Internal error' };
    }
  }

  // -----------------------
  // Helpers
  // -----------------------

  private async getWillSnapshot(willId: string): Promise<WillSnapshot | null> {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', willId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      assets: data.assets || {},
      beneficiaries: data.beneficiaries || [],
      guardianship: data.guardianship_data || {},
      versionNumber: data.version_number,
    };
  }

  private async fetchExternalState(userId: string): Promise<ExternalState> {
    // Assets: legacy_items category=asset (best-effort)
    const { data: legacyAssets } = await supabase
      .from('legacy_items')
      .select('*')
      .eq('user_id', userId)
      .eq('category', 'asset');

    // Guardians: guardians table
    const { data: guardians } = await supabase
      .from('guardians')
      .select('*')
      .eq('user_id', userId);

    // Beneficiaries: none canonical yet; use will.beneficiaries enrichment path -> fallback empty
    return {
      assets: (legacyAssets || []).map((r: any) => ({ id: r.id, title: r.title, description: r.description, value: r.metadata?.value, status: r.status === 'archived' ? 'archived' : 'active' })),
      beneficiaries: [],
      guardians: (guardians || []).map((g: any) => ({ id: g.id, name: g.name, relationship: g.relationship, priority: g.emergency_contact_priority || 99, isChildGuardian: true })),
    };
  }
}

export const willAutoUpdateService = new WillAutoUpdateService();