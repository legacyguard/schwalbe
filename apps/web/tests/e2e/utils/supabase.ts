import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

type CheckoutInput = {
  plan: 'premium' | 'family' | 'essential'
  userId: string
  successUrl: string
  cancelUrl: string
}

export function createSupabaseClient(): SupabaseClient {
  const url = process.env.E2E_SUPABASE_URL
  const anon = process.env.E2E_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Missing E2E_SUPABASE_URL or E2E_SUPABASE_ANON_KEY env')
  return createClient(url, anon)
}

export async function signInTestUser(supabase: SupabaseClient): Promise<{ user: User }> {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD
  if (!email || !password) throw new Error('Missing E2E_TEST_EMAIL or E2E_TEST_PASSWORD env')

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data?.user) throw new Error('Unable to sign in test user')
  return { user: data.user }
}

export async function createCheckoutSession(supabase: SupabaseClient, input: CheckoutInput): Promise<{ sessionId: string; url: string }> {
  // Uses the authenticated supabase client; token is sent automatically
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: {
      plan: input.plan,
      userId: input.userId,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    },
  })
  if (error) throw error
  const payload = (data || {}) as any
  if (!payload.url) throw new Error('No checkout URL returned')
  return { sessionId: payload.sessionId, url: payload.url }
}

export async function waitForSubscriptionStatus(
  supabase: SupabaseClient,
  status: 'active' | 'past_due' | 'cancelled' | 'inactive' | 'trialing',
  opts: { timeoutMs?: number } = {}
): Promise<void> {
  const timeout = Date.now() + (opts.timeoutMs ?? 60_000)
  let last: any = null
  while (Date.now() < timeout) {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth.user?.id
    if (!uid) throw new Error('No auth user present in waitForSubscriptionStatus')
    const { data } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', uid)
      .maybeSingle()
    last = data
    if ((data as any)?.status === status) return
    await new Promise((r) => setTimeout(r, 3000))
  }
  throw new Error(`Timed out waiting for subscription status=${status}. Last seen=${JSON.stringify(last ?? {})}`)
}

export async function createShareLink(
  supabase: SupabaseClient,
  input: { resourceType: 'document' | 'will' | 'vault' | 'family'; resourceId: string; expiresAtISO?: string | null }
): Promise<{ shareId: string; expiresAt: string | null; permissions: any }> {
  const { data, error } = await supabase.rpc('create_share_link', {
    p_resource_type: input.resourceType,
    p_resource_id: input.resourceId,
    p_permissions: { read: true, download: false, comment: false, share: false },
    p_expires_at: input.expiresAtISO ?? null,
    p_max_access_count: 1,
    p_password: null,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  return { shareId: row.share_id, expiresAt: row.expires_at ?? null, permissions: row.permissions }
}