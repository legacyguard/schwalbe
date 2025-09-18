import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    // In development, just log. In production, wire to Supabase or external sink.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[analytics] event', body?.eventType, body?.eventData || {})
    }
    return NextResponse.json({ ok: true }, { status: 202 })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

import { NextResponse } from 'next/server.js'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventType = typeof body?.eventType === 'string' ? body.eventType : 'unknown';
    const eventData = typeof body?.eventData === 'object' && body?.eventData !== null ? body.eventData : {};

    // Minimal validation and acceptance; actual persistence is handled in backend pipelines
    if (!eventType || eventType.length > 100) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}