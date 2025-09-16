// Using Jest globals for consistency across repo

function computeReminderDate(expiresAt: Date, daysBefore: number): Date {
  const d = new Date(expiresAt)
  d.setUTCDate(d.getUTCDate() - daysBefore)
  return d
}

describe('subscription reminder scheduling', () => {
  it('subtracts days correctly (no DST surprises in UTC math)', () => {
    const expires = new Date('2025-12-31T00:00:00.000Z')
    const r7 = computeReminderDate(expires, 7)
    const r1 = computeReminderDate(expires, 1)
    expect(r7.toISOString()).toBe('2025-12-24T00:00:00.000Z')
    expect(r1.toISOString()).toBe('2025-12-30T00:00:00.000Z')
  })
})