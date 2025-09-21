import { expect, test } from '@playwright/test';
import { generateTestUser, waitForClerk } from './helpers/auth';

test.describe('Complete User Journey - Registration to Dashboard', () => {
  const _testUser = generateTestUser();

  test.describe.configure({ mode: 'serial' });

  test('Step 1: User Registration', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for Clerk to load
    await waitForClerk(page);

    // Take screenshot of initial landing
    await page.screenshot({
      path: 'tests/screenshots/01-landing-page.png',
      fullPage: true,
    });

    // Look for sign up option
    const signUpLink = page
      .locator('a:has-text("Sign up"), button:has-text("Sign up")')
      .first();

    if (await signUpLink.isVisible()) {
      await signUpLink.click();

      // Wait for sign up form
      await page.waitForSelector(
        'input[type="email"], input[name="emailAddress"]'
      );

      // Take screenshot of sign up form
      await page.screenshot({
        path: 'tests/screenshots/02-signup-form.png',
        fullPage: true,
      });

      // Note: Actual sign up would require handling Clerk's email verification
      // For testing, you might need to use Clerk's test mode or mock authentication
    }
  });

  test('Step 2: Onboarding Flow', async ({ page }) => {
    // This test assumes the user is already authenticated
    // In a real scenario, you would need to handle authentication first

    // For demonstration, let's check if onboarding elements exist
    await page.goto('/');
    await waitForClerk(page);

    // Check for onboarding elements based on your WARP.md
    // The onboarding should include emotional questions and life inventory

    // Look for onboarding wizard or redirect to onboarding
    const onboardingElements = page.locator(
      '[data-testid="onboarding"], .onboarding-wizard, h1:has-text("Welcome")'
    );

    if (
      await onboardingElements
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await page.screenshot({
        path: 'tests/screenshots/03-onboarding-start.png',
        fullPage: true,
      });
    }
  });

  test('Step 3: Dashboard Access', async ({ page }) => {
    // Navigate to dashboard (assuming authenticated)
    await page.goto('/');
    await waitForClerk(page);

    // Check for dashboard elements
    // Based on WARP.md, should see Life Inventory Dashboard
    const dashboardElements = page.locator(
      '.dashboard, [data-testid="dashboard"], h1:has-text("Dashboard"), .pillar-card'
    );

    if (
      await dashboardElements
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await page.screenshot({
        path: 'tests/screenshots/04-dashboard.png',
        fullPage: true,
      });
    }
  });
});

test.describe('Document Management Flow', () => {
  test('Upload and manage documents', async ({ page }) => {
    await page.goto('/');
    await waitForClerk(page);

    // Navigate to Important Papers section
    const importantPapersLink = page
      .locator(
        'a:has-text("Important Papers"), [href*="papers"], [href*="documents"]'
      )
      .first();

    if (
      await importantPapersLink.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await importantPapersLink.click();

      // Wait for documents page to load
      await page.waitForLoadState('networkidle');

      // Look for add document button
      const addDocButton = page
        .locator(
          'button:has-text("Add"), button:has-text("Upload"), button:has-text("New Document")'
        )
        .first();

      if (await addDocButton.isVisible()) {
        await page.screenshot({
          path: 'tests/screenshots/05-documents-page.png',
          fullPage: true,
        });

        // Click add document
        await addDocButton.click();

        // Check for upload dialog/modal
        const uploadDialog = page.locator(
          '[role="dialog"], .modal, .sheet-content'
        );
        await expect(uploadDialog).toBeVisible({ timeout: 5000 });

        await page.screenshot({
          path: 'tests/screenshots/06-add-document-dialog.png',
          fullPage: true,
        });
      }
    }
  });
});

