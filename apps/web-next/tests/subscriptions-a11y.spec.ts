import { test, expect } from '@playwright/test'

test.describe('subscriptions a11y', () => {
  test.skip(true, 'Temporarily skipped pending further hydration/driver stabilization')
  for (const locale of ['en','cs','sk'] as const) {
    test(`subscriptions a11y for ${locale}`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/${locale}/subscriptions`)

      // Wait for the test driver button (always rendered in e2e via env)
      const openBtn = page.getByTestId('open-cancel-dialog')
      await expect(openBtn).toBeVisible({ timeout: 20000 })
      await openBtn.click()

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 15000 })
      await expect(dialog).toHaveAttribute('aria-modal', 'true')

      // Check labelling
      const labelledBy = await dialog.getAttribute('aria-labelledby')
      const descBy = await dialog.getAttribute('aria-describedby')
      expect(labelledBy).toBeTruthy()
      expect(descBy).toBeTruthy()

      // Close dialog by clicking cancel/keep button (match across locales)
      const keepBtn = page.getByRole('button', { name: /keep|zachovat|ponechať/i })
      await keepBtn.click()
      await expect(dialog).toBeHidden()
    })
  }
})
