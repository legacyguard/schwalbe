import { test, expect } from '@playwright/test'

test.describe.skip('subscriptions a11y', () => {
  for (const locale of ['en','cs','sk'] as const) {
    test(`subscriptions a11y for ${locale}`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/${locale}/subscriptions?e2e=1`)

      // Open dialog primárne cez test driver tlačidlo, ktoré je povolené query parametrom
      const testBtn = page.getByTestId('open-cancel-dialog')
      await expect(testBtn).toBeVisible({ timeout: 20000 })
      await testBtn.click()

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
