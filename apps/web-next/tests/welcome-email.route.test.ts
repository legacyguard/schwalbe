/** @jest-environment node */
import { POST } from '@/app/api/emails/welcome/route'

// Mock the email service used by the route handler
jest.mock('@schwalbe/shared/lib/resend', () => {
  const sendWelcomeEmail = jest.fn().mockResolvedValue({ id: 'mocked-email-id' })
  return {
    emailService: {
      sendWelcomeEmail,
    },
  }
})

// Only run the suite in Jest environments; avoid Playwright execution
const isJest = typeof (globalThis as any).jest !== 'undefined'
const runInJest = (cb: () => void) => {
  if (isJest) cb()
}

import { emailService } from '@schwalbe/shared/lib/resend'

runInJest(() => {
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
})
