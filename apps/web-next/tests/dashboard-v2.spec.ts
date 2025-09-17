import { test, expect } from '@playwright/test'

// Dashboard v2 smoke: loads under flag and shows headings

test('dashboard-v2 loads and shows content', async ({ page }) => {
  await page.goto('/en/dashboard-v2');

  if ((await page.title()).includes('404') || page.url().includes('/404')) {
    test.skip(true, 'Dashboard v2 flag disabled; skipping test');
  }

  await expect(page.getByRole('heading', { name: /dashboard v2/i })).toBeVisible();
  await expect(page.locator('text=Next best action')).toBeVisible();
});
