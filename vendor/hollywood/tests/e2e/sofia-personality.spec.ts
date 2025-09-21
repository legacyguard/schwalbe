import { expect, test } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';

test.describe('Sofia Personality System', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();
  });

  test('should display personality mode selection in settings', async ({
    page,
  }) => {
    // Navigate to settings
    await page.click('[data-testid="settings-link"]');
    await page.waitForURL('**/settings');

    // Check if personality settings are visible
    await expect(page.locator('text=Sofia Personality')).toBeVisible();
    await expect(
      page.locator('[data-testid="personality-empathetic"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="personality-pragmatic"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="personality-adaptive"]')
    ).toBeVisible();
  });

  test('should switch between personality modes', async ({ page }) => {
    // Navigate to settings
    await page.click('[data-testid="settings-link"]');
    await page.waitForURL('**/settings');

    // Switch to empathetic mode
    await page.click('[data-testid="personality-empathetic"]');

    // Navigate to dashboard to see personality changes
    await page.click('[data-testid="dashboard-link"]');

    // Check for empathetic personality indicators
    await expect(
      page.locator('[data-personality-mode="empathetic"]')
    ).toBeVisible();

    // Check for empathetic-specific colors/styling
    const dashboardElement = page.locator('[data-testid="dashboard-content"]');
    await expect(dashboardElement).toHaveClass(/empathetic/);
  });

  test('should adapt UI colors and styling based on personality mode', async ({
    page,
  }) => {
    const personalityModes = ['empathetic', 'pragmatic', 'adaptive'];

    for (const mode of personalityModes) {
      // Navigate to settings and change personality
      await page.click('[data-testid="settings-link"]');
      await page.click(`[data-testid="personality-${mode}"]`);

      // Navigate to dashboard
      await page.click('[data-testid="dashboard-link"]');

      // Check for mode-specific styling
      const dashboardContent = page.locator(
        '[data-testid="dashboard-content"]'
      );
      await expect(dashboardContent).toHaveAttribute(
        'data-personality-mode',
        mode
      );

      // Check for mode-specific color themes
      const computedStyle = await dashboardContent.evaluate(el => {
        return window.getComputedStyle(el);
      });

      // Verify personality-specific colors are applied
      if (mode === 'empathetic') {
        // Check for pink/purple color scheme
        expect(
          computedStyle.getPropertyValue('--personality-primary')
        ).toContain('pink');
      } else if (mode === 'pragmatic') {
        // Check for gray color scheme
        expect(
          computedStyle.getPropertyValue('--personality-primary')
        ).toContain('gray');
      } else if (mode === 'adaptive') {
        // Check for blue/green color scheme
        expect(
          computedStyle.getPropertyValue('--personality-primary')
        ).toContain('blue');
      }
    }
  });

  test('should adapt text communication style based on personality mode', async ({
    page,
  }) => {
    // Test empathetic mode communication
    await page.click('[data-testid="settings-link"]');
    await page.click('[data-testid="personality-empathetic"]');
    await page.click('[data-testid="dashboard-link"]');

    // Check for empathetic language patterns
    const empathethicText = page.locator('[data-testid="welcome-message"]');
    await expect(empathethicText).toContainText(/warm|care|love|support/i);

    // Test pragmatic mode communication
    await page.click('[data-testid="settings-link"]');
    await page.click('[data-testid="personality-pragmatic"]');
    await page.click('[data-testid="dashboard-link"]');

    // Check for pragmatic language patterns
    const pragmaticText = page.locator('[data-testid="welcome-message"]');
    await expect(pragmaticText).toContainText(/efficient|direct|clear|focus/i);

    // Test adaptive mode communication
    await page.click('[data-testid="settings-link"]');
    await page.click('[data-testid="personality-adaptive"]');
    await page.click('[data-testid="dashboard-link"]');

    // Check for adaptive language patterns
    const adaptiveText = page.locator('[data-testid="welcome-message"]');
    await expect(adaptiveText).toContainText(
      /balanced|flexible|smart|evolving/i
    );
  });

  test('should persist personality mode selection across sessions', async ({
    page,
    context,
  }) => {
    // Set empathetic mode
    await page.click('[data-testid="settings-link"]');
    await page.click('[data-testid="personality-empathetic"]');

    // Close and reopen the page to simulate new session
    await page.close();
    const newPage = await context.newPage();
    const authHelper = new AuthHelper(newPage);
    await authHelper.signIn();

    // Navigate to dashboard and check if empathetic mode is still active
    await newPage.click('[data-testid="dashboard-link"]');
    await expect(
      newPage.locator('[data-personality-mode="empathetic"]')
    ).toBeVisible();
  });

  test('should show personality-aware animations', async ({ page }) => {
    const personalityModes = ['empathetic', 'pragmatic', 'adaptive'];

    for (const mode of personalityModes) {
      // Set personality mode
      await page.click('[data-testid="settings-link"]');
      await page.click(`[data-testid="personality-${mode}"]`);

      // Navigate to dashboard
      await page.click('[data-testid="dashboard-link"]');

      // Check for personality-specific animation classes
      const animatedElements = page.locator('[data-testid*="animated-"]');
      const count = await animatedElements.count();

      for (let i = 0; i < count; i++) {
        const element = animatedElements.nth(i);
        const classes = await element.getAttribute('class');

        // Check for personality-specific animation timing
        if (mode === 'empathetic') {
          expect(classes).toMatch(/duration-800|slow|gentle/);
        } else if (mode === 'pragmatic') {
          expect(classes).toMatch(/duration-200|fast|efficient/);
        } else if (mode === 'adaptive') {
          expect(classes).toMatch(/duration-300|medium|balanced/);
        }
      }
    }
  });

  test('should show personality mode in profile/about section', async ({
    page,
  }) => {
    // Navigate to profile or about section
    await page.click('[data-testid="profile-link"]');

    // Check if current personality mode is displayed
    const personalityDisplay = page.locator(
      '[data-testid="current-personality"]'
    );
    await expect(personalityDisplay).toBeVisible();

    // Verify it shows one of the valid modes
    const personalityText = await personalityDisplay.textContent();
    expect(['Empathetic', 'Pragmatic', 'Adaptive']).toContain(
      personalityText?.trim()
    );
  });

  test('should adapt legacy garden visualization to personality mode', async ({
    page,
  }) => {
    const personalityModes = ['empathetic', 'pragmatic', 'adaptive'];

    for (const mode of personalityModes) {
      // Set personality mode
      await page.click('[data-testid="settings-link"]');
      await page.click(`[data-testid="personality-${mode}"]`);

      // Navigate to legacy garden
      await page.click('[data-testid="legacy-link"]');

      // Wait for garden visualization to load
      await page.waitForSelector('[data-testid="legacy-garden"]');

      // Check for personality-specific garden styling
      const gardenElement = page.locator('[data-testid="legacy-garden"]');
      await expect(gardenElement).toHaveAttribute(
        'data-personality-mode',
        mode
      );

      // Check for personality-specific tree/plant elements
      const treeElements = page.locator('[data-testid*="tree-"]');
      const treeCount = await treeElements.count();

      if (treeCount > 0) {
        const firstTree = treeElements.first();
        const treeClasses = await firstTree.getAttribute('class');

        // Verify personality-specific styling is applied
        expect(treeClasses).toContain(mode);
      }
    }
  });

  test('should show personality-aware milestone celebrations', async ({
    page,
  }) => {
    // Navigate to dashboard where milestones are celebrated
    await page.click('[data-testid="dashboard-link"]');

    // Trigger a milestone celebration (if available)
    const milestoneButton = page.locator('[data-testid="trigger-milestone"]');
    if (await milestoneButton.isVisible()) {
      await milestoneButton.click();

      // Check for personality-aware celebration animation
      const celebrationElement = page.locator(
        '[data-testid="milestone-celebration"]'
      );
      await expect(celebrationElement).toBeVisible();

      // Get current personality mode from data attribute
      const personalityMode = await page.getAttribute(
        '[data-testid="dashboard-content"]',
        'data-personality-mode'
      );

      // Check for personality-specific celebration styling
      if (personalityMode) {
        await expect(celebrationElement).toHaveAttribute(
          'data-celebration-style',
          personalityMode
        );
      }
    }
  });
});
