
// Deprecated: superseded by stripe-checkout function. Keeping minimal stub to avoid breaking callers.
import { serve } from 'std/http/server.ts'
serve((_req) => new Response(JSON.stringify({ error: 'use stripe-checkout function' }), { status: 410 }))
