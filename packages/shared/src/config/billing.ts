
// Billing configuration shared across app layers
// Environment overrides are supported; defaults are safe.

export type CancellationPolicy = 'end_of_period' | 'immediate'

function readEnv(name: string): string | undefined {
  // Vite (web)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viteVal = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[name]) as string | undefined
  if (viteVal !== undefined) return viteVal
  // Deno / Edge Functions
  // eslint-disable-next-line no-undef
  try { return (typeof Deno !== 'undefined' ? Deno.env.get(name) ?? undefined : undefined) } catch { /* noop */ }
  // Node (tests)
  if (typeof process !== 'undefined' && process.env) return process.env[name]
  return undefined
}

function boolFromEnv(name: string, def: boolean): boolean {
  const v = readEnv(name)
  if (v === undefined) return def
  return ['1','true','yes','on'].includes(String(v).toLowerCase())
}

function intFromEnv(name: string, def: number): number {
  const v = readEnv(name)
  if (v === undefined) return def
  const n = parseInt(String(v), 10)
  return Number.isFinite(n) ? n : def
}

function policyFromEnv(name: string, def: CancellationPolicy): CancellationPolicy {
  const v = (readEnv(name) ?? '').toLowerCase()
  return v === 'immediate' || v === 'end_of_period' ? (v as CancellationPolicy) : def
}

export const billingConfig = {
  cancellationPolicy: policyFromEnv('BILLING_CANCELLATION_POLICY', 'end_of_period') as CancellationPolicy,
  trialEnabled: boolFromEnv('BILLING_TRIAL_ENABLED', false),
  trialDays: intFromEnv('BILLING_TRIAL_DAYS', 7),
  gracePeriodDays: intFromEnv('BILLING_GRACE_PERIOD_DAYS', 0),
  trialEndingNoticeDays: intFromEnv('BILLING_TRIAL_NOTICE_DAYS', 3),
} as const

export function isTrialActive(status?: string | null): boolean {
  return (status ?? '').toLowerCase() === 'trialing'
}

export function daysUntil(dateISO?: string | null): number | null {
  if (!dateISO) return null
  const end = new Date(dateISO)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  const d = Math.ceil(diffMs / (1000*60*60*24))
  return d >= 0 ? d : 0
}
