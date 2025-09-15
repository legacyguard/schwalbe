import { detectAssetConflicts } from '../../assets/conflicts';

describe('detectAssetConflicts', () => {
  it('returns duplicate name conflicts within same category', () => {
    const issues = detectAssetConflicts([
      { id: '1', category: 'property', name: 'Home', estimated_value: 100 },
      { id: '2', category: 'property', name: 'home', estimated_value: 200 },
      { id: '3', category: 'vehicle', name: 'home', estimated_value: 50 },
    ]);
    // Only duplicate within same category should flag; vehicle+home is separate category
    expect(issues.some(i => i.id === '2')).toBe(true);
    expect(issues.some(i => i.id === '3')).toBe(false);
  });

  it('returns negative value conflicts', () => {
    const issues = detectAssetConflicts([
      { id: '1', category: 'personal', name: 'Ring', estimated_value: -1 },
    ]);
    expect(issues.find(i => i.id === '1' && i.message.includes('negative'))).toBeTruthy();
  });
});
