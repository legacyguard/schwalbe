import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function getCorsHeaders(origin: string) {
  const raw = Deno.env.get('ALLOWED_ORIGINS') || ''
  const list = raw.split(',').map(s => s.trim()).filter(Boolean)
  const isAllowedOrigin = origin && list.includes(origin)
  const fallback = list[0] || '*'
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : fallback,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function tokenize(text: string, locale = 'en'): string[] {
  if (!text) return []
  const norm = text.toLocaleLowerCase(locale)
  const tokens: string[] = []
  const Seg: any = (globalThis as any).Intl?.Segmenter
  if (Seg) {
    const segmenter = new Seg(locale, { granularity: 'word' })
    for (const seg of segmenter.segment(norm)) {
      const s = String(seg.segment || '')
      const isWordLike = typeof seg.isWordLike === 'boolean' ? seg.isWordLike : /[\p{L}\p{N}]/u.test(s)
      if (isWordLike) {
        const clean = s.match(/[\p{L}\p{N}]+/gu)?.join('') || ''
        if (clean.length >= 2) tokens.push(clean)
      }
    }
    return tokens
  }
  const matches = norm.match(/[\p{L}\p{N}]+/gu) || []
  for (const m of matches) { if (m.length >= 2) tokens.push(m) }
  return tokens
}

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))
  const bytes = new Uint8Array(sig)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  const origin = req.headers.get('origin') || '*'
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  try {
    const body = await req.json() as { q?: string; locale?: string; limit?: number }
    const q = (body.q || '').toString()
    const locale = (body.locale || 'en').toString()
    const limit = Math.max(1, Math.min(Number(body.limit || 10), 50))

    if (!q || q.trim().length < 2) {
      return new Response(JSON.stringify({ results: [] }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const salt = Deno.env.get('SEARCH_INDEX_SALT')
    if (!supabaseUrl || !supabaseAnonKey || !salt) {
      return new Response(JSON.stringify({ error: 'Missing server configuration' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Create client that uses the caller's Authorization header so RLS applies per-user
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    })

    // Tokenize and hash with server-side salt
    const tokens = Array.from(new Set(tokenize(q, locale)))
    if (tokens.length === 0) {
      return new Response(JSON.stringify({ results: [] }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const hashes: string[] = []
    for (const t of tokens) {
      hashes.push(await hmacSha256Hex(salt, t))
    }

    // Query hashed index; RLS ensures only caller's docs are visible
    const { data: rows, error: idxErr } = await supabase
      .from('hashed_tokens')
      .select('doc_id, tf')
      .in('hash', hashes)
      .limit(10000)
    if (idxErr) {
      // Do not include query in logs
      console.error('Hashed search query failed')
      return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Aggregate rank
    const scores = new Map<string, number>()
    for (const r of rows || []) {
      const id = String((r as any).doc_id)
      const tf = Number((r as any).tf || 0)
      scores.set(id, (scores.get(id) || 0) + tf)
    }

    const ranked = Array.from(scores.entries())
      .map(([id, rank]) => ({ id, rank }))
      .sort((a, b) => b.rank - a.rank)
      .slice(0, limit)

    if (ranked.length === 0) {
      return new Response(JSON.stringify({ results: [] }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const ids = ranked.map(r => r.id)
    const { data: docs, error: docErr } = await supabase
      .from('documents')
      .select('id, title, file_name, category, created_at')
      .in('id', ids)
    if (docErr) {
      console.error('Document fetch failed')
      return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const byId = new Map<string, any>()
    for (const d of docs || []) byId.set(String((d as any).id), d)

    const results = ranked
      .map(r => {
        const d = byId.get(r.id) || {}
        return {
          id: r.id,
          title: d.title ?? null,
          file_name: d.file_name ?? null,
          category: d.category ?? null,
          created_at: d.created_at ?? new Date().toISOString(),
          rank: r.rank,
        }
      })
      .filter(r => !!r.id)

    return new Response(JSON.stringify({ results }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (_e) {
    console.error('Hashed search fatal error')
    return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})