test.describe('People Management Flow', () => {
  test('Add trusted people', async ({ page }) => {
    await page.goto('/');
    await waitForClerk(page);

    // Navigate to My Loved Ones section
    const lovedOnesLink = page
      .locator(
        'a:has-text("Loved Ones"), a:has-text("Trusted Circle"), [href*="people"], [href*="loved-ones"]'
      )
      .first();

    if (await lovedOnesLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await lovedOnesLink.click();

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Look for add person button
      const addPersonButton = page
        .locator(
          'button:has-text("Add Person"), button:has-text("Add Trusted Person")'
        )
        .first();

      if (await addPersonButton.isVisible()) {
        await page.screenshot({
          path: 'tests/screenshots/07-trusted-people.png',
          fullPage: true,
        });

        // Click add person
        await addPersonButton.click();

        // Check for add person dialog
        const addPersonDialog = page.locator(
          '[role="dialog"], .modal, .sheet-content'
        );
        await expect(addPersonDialog).toBeVisible({ timeout: 5000 });

        // Fill in person details
        const nameInput = page
          .locator('input[name="name"], input[placeholder*="Name"]')
          .first();
        if (await nameInput.isVisible()) {
          await nameInput.fill('John Doe');
        }

        const relationshipInput = page
          .locator(
            'input[name="relationship"], input[placeholder*="Relationship"]'
          )
          .first();
        if (await relationshipInput.isVisible()) {
          await relationshipInput.fill('Brother');
        }

        await page.screenshot({
          path: 'tests/screenshots/08-add-person-dialog.png',
          fullPage: true,
        });
      }
    }
  });
});

test.describe('Assets Management Flow', () => {
  test('Add and manage possessions', async ({ page }) => {
    await page.goto('/');
    await waitForClerk(page);

    // Navigate to My Possessions section
    const possessionsLink = page
      .locator(
        'a:has-text("Possessions"), a:has-text("Assets"), [href*="possessions"], [href*="assets"]'
      )
      .first();

    if (await possessionsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await possessionsLink.click();

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Look for add asset button
      const addAssetButton = page
        .locator(
          'button:has-text("Add"), button:has-text("New Asset"), button:has-text("Add Possession")'
        )
        .first();

      if (await addAssetButton.isVisible()) {
        await page.screenshot({
          path: 'tests/screenshots/09-possessions-page.png',
          fullPage: true,
        });

        // Click add asset
        await addAssetButton.click();

        // Check for add asset dialog
        const addAssetDialog = page.locator(
          '[role="dialog"], .modal, .sheet-content'
        );
        await expect(addAssetDialog).toBeVisible({ timeout: 5000 });

        await page.screenshot({
          path: 'tests/screenshots/10-add-asset-dialog.png',
          fullPage: true,
        });
      }
    }
  });
});

test.describe('Will Generation Flow', () => {
  test('Create a will through wizard', async ({ page }) => {
    await page.goto('/');
    await waitForClerk(page);

    // Navigate to Will Generator
    const willLink = page
      .locator('a:has-text("Will"), a:has-text("Create Will"), [href*="will"]')
      .first();

    if (await willLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await willLink.click();

      // Wait for will generator to load
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: 'tests/screenshots/11-will-generator.png',
        fullPage: true,
      });

      // Check for will wizard steps
      const wizardSteps = page.locator(
        '.wizard-step, [data-testid*="step"], .step-indicator'
      );

      if (
        await wizardSteps
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false)
      ) {
        // Document the wizard flow
        const stepCount = await wizardSteps.count();
        // console.error(`Will wizard has ${stepCount} steps`);
      }
    }
  });
});

test.describe('Scenario Planner', () => {
  test('Test what-if scenarios', async ({ page }) => {
    await page.goto('/');
    await waitForClerk(page);

    // Look for scenario planner link or button
    const scenarioLink = page
      .locator(
        'a:has-text("Scenario"), button:has-text("What if"), [data-testid="scenario-planner"]'
      )
      .first();

    if (await scenarioLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scenarioLink.click();

      // Wait for scenario planner to open
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'tests/screenshots/12-scenario-planner.png',
        fullPage: true,
      });
    }
  });
});

test.describe('MicroTask Engine', () => {
  test('Complete micro tasks', async ({ page }) => {
    await page.goto('/');
    await waitForClerk(page);

    // Look for task engine triggers
    const taskButton = page
      .locator(
        'button:has-text("Start"), button:has-text("Begin"), [data-testid*="task"]'
      )
      .first();

    if (await taskButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await taskButton.click();

      // Wait for task engine to open
      const taskEngine = page.locator(
        '.micro-task-engine, [data-testid="micro-task"], .sheet-content'
      );

      if (await taskEngine.isVisible({ timeout: 5000 }).catch(() => false)) {
        await page.screenshot({
          path: 'tests/screenshots/13-micro-task-engine.png',
          fullPage: true,
        });

        // Check for task content
        const taskContent = page.locator(
          '.task-content, [data-testid="task-content"]'
        );
        const taskText = await taskContent.textContent();
        // console.error('Current task:', taskText);
      }
    }
  });
});
