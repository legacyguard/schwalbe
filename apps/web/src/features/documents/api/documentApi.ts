import { supabase } from '@/lib/supabase'
import { reminderService, type ReminderRule } from '@schwalbe/shared'

export type DocumentRow = {
  id: string
  user_id: string
  file_name: string
  file_path: string | null
  file_type: string | null
  file_size: number | null
  document_type: string | null
  created_at: string
  updated_at: string
  title: string | null
  description: string | null
  category: string | null
  tags: string[] | null
  is_important: boolean | null
  ocr_text: string | null
  ocr_confidence: number | null
  extracted_entities: any | null
  classification_confidence: number | null
  extracted_metadata: any | null
  processing_status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual'
  expires_at: string | null
  expiration_date: string | null
  ai_extracted_text: string | null
  ai_confidence: number | null
  ai_suggested_tags: string[] | null
  ai_key_data: any | null
  ai_processing_id: string | null
  ai_reasoning: any | null
}

export type AnalysisResult = {
  extractedText: string
  confidence: number
  suggestedCategory: { category: string; confidence: number; icon: string; reasoning: string }
  suggestedTitle: { title: string; confidence: number; reasoning: string }
  expirationDate: { date: string | null; confidence: number; originalText?: string | null; reasoning: string }
  keyData: Array<{ label: string; value: string; confidence: number; type: string }>
  suggestedTags: string[]
  processingId: string
  processingTime: number
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  // Convert ArrayBuffer to base64 without leaking memory
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)) as unknown as number[])
  }
  // btoa is available in browser
  return btoa(binary)
}

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Not authenticated')
  return data.user.id
}

export async function listDocuments(): Promise<DocumentRow[]> {
  const { data, error } = await supabase
    .from('documents')
    .select(
      'id, user_id, file_name, file_path, file_type, file_size, document_type, created_at, updated_at, title, description, category, tags, is_important, ocr_text, ocr_confidence, extracted_entities, classification_confidence, extracted_metadata, processing_status, expires_at, expiration_date, ai_extracted_text, ai_confidence, ai_suggested_tags, ai_key_data, ai_processing_id, ai_reasoning'
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as any) as DocumentRow[]
}

export async function getDocument(id: string): Promise<DocumentRow | null> {
  const { data, error } = await supabase
    .from('documents')
    .select(
      'id, user_id, file_name, file_path, file_type, file_size, document_type, created_at, updated_at, title, description, category, tags, is_important, ocr_text, ocr_confidence, extracted_entities, classification_confidence, extracted_metadata, processing_status, expires_at, expiration_date, ai_extracted_text, ai_confidence, ai_suggested_tags, ai_key_data, ai_processing_id, ai_reasoning'
    )
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as any) as DocumentRow | null
}

