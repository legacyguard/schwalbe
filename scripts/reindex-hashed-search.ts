/*
  Backfill script for hashed search index.
  NOTE: Do not log any plaintext search terms. This script only logs IDs and counts.
  Run in a server environment with these env vars set:
    SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
    SEARCH_INDEX_SALT
*/

import { createClient } from '@supabase/supabase-js'
import { ingestHashedIndex } from '@schwalbe/shared/search'

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const salt = process.env.SEARCH_INDEX_SALT

  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  if (!salt) {
    console.error('Missing SEARCH_INDEX_SALT (server-only). Aborting reindex.')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  // Fetch documents which have OCR/extracted text. Adjust the selection as needed for your schema.
  // Example uses documents.ocr_text from migration 20250824070000_add_ocr_support.sql
  const { data: docs, error } = await supabase
    .from('documents')
    .select('id, ocr_text')
    .not('ocr_text', 'is', null)
    .limit(1000)

  if (error) throw error
  if (!docs || docs.length === 0) {
    console.log('No documents found to reindex.')
    return
  }

  let totalInserted = 0
  for (const d of docs as Array<{ id: string; ocr_text: string }>) {
    const text = d.ocr_text || ''
    if (!text) continue
    const res = await ingestHashedIndex({ supabase, docId: d.id, text, salt })
    totalInserted += res.inserted
  }
  console.log(`Reindex complete. Inserted rows: ${totalInserted}`)
}

main().catch((e) => {
  console.error('Reindex failed', e)
  process.exit(1)
})
