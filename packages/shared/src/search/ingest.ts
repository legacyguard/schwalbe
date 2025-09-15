import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { tokenize } from './tokenizer'
import { hmacSha256Hex } from './hash'

export type IndexDocumentParams = {
  docId: string
  text: string
  locale?: string
}

export type IngestOptions = {
  supabaseUrl?: string
  serviceRoleKey?: string
  salt?: string
  chunkSize?: number
}

function getServerSupabase(opts?: IngestOptions): SupabaseClient {
  const url = opts?.supabaseUrl || process.env['SUPABASE_URL'] || ''
  const key = opts?.serviceRoleKey || process.env['SUPABASE_SERVICE_ROLE_KEY'] || ''
  if (!url || !key) {
    throw new Error('Supabase URL or Key missing. Provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env or via options (service role required).')
  }
  return createClient(url, key)
}

export type TokenStats = {
  token: string
  freq: number
  positions: number[]
}

export function buildTokenStats(text: string, locale = 'en'): TokenStats[] {
  const tokens = tokenize(text, { locale })
  const map = new Map<string, number[]>()
  tokens.forEach((tok, idx) => {
    const arr = map.get(tok) || []
    arr.push(idx)
    map.set(tok, arr)
  })
  const result: TokenStats[] = []
  for (const [token, positions] of map.entries()) {
    result.push({ token, freq: positions.length, positions })
  }
  return result
}

export async function ingestHashedIndex(args: { supabase: SupabaseClient; docId: string; text: string; locale?: string; salt?: string; chunkSize?: number }): Promise<{ inserted: number }>{
  const { supabase, docId, text, locale, salt, chunkSize } = args

  // Build token stats and hash them
  const stats = buildTokenStats(text, locale || 'en')
  const rows = stats.map((s) => ({
    doc_id: docId,
    hash: hmacSha256Hex(s.token, salt),
    tf: s.freq,
    positions: s.positions,
  }))

  // Replace existing index for the document
  const delRes = await supabase.from('hashed_tokens').delete().eq('doc_id', docId)
  if (delRes.error) throw delRes.error

  if (rows.length === 0) return { inserted: 0 }

  const size = chunkSize ?? 1000
  let inserted = 0
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size)
    const insRes = await supabase.from('hashed_tokens').insert(chunk)
    if (insRes.error) throw insRes.error
    inserted += chunk.length
  }

  return { inserted }
}

export async function indexDocumentText(params: IndexDocumentParams, options?: IngestOptions): Promise<{ inserted: number }>{
  const { docId, text, locale } = params
  const client = getServerSupabase(options)
  return ingestHashedIndex({ supabase: client, docId, text, locale, salt: options?.salt, chunkSize: options?.chunkSize })
}
