import { supabase } from '@/lib/supabase';
import { logger } from '@schwalbe/shared/lib/logger';
import { reminderService } from '@schwalbe/shared';
function arrayBufferToBase64(buffer) {
    // Convert ArrayBuffer to base64 without leaking memory
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
    }
    // btoa is available in browser
    return btoa(binary);
}
async function getUserId() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user)
        throw new Error('Not authenticated');
    return data.user.id;
}
export async function listDocuments() {
    const { data, error } = await supabase
        .from('documents')
        .select('id, user_id, file_name, file_path, file_type, file_size, document_type, created_at, updated_at, title, description, category, tags, is_important, ocr_text, ocr_confidence, extracted_entities, classification_confidence, extracted_metadata, processing_status, expires_at, expiration_date, ai_extracted_text, ai_confidence, ai_suggested_tags, ai_key_data, ai_processing_id, ai_reasoning')
        .order('created_at', { ascending: false });
    if (error)
        throw error;
    return data;
}
export async function getDocument(id) {
    const { data, error } = await supabase
        .from('documents')
        .select('id, user_id, file_name, file_path, file_type, file_size, document_type, created_at, updated_at, title, description, category, tags, is_important, ocr_text, ocr_confidence, extracted_entities, classification_confidence, extracted_metadata, processing_status, expires_at, expiration_date, ai_extracted_text, ai_confidence, ai_suggested_tags, ai_key_data, ai_processing_id, ai_reasoning')
        .eq('id', id)
        .maybeSingle();
    if (error)
        throw error;
    return data;
}
export async function updateDocument(id, patch) {
    const { data, error } = await supabase
        .from('documents')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
    if (error)
        throw error;
    return data;
}
export async function uploadDocumentAndAnalyze(file) {
    const userId = await getUserId();
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
        .single();
    if (insertErr || !inserted)
        throw insertErr || new Error('Failed to create document row');
    const docId = inserted.id;
    // 2) Upload file to user_documents bucket under userId/docId/
    const path = `${userId}/${docId}/${encodeURIComponent(file.name)}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('user_documents')
        .upload(path, file, { upsert: false });
    if (uploadErr)
        throw uploadErr;
    // 3) Update file_path
    const { error: updateErr } = await supabase
        .from('documents')
        .update({ file_path: uploadData.path })
        .eq('id', docId)
        .select('*')
        .single();
    if (updateErr)
        throw updateErr;
    // 4) Read file and call OCR/analysis edge function
    let analysis;
    try {
        const buf = await file.arrayBuffer();
        const base64 = arrayBufferToBase64(buf);
        const { data: fnRes, error: fnErr } = await supabase.functions.invoke('intelligent-document-analyzer', {
            body: { fileData: base64, fileName: file.name, fileType: file.type, userId },
        });
        if (fnErr)
            throw fnErr;
        if (fnRes && fnRes.result) {
            analysis = fnRes.result;
        }
    }
    catch (e) {
        // Non-fatal; continue and mark as manual if nothing
        logger.error('Analysis invocation failed', e);
    }
    // 5) Persist analysis to document row
    const patch = {};
    if (analysis) {
        patch.ocr_text = analysis.extractedText || null;
        patch.ocr_confidence = Number.isFinite(analysis.confidence) ? analysis.confidence : null;
        patch.ai_extracted_text = analysis.extractedText || null;
        patch.classification_confidence = analysis.suggestedCategory?.confidence ?? null;
        patch.category = analysis.suggestedCategory?.category ?? null;
        patch.title = analysis.suggestedTitle?.title ?? null;
        patch.ai_confidence = analysis.suggestedTitle?.confidence ?? null;
        patch.ai_suggested_tags = analysis.suggestedTags ?? null;
        patch.ai_key_data = analysis.keyData ?? null;
        patch.ai_processing_id = analysis.processingId ?? null;
        patch.ai_reasoning = {
            category_reasoning: analysis.suggestedCategory?.reasoning,
            title_reasoning: analysis.suggestedTitle?.reasoning,
            expiration_reasoning: analysis.expirationDate?.reasoning,
        };
        if (analysis.expirationDate?.date) {
            // Store expiration_date (DATE) and expires_at (TIMESTAMPTZ at 09:00 UTC that day)
            const d = new Date(`${analysis.expirationDate.date}T09:00:00.000Z`);
            patch.expiration_date = analysis.expirationDate.date;
            patch.expires_at = d.toISOString();
        }
        patch.processing_status = 'completed';
    }
    else {
        patch.processing_status = 'manual';
    }
    const { data: analyzedDoc, error: analyzedErr } = await supabase
        .from('documents')
        .update(patch)
        .eq('id', docId)
        .select('*')
        .single();
    if (analyzedErr)
        throw analyzedErr;
    // 6) Create reminder for expiration if applicable
    try {
        const exp = analyzedDoc.expiration_date;
        if (exp) {
            const expDate = new Date(`${exp}T09:00:00.000Z`);
            // Schedule 30 days before; if in past, schedule 7 days before; if still past, schedule in 1 hour
            let scheduled = new Date(expDate);
            scheduled.setUTCDate(scheduled.getUTCDate() - 30);
            const now = new Date();
            if (scheduled < now) {
                scheduled = new Date(expDate);
                scheduled.setUTCDate(scheduled.getUTCDate() - 7);
            }
            if (scheduled < now) {
                scheduled = new Date(now.getTime() + 60 * 60 * 1000);
            }
            const title = `Document expiring: ${analyzedDoc.title || analyzedDoc.file_name}`;
            const description = `This document is expected to expire on ${exp}. Please review and renew if needed.`;
            const rule = {
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
            };
            await reminderService.create(rule);
        }
    }
    catch (e) {
        // Best-effort; errors are logged but do not fail upload
        logger.error('Failed to create reminder for document', e);
    }
    return { document: analyzedDoc, analysis };
}
