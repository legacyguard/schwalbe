import { test, expect } from '@playwright/test'

// Minimal smoke test for Landing V2
// Assumes dev server runs at PLAYWRIGHT_BASE_URL (default http://localhost:3001)

test('landing-v2 renders and CTA exists', async ({ page }) => {
  // Use English locale for determinism
  await page.goto('/en/landing-v2');

  // If feature flag is off, we expect 404. Skip gracefully.
  if ((await page.title()).includes('404') || page.url().includes('/404')) {
    test.skip(true, 'Feature flag disabled, landing-v2 not available');
  }

  // Hero heading visible
  await expect(page.locator('h1')).toHaveCount(1);

  // Primary CTA button/link exists
  const cta = page.getByRole('link', { name: /start/i });
  await expect(cta).toBeVisible();

  // Click CTA to ensure no immediate error
  await cta.click();

  // Scroll to features and pricing anchors
  await page.keyboard.press('End');
  // Give time for any analytics beacons (best-effort)
  await page.waitForTimeout(300);
});
