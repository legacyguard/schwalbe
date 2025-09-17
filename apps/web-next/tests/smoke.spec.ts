import { test, expect } from '@playwright/test'

// Basic smoke test for the localized home page and subscriptions page
for (const locale of ['en','cs','sk'] as const) {
  test(`home renders for ${locale}`, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/${locale}`)
    await expect(page).toHaveTitle(/LegacyGuard/i)
    await expect(page.locator('main')).toBeVisible()
  })

  test(`subscriptions renders for ${locale}`, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/${locale}/subscriptions`)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Subscription|Předplatné|Predplatné/i)
  })
}
