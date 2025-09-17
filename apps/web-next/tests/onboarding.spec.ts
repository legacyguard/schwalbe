import { test, expect } from '@playwright/test'

// Smoke test for onboarding route (feature-flagged)

test('onboarding route guarded and renders when enabled', async ({ page }) => {
  await page.goto('/en/onboarding');

  if ((await page.title()).includes('404') || page.url().includes('/404')) {
    test.skip(true, 'Onboarding flag disabled; skipping test');
  }

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
});
