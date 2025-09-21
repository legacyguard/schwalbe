import { expect, test } from '@playwright/test';

test.describe('Tasks Management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/sign-in');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should create a new task', async ({ page }) => {
    await page.click('text=Tasks');
    await page.waitForURL('**/tasks');

    await page.click('text=Create Task');
    await page.fill('input[name="title"]', 'Test Task');
    await page.fill('textarea[name="description"]', 'This is a test task');
    await page.selectOption('select[name="priority"]', 'high');
    await page.selectOption('select[name="status"]', 'todo');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Test Task')).toBeVisible();
  });

  test('should update task status', async ({ page }) => {
    await page.click('text=Tasks');
    await page.waitForURL('**/tasks');

    // Click on first task
    await page.click('.task-card:first-child');
    await page.selectOption('select[name="status"]', 'in_progress');

    await expect(page.locator('text=In Progress')).toBeVisible();
  });

  test('should assign task to team member', async ({ page }) => {
    await page.click('text=Tasks');
    await page.waitForURL('**/tasks');

    await page.click('.task-card:first-child');
    await page.click('text=Assign');
    await page.click('text=John Doe');

    await expect(page.locator('text=Assigned to John Doe')).toBeVisible();
  });

  test('should filter tasks by status', async ({ page }) => {
    await page.click('text=Tasks');
    await page.waitForURL('**/tasks');

    // Ensure a TODO task exists
    await page.getByRole('button', { name: 'Create Task' }).click();
    const todoTitle = `Todo ${Date.now()}`;
    await page.fill('input[name="title"]', todoTitle);
    await page.fill(
      'textarea[name="description"]',
      'Ensure filter precondition'
    );
    test('should search tasks', async ({ page }) => {
      await page.click('text=Tasks');
      await page.waitForURL('**/tasks');

      const query = `Searchable ${Date.now()}`;
      await page.getByRole('button', { name: 'Create Task' }).click();
      await page.fill('input[name="title"]', query);
      await page.fill('textarea[name="description"]', 'Search precondition');
      await page.selectOption('select[name="status"]', 'todo');
      await page.click('button[type="submit"]');
      await page.fill('input[placeholder="Search tasks..."]', query);
      const filteredTasks = await page
        .locator('.task-card', { hasText: query })
        .count();
      expect(filteredTasks).toBeGreaterThan(0);
    });
    await page.click('text=Tasks');
    await page.waitForURL('**/tasks');

    await page.fill('input[placeholder="Search tasks..."]', 'Test');
    const filteredTasks = await page.locator('.task-card').count();
    expect(filteredTasks).toBeGreaterThan(0);
  });
});
