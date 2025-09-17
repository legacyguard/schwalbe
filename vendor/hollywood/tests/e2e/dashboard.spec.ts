import { expect, test } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/sign-in');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should display dashboard with welcome message', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Projects')).toBeVisible();
    await expect(page.locator('text=Tasks')).toBeVisible();
    await expect(page.locator('text=Team')).toBeVisible();
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.click('text=Projects');
    await page.waitForURL('**/projects');
    await expect(page.locator('text=Projects')).toBeVisible();
  });

  test('should navigate to tasks page', async ({ page }) => {
    await page.click('text=Tasks');
    await page.waitForURL('**/tasks');
    await expect(page.locator('text=Tasks')).toBeVisible();
  });

  test('should display user profile information', async ({ page }) => {
    await page.click('button[aria-label="User menu"]');
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });
});
