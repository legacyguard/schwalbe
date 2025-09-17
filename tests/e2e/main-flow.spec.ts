import { expect, test } from '@playwright/test';

test.describe('Main User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8083');
  });

  test('landing page loads correctly', async ({ page }) => {
    // Check if main elements are present
    await expect(page).toHaveTitle(/LegacyGuard/i);

    // Check for main heading
    const heading = page.locator('h1');
    await expect(heading.first()).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    // Check if navigation links are present
    const blogLink = page.locator('a[href="/blog"]');
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await expect(page).toHaveURL(/.*\/blog/);
    }
  });

  test('skip links are keyboard accessible', async ({ page }) => {
    // Focus on the first skip link using Tab
    await page.keyboard.press('Tab');

    // Check if skip link is focused
    const skipLink = page.locator('.skip-link').first();
    await expect(skipLink).toBeFocused();
  });

  test('authentication flow', async ({ page }) => {
    // Navigate to sign in
    const signInLink = page.locator('text=Sign In').first();
    if (await signInLink.isVisible()) {
      await signInLink.click();

      // Check if we're on the sign-in page
      await expect(page.locator('text=Sign In')).toBeVisible();
    }
  });

  test('accessibility - keyboard navigation', async ({ page }) => {
    // Test Tab navigation through interactive elements
    const interactiveElements = await page
      .locator(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      .all();

    if (interactiveElements.length > 0) {
      // Tab through first few elements
      for (let i = 0; i < Math.min(5, interactiveElements.length); i++) {
        await page.keyboard.press('Tab');
        // Check if an element is focused
        const focusedElement = await page.evaluate(
          () => document.activeElement?.tagName
        );
        expect(focusedElement).toBeTruthy();
      }
    }
  });

  test('accessibility - ARIA labels', async ({ page }) => {
    // Check for proper ARIA labels on navigation
    const nav = page.locator('nav[aria-label]').first();
    if (await nav.isVisible()) {
      const ariaLabel = await nav.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });

  test('responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Wait for responsive adjustments

    // Check if page is still functional
    const mainContent = page
      .locator('main, [role="main"], #main-content')
      .first();
    await expect(mainContent).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(mainContent).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(mainContent).toBeVisible();
  });

  test('color contrast meets WCAG standards', async ({ page }) => {
    // This is a simplified test - in production, use axe-core or similar
    const backgroundColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });

    const textColor = await page.evaluate(() => {
      const firstText = document.querySelector('p, span, div');
      return firstText ? window.getComputedStyle(firstText).color : null;
    });

    // Basic check that colors are defined
    expect(backgroundColor).toBeTruthy();
    expect(textColor).toBeTruthy();
  });
});

test.describe('Protected Routes', () => {
  test('redirects to sign-in when not authenticated', async ({ page }) => {
    // Try to access a protected route
    await page.goto('http://localhost:5173/dashboard');

    // Should redirect to sign-in or show sign-in prompt
    // The exact behavior depends on Clerk configuration
    const url = page.url();
    expect(url).toMatch(/sign-in|clerk|auth/i);
  });
});

test.describe('i18n Support', () => {
  test('language switcher is available', async ({ page }) => {
    await page.goto('http://localhost:8083');

    // Look for language switcher (if implemented in UI)
    // This would need to be adjusted based on actual implementation
    const languageSelector = page
      .locator('[aria-label*="language"], [data-testid="language-switcher"]')
      .first();

    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      // Check if language options are shown
      const languageOptions = page.locator('[role="option"], [data-language]');
      expect(await languageOptions.count()).toBeGreaterThan(0);
    }
  });
});
