import { nextRun } from '../../reminders/schedule'

describe('schedule.nextRun', () => {
  test('daily interval 1', () => {
    const scheduled = '2025-01-01T10:00:00.000Z'
    const from = '2025-01-02T10:01:00.000Z'
    const next = nextRun(scheduled, 'FREQ=DAILY;INTERVAL=1', from)!
    expect(new Date(next).toISOString()).toBe('2025-01-03T10:00:00.000Z')
  })

  test('weekly interval 2', () => {
    const scheduled = '2025-01-01T10:00:00.000Z' // Wed
    const from = '2025-01-15T10:00:01.000Z'
    const next = nextRun(scheduled, 'FREQ=WEEKLY;INTERVAL=2', from)!
    expect(new Date(next).toISOString()).toBe('2025-01-29T10:00:00.000Z')
  })

  test('no recurrence returns null', () => {
    const scheduled = '2025-01-01T10:00:00.000Z'
    const next = nextRun(scheduled, null)
    expect(next).toBeNull()
  })
})
