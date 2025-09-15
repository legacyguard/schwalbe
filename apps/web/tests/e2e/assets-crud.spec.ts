import { test, expect } from '@playwright/test';

// Basic CRUD UI smoke for assets
// Assumes app runs at baseURL configured in playwright.config

test.describe('Assets CRUD', () => {
  test('navigate, create draft asset (client, no backend assertion)', async ({ page }) => {
    await page.goto('/assets');
    await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible();

    // Go to list
    await page.getByRole('link', { name: 'Go to list' }).click();
    await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible();

    // New asset
    await page.getByRole('link', { name: 'New Asset' }).click();
    await expect(page.getByRole('heading', { name: 'New Asset' })).toBeVisible();

    // Fill minimal fields
    await page.getByLabel('Category').selectOption('vehicle');
    await page.getByLabel('Name').fill('Test Vehicle');

    // Submit (will require auth to persist, this just checks UI flow)
    await page.getByRole('button', { name: 'Create Asset' }).click();

    // Back on list
    await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible();
  });
});
