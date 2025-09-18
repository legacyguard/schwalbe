import { test, expect } from '@playwright/test'

test('subscriptions analytics beacons fire (view, open, confirm)', async ({ page }) => {
  const events: any[] = []
  await page.route('**/api/analytics/events', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}')
    events.push(body)
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  })

  // Mock Supabase endpoints to avoid real network
  await page.route('http://localhost:54321/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
  await page.route('**://*.supabase.co/**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }))

  // Force E2E mode
  await page.addInitScript(() => { (window as any).__forceE2E = true })
  await page.goto('/en/subscriptions?e2e=1')
  await page.waitForLoadState('domcontentloaded')

  // Poll for view event
  let hasView = false
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(200)
    hasView = events.some(e => e?.eventType === 'subscriptions_view')
    if (hasView) break
  }
  expect(hasView).toBeTruthy()

  // Open cancel dialog
  const openBtn = page.getByTestId('open-cancel')
  if (await openBtn.count()) {
    await openBtn.click()
  } else if (await page.getByTestId('open-cancel-dialog').count()) {
    await page.getByTestId('open-cancel-dialog').click()
  } else if (await page.evaluate(() => typeof (window as any).__openCancelDialog === 'function')) {
    await page.evaluate(() => (window as any).__openCancelDialog())
  }

  // Assert open beacon
  let hasOpen = false
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(200)
    hasOpen = events.some(e => e?.eventType === 'subscriptions_cancel_open')
    if (hasOpen) break
  }
  expect(hasOpen).toBeTruthy()

  // Confirm cancel (fires beacon and then calls supabase function which is mocked)
  const confirm = page.getByTestId('confirm-cancel')
  if (await confirm.count()) {
    await confirm.click()
  }

  let hasConfirm = false
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(200)
    hasConfirm = events.some(e => e?.eventType === 'subscriptions_cancel_confirm')
    if (hasConfirm) break
  }
  expect(hasConfirm).toBeTruthy()
})