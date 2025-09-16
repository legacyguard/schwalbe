import type { SupabaseClient } from '@supabase/supabase-js'
import { LEGAL_VERSIONS } from '@/lib/legal'

const COOKIE_NAME = 'lg.cookie-consent'

export function hasDeviceAccepted(tag: string): boolean {
  const val = getCookie(COOKIESAFE(COOKIE_NAME)) || getCookie(COOKIE_NAME)
  return typeof val === 'string' && val.startsWith(tag)
}

export function markDeviceConsentAccepted(tag: string) {
  setCookie(COOKIE_NAME, `${tag}:${Date.now()}`, 365)
}

function setCookie(name: string, value: string, days: number) {
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = 'expires=' + d.toUTCString()
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

function COOKIESAFE(name: string) {
  // Backward/forward compatibility helper if naming needs to change
  return name
}

export async function ensureConsentRow(supabase: SupabaseClient, forceUpdate = false): Promise<boolean> {
  // Returns true if it created/updated a row
  const { data: session } = await supabase.auth.getSession()
  const user = session.session?.user
  if (!user) return false

  const { data, error } = await supabase
    .from('user_consents')
    .select('user_id, terms_version, privacy_version, cookies_version')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    // ignore select errors
  }

  if (!data) {
    const { error: insErr } = await supabase.from('user_consents').insert({
      user_id: user.id,
      terms_version: LEGAL_VERSIONS.terms,
      privacy_version: LEGAL_VERSIONS.privacy,
      cookies_version: LEGAL_VERSIONS.cookies,
      consented_at: new Date().toISOString(),
    })
    if (!insErr) return true
    return false
  }

  if (forceUpdate && (
    data.terms_version !== LEGAL_VERSIONS.terms ||
    data.privacy_version !== LEGAL_VERSIONS.privacy ||
    data.cookies_version !== LEGAL_VERSIONS.cookies
  )) {
    const { error: updErr } = await supabase
      .from('user_consents')
      .update({
        terms_version: LEGAL_VERSIONS.terms,
        privacy_version: LEGAL_VERSIONS.privacy,
        cookies_version: LEGAL_VERSIONS.cookies,
        consented_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
    if (!updErr) return true
  }

  return false
}