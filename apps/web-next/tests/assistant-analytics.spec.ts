import { test, expect } from '@playwright/test'

// Intercept analytics beacons and assert event payloads

test('assistant_open includes source=dashboard when coming from dashboard CTA', async ({ page }) => {
  const events: any[] = [];
  await page.route('**/api/analytics/events', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    events.push(body);
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.goto('/en/dashboard-v2');
  const cta = page.getByTestId('dashboard-v2-cta-assistant');
  if (await cta.count() === 0) test.skip(true, 'CTA not present');
  await cta.click();
  await expect(page).toHaveURL(/\/(en\/)?assistant/);

  // Wait for beacon with simple polling
  let hasOpen = false;
  for (let i = 0; i < 15; i++) { // up to ~3s
    await page.waitForTimeout(200);
    hasOpen = events.some(e => e?.eventType === 'assistant_open' && e?.eventData?.source === 'dashboard');
    if (hasOpen) break;
  }
  expect(hasOpen).toBeTruthy();
});


test('assistant_open includes source=nav when coming from nav link', async ({ page }) => {
  const events: any[] = [];
  await page.route('**/api/analytics/events', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    events.push(body);
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.goto('/en');
  const link = page.getByRole('link', { name: /assistant/i });
  await link.click();
  await expect(page).toHaveURL(/\/(en\/)?assistant/);

  // Poll for beacon to avoid flakiness
  let hasOpen = false;
  for (let i = 0; i < 20; i++) { // up to ~4s
    await page.waitForTimeout(200);
    hasOpen = events.some(e => e?.eventType === 'assistant_open' && e?.eventData?.source === 'nav');
    if (hasOpen) break;
  }
  expect(hasOpen).toBeTruthy();
});


test('assistant_suggestion_click beacon fires on suggestion Go click', async ({ page }) => {
  const events: any[] = [];
  await page.route('**/api/analytics/events', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    events.push(body);
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.goto('/en/assistant?intent=Organize%20important%20documents&source=test');
  const list = page.getByTestId('assistant-suggestions');
  const go = list.getByRole('link', { name: /go to/i }).first();
  await go.click();
  await page.waitForTimeout(200);
  const hasClick = events.some(e => e?.eventType === 'assistant_suggestion_click');
  expect(hasClick).toBeTruthy();
});