// Change detection utilities for Automatic Will Updates
// All code and comments are in English.

import type {
  AssetItem,
  BeneficiaryItem,
  GuardianItem,
  ItemChange,
  WillSnapshot,
  ExternalState,
  DetectedChanges,
} from './types';

function byIdMap<T extends { id: string }>(items: T[] = []): Map<string, T> {
  const m = new Map<string, T>();
  for (const it of items) m.set(it.id, it);
  return m;
}

function computeListChanges<T extends { id: string }>(before: T[], after: T[]): ItemChange<T>[] {
  const beforeMap = byIdMap(before || []);
  const afterMap = byIdMap(after || []);
  const changes: ItemChange<T>[] = [];

  // Removed and modified
  for (const [id, prev] of beforeMap) {
    const next = afterMap.get(id);
    if (!next) {
      changes.push({ kind: 'removed', id, before: prev });
    } else if (JSON.stringify(prev) !== JSON.stringify(next)) {
      changes.push({ kind: 'modified', id, before: prev, after: next });
    }
  }

  // Added
  for (const [id, next] of afterMap) {
    if (!beforeMap.has(id)) changes.push({ kind: 'added', id, after: next });
  }

  return changes;
}

export function detectChanges(
  snapshot: WillSnapshot,
  external: ExternalState
): DetectedChanges {
  // Extract current lists from snapshot
  const currentAssets = extractAssetsFromSnapshot(snapshot) as AssetItem[];
  const currentBeneficiaries = snapshot.beneficiaries || [];
  const currentGuardians = extractGuardiansFromSnapshot(snapshot) as GuardianItem[];

  const assets = computeListChanges(currentAssets, normalizeAssets(external.assets));
  const beneficiaries = computeListChanges(currentBeneficiaries, external.beneficiaries || []);
  const guardians = computeListChanges(currentGuardians, external.guardians || []);

  const summary = summarize({ assets, beneficiaries, guardians });

  return { assets, beneficiaries, guardians, summary };
}

// Helper: pull a normalized asset list out of will snapshot JSON structure
function extractAssetsFromSnapshot(snapshot: WillSnapshot): AssetItem[] {
  const a = snapshot.assets || {};
  const flat: AssetItem[] = [];
  const pushList = (list: any[], category: string) => {
    for (const it of list || []) {
      const id = String(it.id || it.vin || it.accountNumber || `${category}-${flat.length}`);
      flat.push({ id, category, ...it });
    }
  };
  pushList((a as any).realEstate || (a as any).real_estate || [], 'real_estate');
  pushList((a as any).vehicles || [], 'vehicle');
  pushList((a as any).bankAccounts || (a as any).bank_accounts || [], 'bank_account');
  pushList((a as any).investments || [], 'investment');
  pushList((a as any).personalProperty || (a as any).personal_property || [], 'personal_property');
  pushList((a as any).digitalAssets || (a as any).digital_assets || [], 'digital_asset');
  return flat;
}

function normalizeAssets(list: AssetItem[]): AssetItem[] {
  return (list || []).map((it) => ({ ...it, category: it.category || guessCategory(it) }));
}

function guessCategory(a: AssetItem): string {
  if (a.category) return a.category;
  const t = `${a.title || a.description || ''}`.toLowerCase();
  if (/house|home|real\s?estate|apartment|property/.test(t)) return 'real_estate';
  if (/car|vehicle|vin/.test(t)) return 'vehicle';
  if (/bank|account|iban|checking|savings/.test(t)) return 'bank_account';
  if (/stock|fund|investment|brokerage|etf/.test(t)) return 'investment';
  if (/wallet|crypto|digital/.test(t)) return 'digital_asset';
  return 'personal_property';
}

function extractGuardiansFromSnapshot(snapshot: WillSnapshot): GuardianItem[] {
  const g = snapshot.guardianship || {};
  const list: GuardianItem[] = [];
  const p = (g as any).primaryGuardian;
  const b = (g as any).backupGuardian;
  const kids = (g as any).minorChildren || [];
  if (p) list.push({ id: String(p.id || 'primary'), name: p.name || 'Primary Guardian', relationship: p.relationship, priority: 1, isChildGuardian: true });
  if (b) list.push({ id: String(b.id || 'backup'), name: b.name || 'Backup Guardian', relationship: b.relationship, priority: 2, isChildGuardian: true });
  // Children records are ignored for guardian comparison; they are subjects not guardians
  return list;
}

function summarize(payload: {
  assets: ItemChange<AssetItem>[];
  beneficiaries: ItemChange<BeneficiaryItem>[];
  guardians: ItemChange<GuardianItem>[];
}): string {
  const aAdd = payload.assets.filter(c => c.kind === 'added').length;
  const aRem = payload.assets.filter(c => c.kind === 'removed').length;
  const bAdd = payload.beneficiaries.filter(c => c.kind === 'added').length;
  const bRem = payload.beneficiaries.filter(c => c.kind === 'removed').length;
  const gMod = payload.guardians.filter(c => c.kind !== 'added' || c.kind !== 'removed').length;
  const parts = [] as string[];
  if (aAdd || aRem) parts.push(`Assets: +${aAdd}, -${aRem}`);
  if (bAdd || bRem) parts.push(`Beneficiaries: +${bAdd}, -${bRem}`);
  if (payload.guardians.length) parts.push(`Guardians: ${payload.guardians.length} change(s)`);
  return parts.length ? parts.join(' | ') : 'No relevant changes detected';
}