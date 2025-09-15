import { detectChanges } from '../../will/autoUpdate/diff'
import { buildPatch } from '../../will/autoUpdate/rules'
import { applyPatch, rollback } from '../../will/autoUpdate/patch'
import type { WillSnapshot, ExternalState } from '../../will/autoUpdate/types'

describe('Automatic Will Updates - detection and rollback', () => {
  const snapshot: WillSnapshot = {
    id: 'will-1',
    userId: 'user-1',
    assets: {
      personal_property: [ { id: 'pp1', title: 'Watch', value: 100 } ],
    },
    beneficiaries: [
      { id: 'b1', name: 'Alice', relationship: 'spouse', percentage: 50 },
    ],
    guardianship: {
      primaryGuardian: { id: 'g1', name: 'John', relationship: 'brother' },
    },
    versionNumber: 1,
  }

  const external: ExternalState = {
    assets: [
      { id: 'pp1', category: 'personal_property', title: 'Watch', value: 100 },
      { id: 'pp2', category: 'personal_property', title: 'Necklace', value: 200 },
    ],
    beneficiaries: [
      { id: 'b1', name: 'Alice', relationship: 'spouse', percentage: 50 },
      { id: 'b2', name: 'Bob', relationship: 'child', percentage: 50 },
    ],
    guardians: [
      { id: 'g2', name: 'Emily', relationship: 'sister', priority: 1, isChildGuardian: true },
      { id: 'g1', name: 'John', relationship: 'brother', priority: 2, isChildGuardian: true },
    ],
  }

  test('Detects additions and builds patch', () => {
    const changes = detectChanges(snapshot, external)
    expect(changes.assets.find(c => c.kind === 'added' && c.id === 'pp2')).toBeTruthy()
    expect(changes.beneficiaries.find(c => c.kind === 'added' && c.id === 'b2')).toBeTruthy()
    const patch = buildPatch(snapshot, changes)
    expect(patch.operations.length).toBeGreaterThan(0)
  })

  test('Apply patch and rollback produce original state', () => {
    const changes = detectChanges(snapshot, external)
    const patch = buildPatch(snapshot, changes)

    const { next, inverse } = applyPatch(snapshot, patch)
    // Ensure asset got pushed
    const pp = (next as any).assets?.personal_property
    expect(Array.isArray(pp)).toBe(true)
    expect(pp.length).toBeGreaterThan(1)

    const restored = rollback(next, inverse)
    expect(JSON.stringify(restored)).toEqual(JSON.stringify(snapshot))
  })
})