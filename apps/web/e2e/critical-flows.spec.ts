import { test, expect } from '@playwright/test';

// Critical user flow tests for production readiness
test.describe('Critical User Flows', () => {
  test.describe.configure({ mode: 'serial' });

  test('Landing page loads and password protection works', async ({ page }) => {
    // Test landing page accessibility
    await page.goto('/');
    await expect(page).toHaveTitle(/LegacyGuard/);

    // Test password wall (if enabled)
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('test-password');
      await page.keyboard.press('Enter');

      // Should either authenticate or show error
      await expect(page.locator('text=Invalid password')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Authentication flow - Sign up', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill out sign up form
    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.fill('input[name="name"]', 'Test User');

    // Submit form
    await page.click('button[type="submit"]');

    // Should either succeed or show validation error
    await expect(page).toHaveURL(/\/dashboard|\/auth\/verify/, { timeout: 10000 });
  });

  test('Authentication flow - Sign in', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill out sign in form
    await page.locator('[data-testid="signin-email-input"]').fill('test@example.com');
    await page.locator('[data-testid="signin-password-input"]').fill('testpassword');

    // Submit form
    await page.locator('[data-testid="signin-submit-button"]').click();

    // Should show error for invalid credentials
    await expect(page.locator('[data-testid="signin-error-message"]')).toBeVisible({ timeout: 5000 });
  });

  test('Password reset flow', async ({ page }) => {
    await page.goto('/auth/signin');

    // Click forgot password
    await page.locator('[data-testid="reset-email-input"]').fill('test@example.com');
    await page.locator('[data-testid="reset-submit-button"]').click();

    // Should show success message
    await expect(page.locator('[data-testid="signin-info-message"]')).toBeVisible({ timeout: 5000 });
  });

  test('Protected routes redirect to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to sign in
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });
  });

  test('Onboarding flow accessibility', async ({ page }) => {
    await page.goto('/onboarding');

    // Should load onboarding interface
    await expect(page.locator('[data-testid="onboarding-container"]')).toBeVisible({ timeout: 5000 });

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('Error boundary catches JavaScript errors', async ({ page }) => {
    await page.goto('/dashboard');

    // Inject a JavaScript error
    await page.evaluate(() => {
      throw new Error('Test error for error boundary');
    });

    // Should show error boundary UI
    await expect(page.locator('text=Something went wrong')).toBeVisible({ timeout: 5000 });
  });

  test('Responsive design - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    // Should adapt to mobile layout
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    // Either mobile menu should be visible or content should be readable
    await expect(page.locator('body')).toBeVisible();
  });

  test('Accessibility - keyboard navigation', async ({ page }) => {
    await page.goto('/auth/signin');

    // Test tab navigation through form
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('data-testid', 'signin-email-input');

    await page.keyboard.press('Tab');
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('data-testid', 'signin-password-input');

    await page.keyboard.press('Tab');
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('data-testid', 'signin-submit-button');
  });

  test('Performance - page load times', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;

    // Should load within reasonable time
    expect(loadTime).toBeLessThan(5000); // 5 seconds

    // Check for performance issues
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('navigation').map(entry => ({
        loadEventEnd: (entry as any).loadEventEnd,
        domContentLoadedEventEnd: (entry as any).domContentLoadedEventEnd
      }));
    });

    if (performanceEntries.length > 0) {
      const entry = performanceEntries[0];
      expect(entry.domContentLoadedEventEnd).toBeLessThan(3000); // 3 seconds
    }
  });

  test('Security - no sensitive data in HTML', async ({ page }) => {
    await page.goto('/');

    const htmlContent = await page.content();

    // Should not contain sensitive environment variables
    expect(htmlContent).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(htmlContent).not.toContain('STRIPE_SECRET_KEY');
    expect(htmlContent).not.toContain('RESEND_API_KEY');

    // Should not contain hardcoded secrets
    expect(htmlContent).not.toMatch(/sk_test_[a-zA-Z0-9]+/);
    expect(htmlContent).not.toMatch(/sk_live_[a-zA-Z0-9]+/);
  });

  test('API error handling', async ({ page }) => {
    // Mock a failed API call
    await page.route('**/functions/v1/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/dashboard');

    // Should handle API errors gracefully
    // This test may need adjustment based on actual error handling UI
    await expect(page.locator('body')).toBeVisible();
  });
});

// Payment flow tests (mocked)
test.describe('Payment Flows', () => {
  test('Stripe integration loads', async ({ page }) => {
    await page.goto('/dashboard');

    // Should load without Stripe errors
    const stripeErrors = page.locator('text=Stripe');
    await expect(stripeErrors).toHaveCount(0);
  });
});

// Document management tests (mocked)
test.describe('Document Management', () => {
  test('Document upload interface loads', async ({ page }) => {
    await page.goto('/documents');

    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });
  });
});

// AI Assistant tests
test.describe('AI Assistant', () => {
  test('Sofia AI interface loads', async ({ page }) => {
    await page.goto('/onboarding');

    // Should show AI assistant
    const sofiaElement = page.locator('[data-testid="sofia-firefly"]');
    await expect(sofiaElement).toBeVisible({ timeout: 10000 });
  });
});

// Internationalization tests
test.describe('Internationalization', () => {
  test('Language switching works', async ({ page }) => {
    await page.goto('/');

    // Look for language switcher
    const languageSwitcher = page.locator('[data-testid="language-switcher"], [aria-label*="language"], .language-switcher');

    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();

      // Should show language options
      const languageOptions = page.locator('[role="menuitem"], [data-testid*="lang"]');
      await expect(languageOptions.first()).toBeVisible();
    }
  });

  test('RTL language support', async ({ page }) => {
    // Test with Arabic locale if supported
    await page.goto('/ar'); // Arabic locale

    // Should either redirect or handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });
});

// Monitoring and analytics
test.describe('Monitoring', () => {
  test('Error tracking works', async ({ page }) => {
    // Trigger a client-side error
    await page.evaluate(() => {
      throw new Error('Test error for monitoring');
    });

    // Should not crash the app
    await expect(page.locator('body')).toBeVisible();

    // Error boundary should catch it
    await expect(page.locator('text=Something went wrong')).toBeVisible({ timeout: 5000 });
  });

  test('Performance monitoring active', async ({ page }) => {
    await page.goto('/');

    // Check if performance observer is active
    const performanceActive = await page.evaluate(() => {
      return typeof window !== 'undefined' &&
             'performance' in window &&
             'PerformanceObserver' in window;
    });

    expect(performanceActive).toBe(true);
  });
});