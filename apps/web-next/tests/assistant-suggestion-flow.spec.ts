import { test, expect } from '@playwright/test'

// Verify suggestion click navigates to target

test('assistant suggestion link navigates to documents', async ({ page }) => {
  await page.goto('/en/assistant?intent=Organize%20important%20documents');
  const list = page.getByTestId('assistant-suggestions');
  const go = list.getByRole('link', { name: /go to/i }).first();
  const href = await go.getAttribute('href');
  await expect(href).toMatch(/\/(en\/)?documents/);
  await go.click();
  await expect(page).toHaveURL(/\/(en\/)?documents/);
});