import { test, expect } from '@playwright/test'

// Assistant smoke under flag; accepts optional intent query

test('assistant loads and shows panel', async ({ page }) => {
  await page.goto('/en/assistant?intent=Enable%20emergency%20access');
  await expect(page.getByRole('heading', { name: /assistant/i })).toBeVisible();
  const panel = page.getByTestId('assistant-panel')
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(/Enable emergency access/i);
  const cta = page.getByTestId('assistant-cta-start');
  await expect(cta).toHaveAttribute('href', '/en/support');
});

test('assistant cta routes to documents for organize intent', async ({ page }) => {
  await page.goto('/en/assistant?intent=Organize%20important%20documents');
  const cta = page.getByTestId('assistant-cta-start');
  await expect(cta).toHaveAttribute('href', '/en/documents');
});
