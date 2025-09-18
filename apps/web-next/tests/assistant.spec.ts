import { test, expect } from '@playwright/test'

// Assistant smoke under flag; accepts optional intent query

test('assistant loads and shows panel', async ({ page }) => {
  await page.goto('/en/assistant?intent=Enable%20emergency%20access');
  await expect(page.getByRole('heading', { name: /assistant/i })).toBeVisible();
  await expect(page.getByTestId('assistant-panel')).toBeVisible();
});