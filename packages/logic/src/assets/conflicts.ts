export type ConflictIssue<TId extends string | number = string> = { id: TId; message: string };

export type MinimalAsset = {
  id: string;
  category: 'property' | 'vehicle' | 'financial' | 'business' | 'personal';
  name?: string | null;
  estimated_value?: number | null;
};

export function detectAssetConflicts(assets: MinimalAsset[]): ConflictIssue[] {
  const issues: ConflictIssue[] = [];
  // Duplicate name in same category
  const keyMap = new Map<string, string>();
  for (const a of assets) {
    const key = `${a.category}:${(a.name || '').trim().toLowerCase()}`;
    if (!key.trim()) continue;
    if (keyMap.has(key)) {
      issues.push({ id: a.id, message: 'Potential duplicate asset with the same name in this category.' });
    } else {
      keyMap.set(key, a.id);
    }
  }
  // Negative values
  for (const a of assets) {
    if ((a.estimated_value || 0) < 0) {
      issues.push({ id: a.id, message: 'Estimated value cannot be negative.' });
    }
  }
  return issues;
}
