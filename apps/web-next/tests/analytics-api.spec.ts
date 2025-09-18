import { test, expect } from '@playwright/test'

// Basic API route smoke for analytics events

test('POST /api/analytics/events returns 202', async ({ request, baseURL }) => {
  const res = await request.post(`${baseURL}/api/analytics/events`, {
    data: {
      eventType: 'assistant_open',
      eventData: { intent: 'Enable emergency access', locale: 'en' },
    },
  });
  expect(res.status()).toBe(202);
});