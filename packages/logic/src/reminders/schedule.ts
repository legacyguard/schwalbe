export type Freq = 'DAILY' | 'WEEKLY' | 'MONTHLY'
export interface Rule { freq?: Freq, interval: number }

export function parseRRule(rrule: string | null): Rule {
  if (!rrule) return { interval: 0 }
  const parts = Object.fromEntries(rrule.split(';').map(s => s.split('='))) as Record<string, string>
  const freq = parts['FREQ'] as Freq | undefined
  const interval = Math.max(1, parseInt(parts['INTERVAL'] || '1', 10))
  return { freq, interval }
}

export function nextRun(scheduledAtISO: string, rrule: string | null, fromISO?: string): string | null {
  const rule = parseRRule(rrule)
  if (!rule.freq) return null
  const from = fromISO ? new Date(fromISO) : new Date()
  const next = new Date(scheduledAtISO)
  let i = 0
  while (next <= from && i < 1000) {
    if (rule.freq === 'DAILY') next.setUTCDate(next.getUTCDate() + rule.interval)
    else if (rule.freq === 'WEEKLY') next.setUTCDate(next.getUTCDate() + rule.interval * 7)
    else if (rule.freq === 'MONTHLY') next.setUTCMonth(next.getUTCMonth() + rule.interval)
    i++
  }
  return i >= 1000 ? null : next.toISOString()
}
