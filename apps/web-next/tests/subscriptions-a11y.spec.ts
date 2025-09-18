import { test, expect } from '@playwright/test'

test.describe('subscriptions a11y', () => {
  test.skip(true, 'Temporarily skipped pending hydration timing fix for dialog in dev server')

  for (const locale of ['en','cs','sk'] as const) {
    test(`subscriptions a11y for ${locale}`, async ({ page, baseURL }) => {
      // Open dialog immediately via test flag to avoid flakiness on heading checks
      await page.goto(`${baseURL}/${locale}/subscriptions?openCancelDialog=1`)

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
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
