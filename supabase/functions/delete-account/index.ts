import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { insertErrorAndMaybeAlert, redactSensitiveData } from '../_shared/observability.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

interface DeleteAccountRequest {
  confirm?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    })
  }

  try {
    // 1. Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get current user with anon key
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: authData, error: authError } = await userClient.auth.getUser()
    
    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userId = authData.user.id

    // 2. Parse request body
    const body: DeleteAccountRequest = await req.json().catch(() => ({}))
    
    if (!body.confirm) {
      return new Response(
        JSON.stringify({ error: 'Must confirm deletion' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 3. Use service role client for deletion
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Log deletion request (no PII)
    console.log('Account deletion requested', { 
      user_id: userId.substring(0, 8) + '...', // only first 8 chars
      timestamp: new Date().toISOString() 
    })

    // 4. Delete user data from all tables
    // Order matters due to foreign key constraints
    const tablesToPurge = [
      // Sharing and audits
      'share_audits',
      'share_links',
      
      // Documents and search
      'hashed_tokens',
      'documents',
      
      // Assets
      'assets',
      
      // Reminders
      'notification_log',
      'reminder_rule',
      
      // Subscriptions
      'user_subscriptions',
      
      // Emergency access
      'emergency_access_logs',
      'emergency_access_tokens',
      'survivor_manual_entries',
      'survivor_manuals',
      'guardians',
      
      // Family
      'family_members',
      'family_settings',
      
      // Professional
      'professional_reviews',
      'professional_applications',
      
      // Monitoring (keep anonymized for audit)
      // 'error_logs', // keep but anonymize
      // 'webhook_logs', // keep but anonymize
      
      // Finally, profile
      'profiles'
    ]

    const deletionResults: Record<string, { success: boolean; error?: string }> = {}

for (const table of tablesToPurge) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .or(`user_id.eq.${userId},created_by.eq.${userId},owner_id.eq.${userId}`)
        
        if (error) {
          const msg = String(error.message || '')
          const relationMissing = /relation .* does not exist/i.test(msg)
          if (relationMissing) {
            deletionResults[table] = { success: true }
          } else {
            deletionResults[table] = { success: false, error: msg }
          }
        } else {
          deletionResults[table] = { success: true }
        }
      } catch (e) {
        const msg = String(e)
        const relationMissing = /relation .* does not exist/i.test(msg)
        deletionResults[table] = { 
          success: relationMissing ? true : false, 
          error: relationMissing ? undefined : redactSensitiveData(msg) || 'Unknown error'
        }
      }
    }

    // 5. Anonymize logs instead of deleting them
    try {
      await supabaseAdmin
        .from('error_logs')
        .update({ 
          user_id: null,
          session_id: null,
          user_agent: null,
          url: null
        })
        .eq('user_id', userId)
    } catch (e) {
      console.error('Failed to anonymize error_logs', redactSensitiveData(String(e)))
    }

    try {
      await supabaseAdmin
        .from('webhook_logs')
        .update({ 
          metadata: {},
          error: null
        })
        .match({ 'metadata->>user_id': userId })
    } catch (e) {
      console.error('Failed to anonymize webhook_logs', redactSensitiveData(String(e)))
    }

    // 6. Delete storage objects
    try {
      // List and delete from user_documents bucket
      const { data: files } = await supabaseAdmin.storage
        .from('user_documents')
        .list(userId)
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${userId}/${f.name}`)
        await supabaseAdmin.storage
          .from('user_documents')
          .remove(filePaths)
      }
    } catch (e) {
      console.error('Failed to delete storage files', redactSensitiveData(String(e)))
    }

    // 7. Delete auth user
    let authDeleted = false
    try {
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (deleteAuthError) {
        console.error('Auth deletion failed', redactSensitiveData(deleteAuthError.message))
      } else {
        authDeleted = true
      }
    } catch (e) {
      console.error('Auth deletion exception', redactSensitiveData(String(e)))
    }

    // 8. Check if all critical deletions succeeded
const criticalTables = ['profiles', 'documents', 'assets']
    const allCriticalDeleted = criticalTables.every((t) => {
      const r = deletionResults[t]
      return !r || r.success === true
    })

    if (!allCriticalDeleted || !authDeleted) {
      // Alert on partial failure
      await insertErrorAndMaybeAlert(supabaseAdmin, {
        error_type: 'gdpr_deletion_partial',
        message: 'Account deletion partially failed',
        context: 'database',
        severity: 'high',
        user_id: null // already deleted/anonymized
      })

      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Account deletion partially failed. Support has been notified.',
          details: deletionResults
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 9. Success
    console.log('Account deletion completed', { 
      user_id: userId.substring(0, 8) + '...',
      timestamp: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account and all associated data have been permanently deleted.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Delete account error:', redactSensitiveData(String(error)))
    
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred during account deletion',
        success: false
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})