export async function uploadDocumentAndAnalyze(file: File): Promise<{ document: DocumentRow; analysis?: AnalysisResult }>{
  const userId = await getUserId()

  // 1) Insert placeholder document (processing)
  const { data: inserted, error: insertErr } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      processing_status: 'processing',
      document_type: 'General',
    })
    .select('*')
    .single()

  if (insertErr || !inserted) throw insertErr || new Error('Failed to create document row')

  const docId = (inserted as any).id as string

  // 2) Upload file to user_documents bucket under userId/docId/
  const path = `${userId}/${docId}/${encodeURIComponent(file.name)}`
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('user_documents')
    .upload(path, file, { upsert: false })
  if (uploadErr) throw uploadErr

  // 3) Update file_path
  const { data: updatedDoc, error: updateErr } = await supabase
    .from('documents')
    .update({ file_path: uploadData.path })
    .eq('id', docId)
    .select('*')
    .single()
  if (updateErr) throw updateErr

  // 4) Read file and call OCR/analysis edge function
  let analysis: AnalysisResult | undefined
  try {
    const buf = await file.arrayBuffer()
    const base64 = arrayBufferToBase64(buf)
    const { data: fnRes, error: fnErr } = await supabase.functions.invoke('intelligent-document-analyzer', {
      body: { fileData: base64, fileName: file.name, fileType: file.type, userId },
    })
    if (fnErr) throw fnErr
    if (fnRes && (fnRes as any).result) {
      analysis = (fnRes as any).result as AnalysisResult
    }
  } catch (e) {
    // Non-fatal; continue and mark as manual if nothing
    // eslint-disable-next-line no-console
    console.error('Analysis invocation failed', e)
  }

  // 5) Persist analysis to document row
  const patch: Partial<DocumentRow> = {}
  if (analysis) {
    patch.ocr_text = analysis.extractedText || null
    patch.ocr_confidence = Number.isFinite(analysis.confidence) ? (analysis.confidence as number) : null
    patch.ai_extracted_text = analysis.extractedText || null
    patch.classification_confidence = analysis.suggestedCategory?.confidence ?? null
    patch.category = analysis.suggestedCategory?.category ?? null
    patch.title = analysis.suggestedTitle?.title ?? null
    patch.ai_confidence = analysis.suggestedTitle?.confidence ?? null
    patch.ai_suggested_tags = analysis.suggestedTags ?? null
    patch.ai_key_data = analysis.keyData ?? null
    patch.ai_processing_id = analysis.processingId ?? null
    patch.ai_reasoning = {
      category_reasoning: analysis.suggestedCategory?.reasoning,
      title_reasoning: analysis.suggestedTitle?.reasoning,
      expiration_reasoning: analysis.expirationDate?.reasoning,
    }
    if (analysis.expirationDate?.date) {
      // Store expiration_date (DATE) and expires_at (TIMESTAMPTZ at 09:00 UTC that day)
      const d = new Date(`${analysis.expirationDate.date}T09:00:00.000Z`)
      patch.expiration_date = analysis.expirationDate.date
      patch.expires_at = d.toISOString()
    }
    patch.processing_status = 'completed'
  } else {
    patch.processing_status = 'manual'
  }

  const { data: analyzedDoc, error: analyzedErr } = await supabase
    .from('documents')
    .update(patch as any)
    .eq('id', docId)
    .select('*')
    .single()
  if (analyzedErr) throw analyzedErr

  // 6) Create reminder for expiration if applicable
  try {
    const exp = (analyzedDoc as any).expiration_date as string | null
    if (exp) {
      const expDate = new Date(`${exp}T09:00:00.000Z`)
      // Schedule 30 days before; if in past, schedule 7 days before; if still past, schedule in 1 hour
      let scheduled = new Date(expDate)
      scheduled.setUTCDate(scheduled.getUTCDate() - 30)
      const now = new Date()
      if (scheduled < now) {
        scheduled = new Date(expDate)
        scheduled.setUTCDate(scheduled.getUTCDate() - 7)
      }
      if (scheduled < now) {
        scheduled = new Date(now.getTime() + 60 * 60 * 1000)
      }

      const title = `Document expiring: ${(analyzedDoc as any).title || (analyzedDoc as any).file_name}`
      const description = `This document is expected to expire on ${exp}. Please review and renew if needed.`
      const rule: Omit<ReminderRule, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        title,
        description,
        scheduled_at: scheduled.toISOString(),
        recurrence_rule: null,
        recurrence_end_at: null,
        channels: ['email', 'in_app'],
        priority: 'high',
        status: 'active',
        next_execution_at: scheduled.toISOString(),
        last_executed_at: null,
        execution_count: 0,
        max_executions: 1,
      }
      await reminderService.create(rule as any)
    }
  } catch (e) {
    // Best-effort; errors are logged but do not fail upload
    // eslint-disable-next-line no-console
    console.error('Failed to create reminder for document', e)
  }

  return { document: analyzedDoc as any as DocumentRow, analysis }
}