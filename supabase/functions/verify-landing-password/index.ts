import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const LANDING_PASSWORD_HASH = Deno.env.get('LANDING_PASSWORD_HASH')
const LANDING_PASSWORD_SALT = Deno.env.get('LANDING_PASSWORD_SALT')

if (!LANDING_PASSWORD_HASH || !LANDING_PASSWORD_SALT) {
  console.error('Missing LANDING_PASSWORD_HASH or LANDING_PASSWORD_SALT environment variables')
}

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; lastAttempt: number }>()

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for') ||
         request.headers.get('x-real-ip') ||
         'unknown'
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const saltedPassword = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPassword)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 10

  const record = rateLimitStore.get(clientIP)

  if (!record) {
    rateLimitStore.set(clientIP, { count: 1, lastAttempt: now })
    return false
  }

  // Reset if window expired
  if (now - record.lastAttempt > windowMs) {
    rateLimitStore.set(clientIP, { count: 1, lastAttempt: now })
    return false
  }

  // Increment attempts
  record.count++
  record.lastAttempt = now

  return record.count > maxAttempts
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const clientIP = getClientIP(req)

    // Check rate limiting
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({
          error: 'Too many attempts',
          success: false,
          retryAfter: 900 // 15 minutes in seconds
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': '900'
          }
        }
      )
    }

    const { password } = await req.json()

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request', success: false }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Input validation
    if (password.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Password too long', success: false }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!LANDING_PASSWORD_HASH || !LANDING_PASSWORD_SALT) {
      console.error('Landing password verification not configured')
      return new Response(
        JSON.stringify({ error: 'Service unavailable', success: false }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const hashedInput = await hashPassword(password, LANDING_PASSWORD_SALT)
    const isValid = hashedInput === LANDING_PASSWORD_HASH

    // Add small delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))

    return new Response(
      JSON.stringify({
        success: isValid,
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Landing password verification error:', error)

    return new Response(
      JSON.stringify({ error: 'Internal server error', success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})