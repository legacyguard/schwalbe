// Smart update rules for Automatic Will Updates
// All code and comments are in English.

import type {
  AssetItem,
  BeneficiaryItem,
  GuardianItem,
  DetectedChanges,
  PatchOperation,
  WillPatch,
  WillSnapshot,
} from './types';

export interface RuleOptions {
  // Avoid legally risky operations automatically; instead propose with warnings
  safeMode?: boolean;
}

export function buildPatch(
  snapshot: WillSnapshot,
  changes: DetectedChanges,
  _options: RuleOptions = { safeMode: true }
): WillPatch {
  const ops: PatchOperation[] = [];
  let assetsAdded = 0;
  let assetsRemoved = 0;
  let beneficiariesAdded = 0;
  let beneficiariesRemoved = 0;
  let guardiansUpdated = 0;

  // Assets rules: add newly detected active assets; remove assets archived
  for (const c of changes.assets) {
    if (c.kind === 'added' && (!c.after || c.after.status !== 'archived')) {
      assetsAdded++;
      ops.push({ op: 'push', path: 'assets.personal_property', value: sanitizeAsset(c.after!) });
    }
    if (c.kind === 'removed' || (c.after && c.after.status === 'archived')) {
      assetsRemoved++;
      // Non-destructive: mark removal in metadata rather than deleting; UI may reflect
      ops.push({ op: 'set', path: `assetsMeta.removed.${c.id}`, value: true });
    }
    if (c.kind === 'modified') {
      // Update value/recipient fields in place via set with id-keyed path (requires client-side resolver)
      ops.push({ op: 'set', path: `assetsUpdates.${c.id}`, value: diffObject(c.before!, c.after!) });
    }
  }

  // Beneficiaries rules: never reduce percentages automatically; only add missing or enrich contact
  for (const c of changes.beneficiaries) {
    if (c.kind === 'added') {
      beneficiariesAdded++;
      const safe = sanitizeBeneficiary(c.after!);
      // If percentage is missing, do not auto-assign; leave to approval UI
      safe.percentage = undefined;
      ops.push({ op: 'push', path: 'beneficiaries', value: safe });
    }
    if (c.kind === 'removed') {
      beneficiariesRemoved++;
      // Soft remove by flag; avoid destructive deletion without explicit approval
      ops.push({ op: 'set', path: `beneficiariesMeta.removed.${c.id}`, value: true });
    }
    if (c.kind === 'modified') {
      // Update only non-dispositive fields automatically (contact info)
      const delta = diffObject(c.before!, c.after!);
      const safeDelta = filterKeys(delta, ['contact', 'relationship', 'name']);
      if (Object.keys(safeDelta).length) {
        ops.push({ op: 'set', path: `beneficiariesUpdates.${c.id}`, value: safeDelta });
      }
    }
  }

  // Guardians rules: prefer highest-priority as primary; second as backup
  if (changes.guardians.length) {
    guardiansUpdated = changes.guardians.length;
    const current = extractGuardianCandidates(changes);
    const sorted = [...current].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
    const primary = sorted[0];
    const backup = sorted[1];
    if (primary) {
      ops.push({ op: 'set', path: 'guardianship.primaryGuardian', value: sanitizeGuardian(primary) });
    }
    if (backup) {
      ops.push({ op: 'set', path: 'guardianship.backupGuardian', value: sanitizeGuardian(backup) });
    }
  }

  return {
    willId: snapshot.id,
    operations: ops,
    meta: {
      assetsAdded,
      assetsRemoved,
      beneficiariesAdded,
      beneficiariesRemoved,
      guardiansUpdated,
    },
    summary: changes.summary,
  };
}

function sanitizeAsset(a: AssetItem): Partial<AssetItem> {
  // Strip PII-like details; keep category/title/value/recipient only
  const { id, category, title, value, recipient } = a;
  return { id, category, title, value, recipient };
}

function sanitizeBeneficiary(b: BeneficiaryItem): Partial<BeneficiaryItem> {
  const { id, name, relationship, contact, isBackup } = b;
  return { id, name, relationship, contact, isBackup };
}

function sanitizeGuardian(g: GuardianItem): Partial<GuardianItem> {
  const { id, name, relationship, priority, isChildGuardian, isWillExecutor } = g;
  return { id, name, relationship, priority, isChildGuardian, isWillExecutor };
}

function extractGuardianCandidates(changes: {
  guardians: { kind: string; id: string; after?: GuardianItem; before?: GuardianItem }[];
}): GuardianItem[] {
  const set = new Map<string, GuardianItem>();
  for (const c of changes.guardians) {
    const row = c.after || c.before;
    if (row) set.set(row.id, row);
  }
  return [...set.values()];
}

function diffObject(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) {
    const av = a[k];
    const bv = b[k];
    if (JSON.stringify(av) !== JSON.stringify(bv)) out[k] = bv;
  }
  return out;
}

function filterKeys<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
  const out: Partial<T> = {};
  for (const k of keys) {
    if (k in obj) (out as any)[k] = obj[k];
  }
  return out;
}