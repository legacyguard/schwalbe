import { test, expect } from '@playwright/test'

// Assistant e2e smoke: load page, send a message, see assistant reply

test('assistant page loads and replies', async ({ page }) => {
  await page.goto('/en/assistant');

  // Flag off => 404 skip
  if ((await page.title()).includes('404') || page.url().includes('/404')) {
    test.skip(true, 'Assistant flag disabled; skipping test');
  }

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const input = page.locator('input').first();
  await expect(input).toBeVisible();
  await input.fill('hello');

  const send = page.getByRole('button', { name: /send/i });
  await expect(send).toBeVisible();
  await send.click();

  // Expect assistant message to appear
  await expect(page.locator('text=guide you gently').first()).toBeVisible();
});
