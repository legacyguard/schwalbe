import { test, expect } from '@playwright/test'

// Assistant nav link appears when flag is enabled

test('assistant nav link is visible and routes correctly', async ({ page }) => {
  await page.goto('/en');
  const link = page.getByRole('link', { name: /assistant/i })
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', /\/en\/assistant(\?.*)?$/);
  await link.click();
  await expect(page).toHaveURL(/\/(en\/)?assistant(\?.*)?/);
});
