import { test, expect } from '@playwright/test'
import { createSupabaseClient, signInTestUser, createCheckoutSession, waitForSubscriptionStatus, createShareLink } from './utils/supabase'

/**
 * Money-path smoke tests
 * Notes:
 * - Runs against BASE_URL (env E2E_BASE_URL) or localhost by default.
 * - Requires env: E2E_SUPABASE_URL, E2E_SUPABASE_ANON_KEY, E2E_TEST_EMAIL, E2E_TEST_PASSWORD (for staging).
 * - Never logs secrets. All values are read from env and not printed.
 */

async function completeStripeCheckout(page: import('@playwright/test').Page, opts: { cardNumber: string; exp: string; cvc: string; name?: string; email?: string }) {
  // Wait for Stripe Checkout
  await page.waitForURL(/checkout\.stripe\.com/)

  // Try to fill email/name if present on Checkout page (not always required)
  try { if (opts.email) await page.locator('input[name="email"]').fill(opts.email) } catch {}
  try { if (opts.name) await page.locator('input[name="name"]').fill(opts.name) } catch {}

  // Stripe uses nested iframes for card fields. Attempt to locate inputs across frames.
  const fillInAnyFrame = async (selector: string, value: string) => {
    for (const frame of page.frames()) {
      const el = frame.locator(selector)
      if (await el.count()) {
        try {
          await el.first().fill('')
          await el.first().type(value, { delay: 10 })
          return true
        } catch {}
      }
    }
    return false
  }

  // Common selectors across Stripe checkout variants
  const filledNumber = await fillInAnyFrame('input[name="cardnumber"], input[autocomplete="cc-number"], input[placeholder*="Card number" i], input[data-elements-stable-field-name="cardNumber"]', opts.cardNumber)
  if (!filledNumber) {
    throw new Error('Unable to locate Stripe card number field')
  }
  await fillInAnyFrame('input[name="exp-date"], input[autocomplete="cc-exp"], input[placeholder*="MM / YY" i], input[data-elements-stable-field-name="cardExpiry"]', opts.exp)
  await fillInAnyFrame('input[name="cvc"], input[autocomplete="cc-csc"], input[placeholder*="CVC" i], input[data-elements-stable-field-name="cardCvc"]', opts.cvc)

  // Submit payment
  const payButton = page.locator('button:has-text("Pay"), button:has-text("Subscribe"), button[type="submit"]')
  await payButton.first().click({ trial: true }).catch(async () => { await payButton.first().click() })
}

async function minimalWizardRun(page: import('@playwright/test').Page) {
  await page.goto('/will/wizard/start')
  await page.selectOption('#jurisdiction', 'CZ')
  await page.selectOption('#language', 'en')
  await page.selectOption('#form', 'typed')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByLabel('Full legal name').fill('John Doe')
  await page.getByLabel('Age').fill('30')
  await page.getByLabel('Address').fill('123 Main St, Prague')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByRole('button', { name: 'Add beneficiary' }).click()
  await page.getByLabel('Beneficiary name').fill('Jane Doe')
  await page.getByLabel('Relationship').fill('sibling')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByLabel('Executor name').fill('Bob Smith')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByText('Signatures').waitFor()
  await page.getByLabel('I, the testator, will sign the will').check()
  await page.getByLabel('Witnesses will sign the will').check()
  await page.getByRole('button', { name: 'Add witness' }).click()
  await page.getByLabel('Witness name').first().fill('Witness One')
  await page.getByRole('button', { name: 'Add witness' }).click()
  await page.getByLabel('Witness name').nth(1).fill('Witness Two')
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByText('Draft preview')).toBeVisible()
}

async function exportFromShareViewer(page: import('@playwright/test').Page, shareId: string) {
  await page.addInitScript(() => {
    // Override print to avoid opening dialogs during CI
    // @ts-ignore
    window.__printed = false
    const orig = window.print
    // @ts-ignore
    window.print = () => { window.__printed = true; try { orig?.() } catch {} }
  })
  await page.goto(`/share/${shareId}`)
  await expect(page.getByText(/shared viewer/i)).toBeVisible()
  await page.getByRole('button', { name: /export/i }).click()
  const printed = await page.evaluate(() => (window as any).__printed === true)
  expect(printed).toBeTruthy()
}

// Happy path: sign in → buy → entitlement → wizard → export PDF → create share link
test('money path: happy path purchase and core flows', async ({ page }) => {
  const supabase = createSupabaseClient()
  const { user } = await signInTestUser(supabase)

  // Create Stripe checkout session via Edge Function
  const origin = test.info().project.use?.baseURL as string | undefined
  const { url } = await createCheckoutSession(supabase, {
    plan: 'premium',
    userId: user.id,
    successUrl: (origin || 'http://localhost:3000') + '/?checkout=success',
    cancelUrl: (origin || 'http://localhost:3000') + '/?checkout=cancel',
  })

  expect(url).toBeTruthy()

  // Complete Checkout with Stripe test card
  await page.goto(url!)
  await completeStripeCheckout(page, {
    cardNumber: '4242 4242 4242 4242',
    exp: '04 / 34',
    cvc: '123',
    name: 'E2E Test User',
    email: process.env.E2E_TEST_EMAIL || 'e2e@example.com',
  })

  // Wait for redirect to success
  await page.waitForURL(/\?checkout=success/, { timeout: 60_000 })

  // Wait for webhook to set subscription active
  await waitForSubscriptionStatus(supabase, 'active', { timeoutMs: 90_000 })

  // Run minimal wizard path (client-side only)
  await minimalWizardRun(page)

  // Create a share link via RPC and open viewer to export PDF
  const share = await createShareLink(supabase, { resourceType: 'will', resourceId: `test_${Date.now()}` })
  await exportFromShareViewer(page, share.shareId)
})

// Failure path: declined payment → status past_due → check banner/indicator
// Note: UI banner may not be implemented; we assert Subscriptions status and a generic indicator instead.
test('money path: failed payment surfaces past_due status', async ({ page }) => {
  const supabase = createSupabaseClient()
  const { user } = await signInTestUser(supabase)

  const origin = test.info().project.use?.baseURL as string | undefined
  const { url } = await createCheckoutSession(supabase, {
    plan: 'premium',
    userId: user.id,
    successUrl: (origin || 'http://localhost:3000') + '/?checkout=success',
    cancelUrl: (origin || 'http://localhost:3000') + '/?checkout=cancel',
  })

  await page.goto(url!)
  await completeStripeCheckout(page, {
    cardNumber: '4000 0000 0000 0002', // generic decline
    exp: '04 / 34',
    cvc: '123',
    name: 'E2E Test Decline',
    email: process.env.E2E_TEST_EMAIL || 'e2e@example.com',
  })

  // Expect either in-place error or redirect to cancel
  await Promise.race([
    page.waitForURL(/\?checkout=cancel/, { timeout: 60_000 }),
    page.getByText(/Your card was declined|declined|Cannot complete payment/i).waitFor({ timeout: 60_000 }),
  ])

  // Wait for webhook to record past_due (payment_failed)
  await waitForSubscriptionStatus(supabase, 'past_due', { timeoutMs: 90_000 })
})