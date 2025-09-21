
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:8081',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    // Get the request body
    const body = await req.json()
    
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action, data } = body
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    switch (action) {
      case 'create_legacy_item': {
        if (!data || typeof data !== 'object') {
          return new Response(
            JSON.stringify({ error: 'Item data is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Create a new legacy item
        const { data: newItem, error: createError } = await supabaseClient
          .from('legacy_items')
          .insert(data)
          .select()
          .single()

        if (createError) {
          return new Response(
            JSON.stringify({ error: 'Failed to create legacy item' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ item: newItem }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'get_legacy_items': {
        if (!data?.user_id) {
          return new Response(
            JSON.stringify({ error: 'user_id is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Get legacy items for a user
        const { data: items, error: itemsError } = await supabaseClient
          .from('legacy_items')
          .select('*')
          .eq('user_id', data.user_id)
          .order('created_at', { ascending: false })

        if (itemsError) {
          return new Response(
            JSON.stringify({ error: itemsError.message || 'Failed to fetch legacy items' }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ items }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'update_legacy_item': {
        if (!data?.id) {
          return new Response(
            JSON.stringify({ error: 'Item ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // Extract ID and remove it from update data to prevent overwriting
        const { id, ...updateData } = data
        
        // Update an existing legacy item
        const { data: updatedItem, error: updateError } = await supabaseClient
          .from('legacy_items')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update legacy item' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ item: updatedItem }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'delete_legacy_item': {
        if (!data?.id) {
          return new Response(
            JSON.stringify({ error: 'Item ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // Delete a legacy item
        const { error: deleteError } = await supabaseClient
          .from('legacy_items')
          .delete()
          .eq('id', data.id)

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: 'Failed to delete legacy item' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Item deleted successfully' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'get_user_progress': {
        if (!data?.user_id) {
          return new Response(
            JSON.stringify({ error: 'user_id is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // Get user progress statistics
        const { data: progress, error: progressError } = await supabaseClient
          .from('legacy_items')
          .select('status, created_at')
          .eq('user_id', data.user_id)

        if (progressError) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch progress' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Calculate progress statistics
        const totalItems = progress.length
        const completedItems = progress.filter(item => item.status === 'completed').length
        const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

        return new Response(
          JSON.stringify({ 
            totalItems, 
            completedItems, 
            progressPercentage,
            recentActivity: progress.slice(0, 5)
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      default: {
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

  } catch (error) {
    console.error('Error in legacy-guard-api:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
