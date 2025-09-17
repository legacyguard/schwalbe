import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display sign in page', async ({ page }) => {
    await expect(page).toHaveTitle(/LegacyGuard/);
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should allow user to sign in with email and password', async ({
    page,
  }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in|submit/i }).click();

    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|submit/i }).click();

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should allow user to sign up', async ({ page }) => {
    const uniqueEmail = `e2e+${Date.now()}@example.com`;
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/.*\/sign-up/);

    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign up|submit/i }).click();

    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should allow user to sign out', async ({ page }) => {
    // First sign in
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in|submit/i }).click();

    // Then sign out
    await page.getByRole('button', { name: /user menu/i }).click();
    await page.click('text=Sign out');

    await expect(page).toHaveURL(/.*\/sign-in/);
  });
});
