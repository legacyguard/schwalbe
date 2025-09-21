import { expect, test } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should display Clerk sign-in form on homepage', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if Clerk sign-in elements are present
    // The exact selectors will depend on your Clerk configuration
    // These are common Clerk authentication UI elements
    const clerkAuthContainer = page
      .locator(
        '[data-clerk-id], .cl-component, .cl-auth-container, .cl-sign-in, .cl-sign-up'
      )
      .first();

    // Wait for Clerk to initialize and render
    await expect(clerkAuthContainer).toBeVisible({ timeout: 10000 });

    // Verify that we're on the authentication page
    // Check for common Clerk auth elements
    const authElements = await page
      .locator(
        '.cl-formButtonPrimary, .cl-formFieldInput, button:has-text("Sign in"), button:has-text("Sign up"), input[type="email"], input[type="password"]'
      )
      .count();

    // At least some authentication elements should be present
    expect(authElements).toBeGreaterThan(0);

    // Take a screenshot for debugging
    await page.screenshot({
      path: 'tests/screenshots/homepage-auth.png',
      fullPage: true,
    });
  });

  test('should navigate through complete user journey', async ({ page }) => {
    // This test will simulate a complete user journey
    // Note: For Clerk authentication, you'll need to either:
    // 1. Use test mode with mock authentication
    // 2. Use actual test credentials
    // 3. Mock the Clerk authentication entirely

    await page.goto('/');

    // Wait for Clerk to load
    await page.waitForLoadState('networkidle');

    // TODO: Implement authentication flow
    // This will depend on your Clerk configuration and test strategy

    // For now, let's just verify the page loads
    await expect(page).toHaveTitle(/LegacyGuard|Legacy Guard|Warp/i);
  });
});

test.describe('User Registration and Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session/cookies
    await page.context().clearCookies();
  });

  test('should complete registration flow', async ({ page }) => {
    await page.goto('/');

    // Wait for Clerk auth to load
    await page.waitForLoadState('networkidle');

    // Look for sign up option
    const signUpButton = page
      .locator(
        'button:has-text("Sign up"), a:has-text("Sign up"), [data-localization-key="signUp"]'
      )
      .first();

    if (await signUpButton.isVisible()) {
      await signUpButton.click();

      // Wait for sign up form to appear
      await page.waitForSelector(
        'input[type="email"], input[name="emailAddress"], .cl-formFieldInput',
        { timeout: 5000 }
      );

      // TODO: Complete the sign up flow
      // This would involve:
      // 1. Entering email
      // 2. Entering password
      // 3. Confirming password
      // 4. Potentially verifying email
      // 5. Completing any additional Clerk requirements
    }
  });
});
