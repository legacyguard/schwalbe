import { test, expect } from '@playwright/test'

test.describe('subscriptions a11y', () => {
  for (const locale of ['en','cs','sk'] as const) {
    test(`subscriptions a11y for ${locale}`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/${locale}/subscriptions`)

      // Try click on real UI trigger if visible; else fallback to global hook
      const uiBtn = page.getByTestId('open-cancel')
      if (await uiBtn.count()) {
        await uiBtn.click()
      } else if (await page.evaluate(() => typeof (window as any).__openCancelDialog === 'function')) {
        await page.evaluate(() => (window as any).__openCancelDialog())
      }

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 20000 })
      await expect(dialog).toHaveAttribute('aria-modal', 'true')

      // Check labelling
      const labelledBy = await dialog.getAttribute('aria-labelledby')
      const descBy = await dialog.getAttribute('aria-describedby')
      expect(labelledBy).toBeTruthy()
      expect(descBy).toBeTruthy()

      // Close via test id to avoid locale variance
      await page.getByTestId('keep-subscription').click()
      await expect(dialog).toBeHidden()
    })
  }
})
