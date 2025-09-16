import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function getCorsHeaders(origin: string) {
  const raw = Deno.env.get('ALLOWED_ORIGINS') || '';
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  const isAllowedOrigin = origin && list.includes(origin);
  const fallback = list[0] || 'http://localhost:8082';
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : fallback,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}

interface IngestRequest {
  docId: string
  text: string
  locale?: string
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

serve(async (req) => {
  const origin = req.headers.get('origin') || 'http://localhost:8082';
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  try {
    const body: IngestRequest = await req.json()
    if (!body.docId || !body.text) {
      return new Response(JSON.stringify({ error: 'Missing docId or text' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const salt = Deno.env.get('SEARCH_INDEX_SALT')
    if (!supabaseUrl || !serviceRoleKey || !salt) {
      return new Response(JSON.stringify({ error: 'Missing server configuration' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Build token stats
    const tokens = tokenize(body.text, body.locale || 'en')
    const positionsMap = new Map<string, number[]>()
    tokens.forEach((tok, idx) => {
      const arr = positionsMap.get(tok) || []
      arr.push(idx)
      positionsMap.set(tok, arr)
    })

    // Hash tokens
    const rows: { doc_id: string; hash: string; tf: number; positions: number[] }[] = []
    for (const [tok, positions] of positionsMap.entries()) {
      const hash = await hmacSha256Hex(salt, tok)
      rows.push({ doc_id: body.docId, hash, tf: positions.length, positions })
    }

    // Replace existing rows
    const delRes = await supabase.from('hashed_tokens').delete().eq('doc_id', body.docId)
    if (delRes.error) {
      console.error('Delete error')
      return new Response(JSON.stringify({ error: 'Delete failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let inserted = 0
    const chunkSize = 1000
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize)
      if (chunk.length === 0) continue
      const insRes = await supabase.from('hashed_tokens').insert(chunk)
      if (insRes.error) {
        console.error('Insert error')
        return new Response(JSON.stringify({ error: 'Insert failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      inserted += chunk.length
    }

    return new Response(JSON.stringify({ success: true, inserted }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (_e) {
    console.error('Ingest error')
    return new Response(JSON.stringify({ error: 'Ingest failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})