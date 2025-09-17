import type { Page } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

/**
 * Helper functions for handling Clerk authentication in E2E tests
 */

export interface TestUser {
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
}

/**
 * Generate a unique test user email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test.user.${timestamp}.${random}@example.com`;
}

/**
 * Generate test user data
 */
export function generateTestUser(): TestUser {
  return {
    email: generateTestEmail(),
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };
}

/**
 * Setup Clerk testing token for the page
 * This must be called before navigating to any page that uses Clerk
 */
export async function setupClerkTestingForPage(page: Page): Promise<void> {
  await setupClerkTestingToken({ page });
}

/**
 * Wait for Clerk to load on the page
 */
export async function waitForClerk(page: Page): Promise<void> {
  // Setup testing token first
  await setupClerkTestingToken({ page });

  // Wait for Clerk to be available on window
  await page.waitForFunction(
    () => {
      return (
        typeof window !== 'undefined' &&
        (window as Record<string, any>).Clerk !== undefined
      );
    },
    { timeout: 10000 }
  );

  // Additional wait for Clerk UI to render
  await page.waitForLoadState('networkidle');
}

/**
 * Sign up a new user via Clerk
 */
export async function signUpUser(page: Page, user: TestUser): Promise<void> {
  await waitForClerk(page);

  // Click on sign up link/button
  const signUpButton = page
    .locator(
      'a:has-text("Sign up"), button:has-text("Sign up"), [data-localization-key="signUp.start.actionLink"]'
    )
    .first();

  if (await signUpButton.isVisible()) {
    await signUpButton.click();
  }

  // Fill in email
  await page.fill(
    'input[name="emailAddress"], input[type="email"]',
    user.email
  );

  // Continue to password step (Clerk often has multi-step forms)
  const continueButton = page.locator(
    'button:has-text("Continue"), button[data-localization-key="formButtonPrimary"]'
  );
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }

  // Fill in password fields
  await page.fill(
    'input[name="password"], input[type="password"]:not([name="confirmPassword"])',
    user.password
  );

  // Fill in confirm password if present
  const confirmPasswordField = page.locator(
    'input[name="confirmPassword"], input[type="password"][name="confirmPassword"]'
  );
  if (await confirmPasswordField.isVisible()) {
    await confirmPasswordField.fill(user.password);
  }

  // Fill in first and last name if present
  const firstNameField = page.locator('input[name="firstName"]');
  if ((await firstNameField.isVisible()) && user.firstName) {
    await firstNameField.fill(user.firstName);
  }

  const lastNameField = page.locator('input[name="lastName"]');
  if ((await lastNameField.isVisible()) && user.lastName) {
    await lastNameField.fill(user.lastName);
  }

  // Submit the form
  await page.click(
    'button[type="submit"], button:has-text("Sign up"), button:has-text("Create account")'
  );

  // Handle email verification if needed
  // Note: In test mode, you might need to handle OTP or email verification differently
}

/**
 * Sign in an existing user via Clerk
 */
export async function signInUser(page: Page, user: TestUser): Promise<void> {
  await waitForClerk(page);

  // Fill in email
  await page.fill(
    'input[name="identifier"], input[name="emailAddress"], input[type="email"]',
    user.email
  );

  // Continue to password step if needed
  const continueButton = page.locator(
    'button:has-text("Continue"), button[data-localization-key="formButtonPrimary"]'
  );
  if (await continueButton.isVisible()) {
    await continueButton.click();
    await page.waitForTimeout(500); // Small delay for form transition
  }

  // Fill in password
  await page.fill(
    'input[name="password"], input[type="password"]',
    user.password
  );

  // Submit
  await page.click(
    'button[type="submit"], button:has-text("Sign in"), button:has-text("Continue")'
  );

  // Wait for redirect
  await page.waitForLoadState('networkidle');
}

/**
 * Sign out the current user
 */
export async function signOutUser(page: Page): Promise<void> {
  // Look for Clerk UserButton and click it
  const userButton = page
    .locator('.cl-userButton-trigger, [data-clerk-id="clerk-user-button"]')
    .first();

  if (await userButton.isVisible()) {
    await userButton.click();

    // Click sign out in the dropdown
    const signOutButton = page.locator(
      'button:has-text("Sign out"), [data-localization-key="userButton.action__signOut"]'
    );
    await signOutButton.click();

    // Wait for sign out to complete
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Check if user is signed in
 */
export async function isSignedIn(page: Page): Promise<boolean> {
  await waitForClerk(page);

  // Check if user button is visible (indicates signed in state)
  const userButton = page
    .locator('.cl-userButton-trigger, [data-clerk-id="clerk-user-button"]')
    .first();
  return await userButton.isVisible();
}

/**
 * Mock Clerk authentication for faster tests
 * This requires setting up Clerk in test/development mode
 */
export async function mockClerkAuth(page: Page, user: TestUser): Promise<void> {
  // This would require setting up Clerk's test tokens
  // or using Clerk's testing features
  // Implementation depends on your Clerk configuration

  // For now, this is a placeholder
  // You would need to inject test tokens or use Clerk's test mode
  await page.evaluate(testUser => {
    // Mock the Clerk session
    localStorage.setItem('__clerk_test_user', JSON.stringify(testUser));
  }, user);
}
