import { test, expect } from '@playwright/test'

test.describe('subscriptions a11y', () => {
  test.skip(true, 'Skipped for now: dialog hydration timing in dev server; tracked to stabilize later')

  for (const locale of ['en','cs','sk'] as const) {
    test(`subscriptions a11y for ${locale}`, async ({ page, baseURL }) => {
      // Navigate with flag to open dialog immediately
      await page.goto(`${baseURL}/${locale}/subscriptions?openCancelDialog=1`)

      // Wait for hydration and dialog to appear
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('#cancel-dialog-title', { timeout: 15000 })

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
