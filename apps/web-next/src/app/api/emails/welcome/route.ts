import { NextResponse } from 'next/server'
import { emailService } from '@schwalbe/shared/lib/resend'

export async function POST(request: Request) {
  try {
    const { email, name, loginUrl } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const safeName = typeof name === 'string' && name.length > 0 ? name : email.split('@')[0]
    const url = typeof loginUrl === 'string' && loginUrl.length > 0 ? loginUrl : '/login'

    await emailService.sendWelcomeEmail(email, {
      name: safeName,
      loginUrl: url,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to send email' }, { status: 500 })
  }
}
