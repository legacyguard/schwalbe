
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InactivityCheckResult {
  userId: string
  lastSignIn: string
  daysSinceLastSignIn: number
  inactivityPeriodMonths: number
  shouldNotify: boolean
  guardianEmails?: string[]
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

    // Fetch all active Family Shield settings
    const { data: shieldSettings, error: settingsError } = await supabaseAdmin
      .from('family_shield_settings')
      .select('*')
      .eq('is_shield_enabled', true)

    if (settingsError) {
      throw new Error(`Failed to fetch shield settings: ${settingsError.message}`)
    }

    if (!shieldSettings || shieldSettings.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No active Family Shield settings found',
          checked: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: InactivityCheckResult[] = []
    const notificationsToSend: any[] = []

    // Check each user with active Family Shield
    for (const settings of shieldSettings) {
      try {
        // Get user's last sign-in from Clerk via stored metadata
        // Note: In production, you'd fetch this from Clerk API
        const { data: userData, error: userError } = await supabaseAdmin
          .from('user_profiles')
          .select('last_sign_in_at, email, full_name')
          .eq('user_id', settings.user_id)
          .single()

        if (userError || !userData) {
          console.error(`Failed to fetch user data for ${settings.user_id}:`, userError)
          continue
        }

        const lastSignIn = new Date(userData.last_sign_in_at || Date.now())
        const daysSinceLastSignIn = Math.floor(
          (Date.now() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24)
        )
        const inactivityThresholdDays = settings.inactivity_period_months * 30

        const result: InactivityCheckResult = {
          userId: settings.user_id,
          lastSignIn: lastSignIn.toISOString(),
          daysSinceLastSignIn,
          inactivityPeriodMonths: settings.inactivity_period_months,
          shouldNotify: daysSinceLastSignIn >= inactivityThresholdDays
        }

        if (result.shouldNotify) {
          // Check if we've already sent initial notification
          const { data: existingNotification } = await supabaseAdmin
            .from('inactivity_notifications')
            .select('*')
            .eq('user_id', settings.user_id)
            .eq('status', 'pending')
            .single()

          if (!existingNotification) {
            // Create new inactivity notification record
            const { data: newNotification, error: notifError } = await supabaseAdmin
              .from('inactivity_notifications')
              .insert({
                user_id: settings.user_id,
                triggered_at: new Date().toISOString(),
                days_inactive: daysSinceLastSignIn,
                status: 'pending',
                user_notified_at: new Date().toISOString()
              })
              .select()
              .single()

            if (!notifError && newNotification) {
              // Send email to user first
              notificationsToSend.push({
                type: 'user_warning',
                to: userData.email,
                name: userData.full_name,
                daysInactive: daysSinceLastSignIn,
                notificationId: newNotification.id
              })
            }
          } else {
            // Check if grace period has expired (7 days after initial notification)
            const notificationDate = new Date(existingNotification.triggered_at)
            const daysSinceNotification = Math.floor(
              (Date.now() - notificationDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysSinceNotification >= 7 && !existingNotification.guardians_notified_at) {
              // Grace period expired, notify guardians
              const { data: guardians } = await supabaseAdmin
                .from('guardians')
                .select('email, name')
                .eq('user_id', settings.user_id)
                .eq('is_active', true)
                .eq('can_trigger_emergency', true)

              if (guardians && guardians.length > 0) {
                result.guardianEmails = guardians.map(g => g.email)
                
                // Update notification record
                await supabaseAdmin
                  .from('inactivity_notifications')
                  .update({
                    guardians_notified_at: new Date().toISOString(),
                    status: 'guardians_notified'
                  })
                  .eq('id', existingNotification.id)

                // Queue guardian notifications
                for (const guardian of guardians) {
                  notificationsToSend.push({
                    type: 'guardian_alert',
                    to: guardian.email,
                    guardianName: guardian.name,
                    userName: userData.full_name,
                    daysInactive: daysSinceLastSignIn,
                    notificationId: existingNotification.id
                  })
                }
              }
            }
          }
        }

        results.push(result)
      } catch (userError) {
        console.error(`Error processing user ${settings.user_id}:`, userError)
      }
    }

    // Send notifications via email service (e.g., SendGrid, Resend, etc.)
    if (notificationsToSend.length > 0) {
      // In production, integrate with your email service
      console.log('Notifications to send:', notificationsToSend)
      
      // Example with Resend (you'd need to add the actual implementation)
      /*
      for (const notification of notificationsToSend) {
        await sendEmail(notification)
      }
      */
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: results.length,
        notificationsTriggered: results.filter(r => r.shouldNotify).length,
        results: results.filter(r => r.shouldNotify) // Only return users who need notification
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
    console.error('Error in check-inactivity function:', error)
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

// Helper function to send emails (to be implemented with your email service)
async function sendEmail(notification: any) {
  // Implement email sending logic here
  // This is a placeholder - integrate with SendGrid, Resend, or another service
  
  if (notification.type === 'user_warning') {
    // Send warning email to user
    console.log(`Sending inactivity warning to user: ${notification.to}`)
  } else if (notification.type === 'guardian_alert') {
    // Send alert email to guardian
    console.log(`Sending guardian alert to: ${notification.to}`)
  }
}
