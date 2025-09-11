// Protocol inactivity checker for Dead Man Switch system
// Advanced inactivity detection and response system
// Migrated from Hollywood project with adaptations for Schwalbe

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProtocolCheckResult {
  userId: string
  ruleId: string
  ruleName: string
  ruleType: string
  triggered: boolean
  daysInactive: number
  thresholdDays: number
  actions: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all enabled emergency detection rules
    const { data: rules, error: rulesError } = await supabaseAdmin
      .from('emergency_detection_rules')
      .select('*')
      .eq('is_enabled', true)

    if (rulesError) {
      throw new Error(`Failed to fetch emergency rules: ${rulesError.message}`)
    }

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No enabled emergency rules found',
          checked: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: ProtocolCheckResult[] = []
    const actionsToExecute: any[] = []

    // Check each rule
    for (const rule of rules) {
      try {
        // Get user's shield settings
        const { data: shieldSettings, error: shieldError } = await supabaseAdmin
          .from('family_shield_settings')
          .select('*')
          .eq('user_id', rule.user_id)
          .single()

        if (shieldError || !shieldSettings) {
          console.error(`Failed to fetch shield settings for user ${rule.user_id}:`, shieldError)
          continue
        }

        // Get user's last activity
        const lastActivity = new Date(shieldSettings.last_activity_check)
        const daysInactive = Math.floor(
          (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        )

        let triggered = false
        let thresholdDays = 0

        // Check rule conditions based on rule type
        switch (rule.rule_type) {
          case 'inactivity':
            // Check inactivity threshold
            const inactivityCondition = rule.trigger_conditions.find(c => c.type === 'time_based')
            if (inactivityCondition) {
              thresholdDays = inactivityCondition.threshold_value
              triggered = daysInactive >= thresholdDays
            }
            break

          case 'health_check':
            // Check health check failures
            const { data: recentHealthChecks } = await supabaseAdmin
              .from('user_health_checks')
              .select('status')
              .eq('user_id', rule.user_id)
              .gte('scheduled_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
              .order('scheduled_at', { ascending: false })
              .limit(10)

            const missedChecks = recentHealthChecks?.filter(check => check.status === 'missed').length || 0
            const healthCondition = rule.trigger_conditions.find(c => c.type === 'activity_based')
            if (healthCondition) {
              triggered = missedChecks >= healthCondition.threshold_value
            }
            break

          case 'guardian_manual':
            // Check for guardian manual triggers
            const { data: guardianTriggers } = await supabaseAdmin
              .from('guardian_notifications')
              .select('*')
              .eq('user_id', rule.user_id)
              .eq('notification_type', 'activation_request')
              .eq('delivery_status', 'delivered')
              .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

            triggered = (guardianTriggers?.length || 0) > 0
            break

          case 'suspicious_activity':
            // Check for suspicious activity patterns
            const { data: recentAudit } = await supabaseAdmin
              .from('emergency_access_audit')
              .select('*')
              .eq('user_id', rule.user_id)
              .eq('success', false)
              .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

            triggered = (recentAudit?.length || 0) > 5 // More than 5 failed attempts
            break
        }

        const result: ProtocolCheckResult = {
          userId: rule.user_id,
          ruleId: rule.id,
          ruleName: rule.rule_name,
          ruleType: rule.rule_type,
          triggered,
          daysInactive,
          thresholdDays,
          actions: rule.response_actions.map((action: any) => action.type)
        }

        if (triggered) {
          // Execute response actions
          for (const action of rule.response_actions) {
            actionsToExecute.push({
              ruleId: rule.id,
              userId: rule.user_id,
              actionType: action.type,
              priority: action.priority,
              delayMinutes: action.delay_minutes,
              ruleName: rule.rule_name
            })
          }

          // Update rule trigger count
          await supabaseAdmin
            .from('emergency_detection_rules')
            .update({
              trigger_count: rule.trigger_count + 1,
              last_triggered_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', rule.id)
        }

        results.push(result)
      } catch (ruleError) {
        console.error(`Error processing rule ${rule.id}:`, ruleError)
      }
    }

    // Execute actions
    for (const action of actionsToExecute) {
      await executeAction(supabaseAdmin, action)
    }

    return new Response(
      JSON.stringify({
        success: true,
        rulesChecked: results.length,
        rulesTriggered: results.filter(r => r.triggered).length,
        actionsExecuted: actionsToExecute.length,
        results: results.filter(r => r.triggered) // Only return triggered rules
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in protocol-inactivity-checker function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    )
  }
})

// Execute response actions
async function executeAction(supabaseAdmin: any, action: any) {
  try {
    switch (action.actionType) {
      case 'notify_guardians':
        await notifyGuardians(supabaseAdmin, action)
        break
      case 'activate_shield':
        await activateShield(supabaseAdmin, action)
        break
      case 'create_audit_log':
        await createAuditLog(supabaseAdmin, action)
        break
      default:
        console.log(`Unknown action type: ${action.actionType}`)
    }
  } catch (error) {
    console.error(`Error executing action ${action.actionType}:`, error)
  }
}

// Notify guardians about emergency
async function notifyGuardians(supabaseAdmin: any, action: any) {
  const { data: guardians } = await supabaseAdmin
    .from('guardians')
    .select('id, email, name')
    .eq('user_id', action.userId)
    .eq('is_active', true)

  if (guardians && guardians.length > 0) {
    for (const guardian of guardians) {
      await supabaseAdmin
        .from('guardian_notifications')
        .insert({
          guardian_id: guardian.id,
          user_id: action.userId,
          notification_type: 'activation_request',
          title: 'Emergency Protocol Triggered',
          message: `Emergency rule "${action.ruleName}" has been triggered. Immediate action may be required.`,
          action_required: true,
          priority: 'urgent',
          delivery_method: 'email',
        })
    }
  }
}

// Activate family shield
async function activateShield(supabaseAdmin: any, action: any) {
  await supabaseAdmin
    .from('family_shield_settings')
    .update({
      shield_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', action.userId)
}

// Create audit log entry
async function createAuditLog(supabaseAdmin: any, action: any) {
  await supabaseAdmin
    .from('emergency_access_audit')
    .insert({
      user_id: action.userId,
      accessor_type: 'system',
      access_type: 'emergency_trigger',
      resource_type: 'emergency_rule',
      resource_id: action.ruleId,
      action: 'create',
      success: true,
      metadata: {
        rule_name: action.ruleName,
        action_type: action.actionType,
        priority: action.priority
      }
    })
}
