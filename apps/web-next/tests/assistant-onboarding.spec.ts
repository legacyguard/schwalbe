import { test, expect } from '@playwright/test'

// Verify assistant respects onboarding-derived plan from localStorage

test('assistant derives suggestions from onboarding state', async ({ page }) => {
  // Seed localStorage before visiting assistant
  await page.goto('/en');
  await page.evaluate(() => {
    localStorage.setItem('onb_state_en', JSON.stringify({ boxItems: ['id', 'insurance'] }));
  });
  await page.goto('/en/assistant');
  const list = page.getByTestId('assistant-suggestions');
  await expect(list).toBeVisible();
  await expect(list).toContainText(/Set up document vault/i);
});