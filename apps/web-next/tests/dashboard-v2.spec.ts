import { test, expect } from '@playwright/test'

// Dashboard v2 smoke: loads under flag and shows headings

test('dashboard-v2 loads and shows content', async ({ page }) => {
  await page.goto('/en/dashboard-v2', { waitUntil: 'networkidle' });

  await expect(page).toHaveURL(/\/(en\/)?dashboard-v2/);
  await expect(page.locator('text=Next best action')).toBeVisible({ timeout: 20000 });

  // If assistant feature is enabled, CTA link should be present and point to /assistant for default locale
  const cta = page.getByTestId('dashboard-v2-cta-assistant');
  const exists = await cta.count();
  if (exists > 0) {
    await expect(cta).toHaveAttribute('href', /\/en\/assistant(\?.*)?$/);
  }
});
