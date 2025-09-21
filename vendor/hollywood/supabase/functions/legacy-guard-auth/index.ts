
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function getCorsHeaders(origin: string) {
  const raw = Deno.env.get('ALLOWED_ORIGINS') || '';
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  const isAllowedOrigin = origin && list.includes(origin);
  const fallback = list[0] || 'http://localhost:8081';
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : fallback,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}

serve(async (req) => {
// Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin') || '';
    return new Response('ok', { headers: getCorsHeaders(origin) })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseUrl = (typeof process !== 'undefined' && process?.env?.SUPABASE_URL) || '';
    const supabaseAnonKey = (typeof process !== 'undefined' && process?.env?.SUPABASE_ANON_KEY) || '';
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    )

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      const origin = req.headers.get('origin') || '';
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the request body
    const body = await req.json()
    
    if (!body || typeof body !== 'object') {
      const origin = req.headers.get('origin') || '';
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400, 
          headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action, data } = body
    
    if (!action) {
      const origin = req.headers.get('origin') || '';
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { 
          status: 400, 
          headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    switch (action) {
      case 'get_user_profile': {
        // Get user profile from profiles table
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          const origin = req.headers.get('origin') || '';
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { 
              status: 404, 
              headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
            }
          )
        }

        const origin = req.headers.get('origin') || '';
        return new Response(
          JSON.stringify({ profile }),
          { 
            status: 200, 
            headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'update_user_profile': {
        // Validate update data
        if (!data || typeof data !== 'object') {
        const origin = req.headers.get('origin') || '';
        return new Response(
            JSON.stringify({ error: 'Invalid update data' }),
            { 
              status: 400, 
              headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // Prevent updating sensitive fields
        const { id, created_at, updated_at, ...safeUpdateData } = data
        
        // Update user profile
        const { data: updateData, error: updateError } = await supabaseClient
          .from('profiles')
          .update(safeUpdateData)
          .eq('id', user.id)
          .select()
          .single()

        if (updateError) {
        const origin = req.headers.get('origin') || '';
        return new Response(
            JSON.stringify({ error: 'Failed to update profile' }),
            { 
              status: 500, 
              headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
            }
          )
        }

        const origin = req.headers.get('origin') || '';
        return new Response(
          JSON.stringify({ profile: updateData }),
          { 
            status: 200, 
            headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
          }
        )
      }

      default:
        const origin = req.headers.get('origin') || '';
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
  const origin = req.headers.get('origin') || '';
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    )
  }
})
