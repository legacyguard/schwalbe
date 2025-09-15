// Types for Automatic Will Updates
// All code and comments are in English.

export type ItemChange<T> = {
  kind: 'added' | 'removed' | 'modified';
  id: string;
  before?: T;
  after?: T;
};

export interface AssetItem {
  id: string;
  category?: string; // e.g., real_estate, vehicle, bank_account, etc.
  title?: string;
  description?: string;
  value?: number;
  recipient?: string | null; // Beneficiary ID
  status?: 'active' | 'archived';
  [k: string]: unknown;
}

export interface BeneficiaryItem {
  id: string;
  name: string;
  relationship?: string; // free text; engine rules can normalize
  percentage?: number; // 0-100
  isBackup?: boolean;
  contact?: { email?: string; phone?: string; address?: string };
  [k: string]: unknown;
}

export interface GuardianItem {
  id: string;
  name: string;
  relationship?: string;
  priority?: number; // lower is higher priority
  isChildGuardian?: boolean;
  isWillExecutor?: boolean;
  [k: string]: unknown;
}

export interface WillSnapshot {
  id: string;
  userId: string;
  // Minimal subset used by auto-update; the rest of will remains untouched
  assets: Record<string, unknown>;
  beneficiaries: BeneficiaryItem[];
  guardianship: Record<string, unknown>;
  versionNumber?: number;
}

export interface ExternalState {
  assets: AssetItem[];
  beneficiaries: BeneficiaryItem[];
  guardians: GuardianItem[];
}

export interface DetectedChanges {
  assets: ItemChange<AssetItem>[];
  beneficiaries: ItemChange<BeneficiaryItem>[];
  guardians: ItemChange<GuardianItem>[];
  // Human readable change summary in English
  summary: string;
}

export type PatchOperation =
  | { op: 'set'; path: string; value: unknown }
  | { op: 'unset'; path: string }
  | { op: 'push'; path: string; value: unknown }
  | { op: 'removeAt'; path: string; index: number };

export interface WillPatch {
  willId: string;
  operations: PatchOperation[];
  // Safe metadata free of PII; only counts and categories allowed
  meta: {
    assetsAdded: number;
    assetsRemoved: number;
    beneficiariesAdded: number;
    beneficiariesRemoved: number;
    guardiansUpdated: number;
  };
  summary: string;
}