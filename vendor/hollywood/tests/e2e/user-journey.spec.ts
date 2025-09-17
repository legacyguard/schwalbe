import { expect, test } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('should complete full user journey from signup to project completion', async ({
    page,
  }) => {
    // Generate unique email for this test run to ensure idempotency
    const uniqueEmail = `alice.johnson.${Date.now()}@example.com`;

    // 1. Sign up as new user
    await page.goto('/sign-up');
    await page.fill('input[name="firstName"]', 'Alice');
    await page.fill('input[name="lastName"]', 'Johnson');
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // 2. Create first project
    await page.click('text=Projects');
    await page.waitForURL('**/projects');

    await page.click('text=Create Project');
    await page.fill('input[name="name"]', 'Website Redesign');
    await page.fill(
      'textarea[name="description"]',
      'Complete redesign of company website with modern UI/UX'
    );
    await page.selectOption('select[name="status"]', 'active');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Website Redesign')).toBeVisible();

    // 3. Create tasks for the project
    await page.click('text=Tasks');
    await page.waitForURL('**/tasks');

    // Create homepage task
    await page.click('text=Create Task');
    await page.fill('input[name="title"]', 'Design homepage mockup');
    await page.fill(
      'textarea[name="description"]',
      'Create modern homepage design with hero section'
    );
    await page.selectOption('select[name="priority"]', 'high');
    await page.selectOption('select[name="status"]', 'todo');
    await page.click('button[type="submit"]');

    // Create about page task
    await page.click('text=Create Task');
    await page.fill('input[name="title"]', 'Develop about page');
    await page.fill(
      'textarea[name="description"]',
      'Create engaging about page with team photos'
    );
    await page.selectOption('select[name="priority"]', 'medium');
    await page.selectOption('select[name="status"]', 'todo');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Design homepage mockup')).toBeVisible();
    await expect(page.locator('text=Develop about page')).toBeVisible();

    // 4. Update task status to in progress
    await page.click('.task-card:has-text("Design homepage mockup")');
    await page.selectOption('select[name="status"]', 'in_progress');

    // 5. Mark task as completed
    await page.selectOption('select[name="status"]', 'completed');

    // 6. View project progress
    await page.click('text=Projects');
    await page.click('.project-card:has-text("Website Redesign")');
    await expect(page.locator('text=50%')).toBeVisible(); // Assuming 2 tasks, 1 completed

    // 7. Sign out
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Sign out');
    await page.waitForURL('**/sign-in');

    // 8. Sign back in to verify data persistence
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Verify project and tasks still exist
    await page.click('text=Projects');
    await expect(page.locator('text=Website Redesign')).toBeVisible();

    await page.click('text=Tasks');
    await expect(page.locator('text=Design homepage mockup')).toBeVisible();
    await expect(page.locator('text=completed')).toBeVisible();
  });
});
