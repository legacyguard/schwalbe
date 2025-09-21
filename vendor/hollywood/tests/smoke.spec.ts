import { expect, test } from '@playwright/test';

// Smoke test configuration
test.describe('Smoke Test - Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application root
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should load the landing page successfully', async ({ page }) => {
    // Verify the page title
    await expect(page).toHaveTitle(/LegacyGuard/i);

    // Check if the main content is visible
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('should display hero section with CTA button', async ({ page }) => {
    // Check for hero section
    const heroSection = page
      .locator('section')
      .filter({
        hasText: /protect|secure|family|legacy|guardian/i,
      })
      .first();

    // Verify hero section is visible
    await expect(heroSection).toBeVisible({ timeout: 10000 });

    // Find and verify CTA button
    const ctaButton = page
      .locator('button, a')
      .filter({
        hasText: /get started|start|begin|sign up|try/i,
      })
      .first();

    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
  });

  test('should navigate to sign up when CTA is clicked', async ({ page }) => {
    // Find the main CTA button
    const ctaButton = page
      .locator('button, a')
      .filter({
        hasText: /get started|start|begin|sign up/i,
      })
      .first();

    // Click the CTA button
    await ctaButton.click();

    // Wait for navigation
    await page.waitForURL(/(sign-up|sign-in|auth|onboarding)/i, {
      timeout: 10000,
    });

    // Verify we're on a sign-up or authentication page
    const url = page.url();
    expect(url).toMatch(/(sign-up|sign-in|auth|onboarding)/i);

    // Check for authentication form elements
    const emailInput = page
      .locator('input[type="email"], input[name*="email"]')
      .first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });

  test('should have working navigation links', async ({ page }) => {
    // Check for navigation menu
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();

    // Test privacy policy link if exists
    const privacyLink = page
      .locator('a')
      .filter({
        hasText: /privacy/i,
      })
      .first();

    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('privacy');

      // Go back to home
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }

    // Test terms link if exists
    const termsLink = page
      .locator('a')
      .filter({
        hasText: /terms/i,
      })
      .first();

    if (await termsLink.isVisible()) {
      await termsLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('terms');
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page with mobile viewport
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check main content is still visible
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();

    // Check if mobile menu button exists (hamburger menu)
    const mobileMenuButton = page
      .locator('button')
      .filter({
        has: page.locator('svg, [aria-label*="menu"]'),
      })
      .first();

    // If mobile menu exists, it should be visible
    if ((await mobileMenuButton.count()) > 0) {
      await expect(mobileMenuButton).toBeVisible();
    }
  });

  test('should load without console errors', async ({ page }) => {
    // Collect console messages
    const consoleMessages: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for critical errors (ignoring common warnings)
    const criticalErrors = consoleMessages.filter(
      msg =>
        !msg.includes('DevTools') &&
        !msg.includes('favicon') &&
        !msg.includes('Third-party cookie') &&
        !msg.includes('[vite]')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();

    // Check for main landmark
    const mainLandmark = page.locator('main, [role="main"]').first();
    await expect(mainLandmark).toBeVisible();

    // Check for proper heading hierarchy
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const alt = await img.getAttribute('alt');
        // Images should have alt text or be decorative (empty alt)
        expect(alt !== null).toBeTruthy();
      }
    }
  });
});

// Additional smoke test for authenticated flow (if needed)
test.describe('Smoke Test - Authentication Flow', () => {
  test('should redirect to sign-in when accessing protected route', async ({
    page,
  }) => {
    // Try to access a protected route
    await page.goto('/dashboard');

    // Should redirect to sign-in
    await page.waitForURL(/(sign-in|auth|login)/i, {
      timeout: 10000,
    });

    // Verify we're on authentication page
    const emailInput = page
      .locator('input[type="email"], input[name*="email"]')
      .first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });
});
