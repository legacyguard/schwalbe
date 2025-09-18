import { test, expect } from '@playwright/test'

test.describe.skip('subscriptions a11y', () => {
  for (const locale of ['en','cs','sk'] as const) {
    test(`subscriptions a11y for ${locale}`, async ({ page, baseURL }) => {
      await page.addInitScript(() => { (window as any).__forceE2E = true })
      await page.goto(`${baseURL}/${locale}/subscriptions`)

      // Wait for SSR-ready marker from layout (sr-only)
      await page.waitForSelector('[data-testid="ssr-ready"]', { timeout: 20000, state: 'attached' })

      // Wait until at least one driver is present
      await page.waitForFunction(() => {
        const w: any = window as any
        return !!document.querySelector('[data-testid="open-cancel-dialog"]') ||
               !!document.querySelector('[data-testid="open-cancel"]') ||
               typeof w.__openCancelDialog === 'function'
      }, undefined, { timeout: 20000 })

      // Try test driver first
      const testBtn = page.getByTestId('open-cancel-dialog')
      if (await testBtn.count()) {
        await testBtn.click()
      } else if (await page.evaluate(() => typeof (window as any).__openCancelDialog === 'function')) {
        await page.evaluate(() => (window as any).__openCancelDialog())
      } else {
        // Final fallback: try primary UI trigger
        const uiBtn = page.getByTestId('open-cancel')
        await expect(uiBtn).toBeVisible({ timeout: 20000 })
        await uiBtn.click()
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
