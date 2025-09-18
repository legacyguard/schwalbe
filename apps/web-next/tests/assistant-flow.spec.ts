import { test, expect } from '@playwright/test'

// Dashboard -> Assistant intent flow

test('dashboard CTA opens assistant with intent', async ({ page }) => {
  await page.goto('/en/dashboard-v2');

  const cta = page.getByTestId('dashboard-v2-cta-assistant');
  const exists = await cta.count();
  if (exists === 0) test.skip(true, 'Assistant flag disabled or CTA not present');

  await expect(cta).toHaveAttribute('href', /\/en\/assistant\?intent=/);
  await cta.click();

  await expect(page).toHaveURL(/\/(en\/)?assistant\?intent=/);
  await expect(page.getByTestId('assistant-panel')).toBeVisible();
  await expect(page.getByTestId('assistant-panel')).toContainText(/Enable emergency access/i);
});