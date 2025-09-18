/** @jest-environment node */
import { POST } from '@/app/api/emails/welcome/route'

// Skip in Playwright run (Jest-only test)
// @ts-ignore
test.skip('welcome email route (Jest only)', () => {});

import { emailService } from '@schwalbe/shared/lib/resend'

describe('POST /api/emails/welcome', () => {
  it('returns 400 when email is missing', async () => {
    const req = new Request('http://localhost/api/emails/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('sends welcome email and returns 200 on success', async () => {
    const req = new Request('http://localhost/api/emails/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', name: 'User', loginUrl: '/login' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)

    const sendWelcomeEmail = (emailService as any).sendWelcomeEmail as jest.Mock
    expect(sendWelcomeEmail).toHaveBeenCalledTimes(1)
    expect(sendWelcomeEmail).toHaveBeenCalledWith('user@example.com', {
      name: 'User',
      loginUrl: '/login',
    })
  })

  it('returns 500 when email service fails', async () => {
    const sendWelcomeEmail = (emailService as any).sendWelcomeEmail as jest.Mock
    sendWelcomeEmail.mockRejectedValueOnce(new Error('fail to send'))

    const req = new Request('http://localhost/api/emails/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(String(data.error || '')).toContain('fail')
  })
})
