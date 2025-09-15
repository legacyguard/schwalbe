import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { tokenize } from './tokenizer'
import { hmacSha256Hex } from './hash'

export type SearchParams = {
  query: string
  locale?: string
  limit?: number
}

export type QueryOptions = {
  supabaseUrl?: string
  serviceRoleKey?: string
  salt?: string
}

export type SearchResult = {
  doc_id: string
  rank: number
}

function getServerSupabase(opts?: QueryOptions): SupabaseClient {
  const url = opts?.supabaseUrl || process.env['SUPABASE_URL'] || process.env['NEXT_PUBLIC_SUPABASE_URL'] || ''
  const key = opts?.serviceRoleKey || process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || ''
  if (!url || !key) {
    throw new Error('Supabase URL or Key missing. Provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env or via options.')
  }
  return createClient(url, key)
}

export async function searchByQuery(params: SearchParams, options?: QueryOptions): Promise<SearchResult[]> {
  const { query, locale, limit = 50 } = params
  const client = getServerSupabase(options)

  const tokens = Array.from(new Set(tokenize(query, { locale: locale || 'en' })))
  if (tokens.length === 0) return []
  const hashes = tokens.map((t) => hmacSha256Hex(t, options?.salt))

  // Fetch rows and aggregate client-side by doc_id
  const { data, error } = await client
    .from('hashed_tokens')
    .select('doc_id,tf')
    .in('hash', hashes)
    .limit(10000)

  if (error) throw error

  const agg = new Map<string, number>()
  for (const row of data || []) {
    const id = String((row as any).doc_id)
    const f = Number((row as any).tf || 0)
    agg.set(id, (agg.get(id) || 0) + f)
  }

  const results: SearchResult[] = Array.from(agg.entries())
    .map(([doc_id, rank]) => ({ doc_id, rank }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)

  return results
}
