import { test, expect } from '@playwright/test'

// Landing v2 E2E tests for i18n and analytics
// Tests the Hollywood Landing feature when enabled via feature flag

test.describe('Landing v2 (Hollywood Landing)', () => {
  test.beforeEach(async ({ page }) => {
    // Set the feature flag to enable Hollywood Landing
    await page.addInitScript(() => {
      // Mock the feature flag to return true
      Object.defineProperty(window, 'importMetaEnv', {
        value: { VITE_ENABLE_HOLLYWOOD_LANDING: 'true' },
        writable: false,
      });
    });
  });

  test('displays landing v2 in English with analytics', async ({ page }) => {
    // Listen for console.log calls to capture analytics events
    const analyticsEvents: any[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Analytics event:')) {
        try {
          const eventData = JSON.parse(msg.text().replace('Analytics event: ', ''));
          analyticsEvents.push(eventData);
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    await page.goto('/landing-v2');

    // Check English content
    await expect(page.getByText('Protect what matters most')).toBeVisible();
    await expect(page.getByText('A modern way to secure your family\'s legacy with care and clarity.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get started' })).toBeVisible();

    // Check for landing_view analytics event
    await page.waitForTimeout(100); // Wait for analytics to fire
    expect(analyticsEvents.some(event => event.eventType === 'landing_view')).toBe(true);

    // Click CTA and check analytics
    await page.getByRole('button', { name: 'Get started' }).click();
    await page.waitForTimeout(100);
    expect(analyticsEvents.some(event =>
      event.eventType === 'landing_cta_click' && event.eventData?.cta === 'hero'
    )).toBe(true);
  });

  test('displays landing v2 in Slovak with analytics', async ({ page }) => {
    // Set Slovak language
    await page.addInitScript(() => {
      localStorage.setItem('i18nextLng', 'sk');
    });

    const analyticsEvents: any[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Analytics event:')) {
        try {
          const eventData = JSON.parse(msg.text().replace('Analytics event: ', ''));
          analyticsEvents.push(eventData);
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    await page.goto('/landing-v2');

    // Check Slovak content
    await expect(page.getByText('Chráňte to najdôležitejšie')).toBeVisible();
    await expect(page.getByText('Moderný spôsob, ako s láskou a jasom chrániť dedičstvo rodiny.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Začať' })).toBeVisible();

    // Check for landing_view analytics event
    await page.waitForTimeout(100);
    expect(analyticsEvents.some(event => event.eventType === 'landing_view')).toBe(true);
  });

  test('tracks section view analytics', async ({ page }) => {
    const analyticsEvents: any[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Analytics event:')) {
        try {
          const eventData = JSON.parse(msg.text().replace('Analytics event: ', ''));
          analyticsEvents.push(eventData);
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    await page.goto('/landing-v2');

    // Scroll to trigger section view
    const sectionElement = page.getByText('Why LegacyGuard?');
    await sectionElement.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200); // Wait for IntersectionObserver debounce

    // Check for section view analytics
    expect(analyticsEvents.some(event =>
      event.eventType === 'landing_section_view' && event.eventData?.id === 'value'
    )).toBe(true);
  });

  test('feature flag disabled hides landing v2', async ({ page }) => {
    // Override the feature flag to be disabled
    await page.addInitScript(() => {
      Object.defineProperty(window, 'importMetaEnv', {
        value: { VITE_ENABLE_HOLLYWOOD_LANDING: 'false' },
        writable: false,
      });
    });

    await page.goto('/landing-v2');

    // Should not show landing v2 content
    await expect(page.getByText('Protect what matters most')).not.toBeVisible();
    // Should show regular app content or 404
    await expect(page.getByText('Schwalbe App')).toBeVisible();
  });
});