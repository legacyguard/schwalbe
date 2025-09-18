import { test, expect } from '@playwright/test'

// Verify AssistantPanel has proper aria labels for CTA and suggestions

test('assistant CTA and suggestions have aria-labels', async ({ page }) => {
  await page.goto('/en/assistant?intent=Organize%20important%20documents');
  const panel = page.getByTestId('assistant-panel');
  await expect(panel).toHaveAttribute('aria-busy', 'false');

  const cta = page.getByTestId('assistant-cta-start');
  await expect(cta).toHaveAttribute('aria-label', /start/i);

  const list = page.getByTestId('assistant-suggestions');
  await expect(list).toBeVisible();
  const firstGo = list.getByRole('link', { name: /go to/i }).first();
  await expect(firstGo).toBeVisible();
});