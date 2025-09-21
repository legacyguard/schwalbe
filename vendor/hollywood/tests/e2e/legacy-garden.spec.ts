import { expect, test } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';

test.describe('Legacy Garden Visualization System', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();
  });

  test('should display legacy garden visualization on dashboard', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Check if garden visualization is present
    await expect(page.locator('[data-testid="legacy-garden"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="garden-orchestrator"]')
    ).toBeVisible();

    // Check for core garden elements
    await expect(
      page.locator('[data-testid="adaptive-legacy-tree"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="garden-progress"]')).toBeVisible();
  });

  test('should show personality-adaptive garden visualization', async ({
    page,
  }) => {
    const personalityModes = ['empathetic', 'pragmatic', 'adaptive'];

    for (const mode of personalityModes) {
      // Set personality mode
      await page.click('[data-testid="settings-link"]');
      await page.click(`[data-testid="personality-${mode}"]`);

      // Navigate to dashboard
      await page.click('[data-testid="dashboard-link"]');
      await page.waitForSelector('[data-testid="legacy-garden"]');

      // Check for personality-specific garden styling
      const gardenElement = page.locator('[data-testid="legacy-garden"]');
      await expect(gardenElement).toHaveAttribute(
        'data-personality-mode',
        mode
      );

      // Verify personality-specific visual elements
      if (mode === 'empathetic') {
        // Check for warm, organic elements
        await expect(page.locator('[data-testid*="organic-"]')).toBeVisible();
        await expect(
          page.locator('.text-pink-600, .text-purple-600')
        ).toBeVisible();
      } else if (mode === 'pragmatic') {
        // Check for clean, efficient elements
        await expect(page.locator('[data-testid*="efficient-"]')).toBeVisible();
        await expect(page.locator('.text-gray-600')).toBeVisible();
      } else if (mode === 'adaptive') {
        // Check for balanced, modern elements
        await expect(page.locator('[data-testid*="balanced-"]')).toBeVisible();
        await expect(
          page.locator('.text-blue-600, .text-green-600')
        ).toBeVisible();
      }
    }
  });

  test('should display adaptive legacy tree with branches', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');
    await page.waitForSelector('[data-testid="adaptive-legacy-tree"]');

    const treeElement = page.locator('[data-testid="adaptive-legacy-tree"]');
    await expect(treeElement).toBeVisible();

    // Check for tree components
    await expect(page.locator('[data-testid="tree-trunk"]')).toBeVisible();
    await expect(page.locator('[data-testid*="tree-branch"]')).toHaveCount({
      min: 1,
    });
    await expect(page.locator('[data-testid*="tree-leaf"]')).toHaveCount({
      min: 1,
    });

    // Check for interactive elements
    const branches = page.locator('[data-testid*="tree-branch"]');
    const branchCount = await branches.count();

    if (branchCount > 0) {
      await branches.first().hover();
      // Should show tooltip or highlight on hover
      await expect(
        page.locator('[data-testid="branch-tooltip"]')
      ).toBeVisible();
    }
  });

  test('should show garden progress and growth indicators', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');
    await page.waitForSelector('[data-testid="garden-progress"]');

    // Check for progress indicators
    await expect(page.locator('[data-testid="garden-progress"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="progress-percentage"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="growth-metrics"]')).toBeVisible();

    // Check for pillar progress indicators
    const pillars = page.locator('[data-testid*="pillar-"]');
    const pillarCount = await pillars.count();
    expect(pillarCount).toBeGreaterThan(0);

    // Check for milestone indicators
    await expect(
      page.locator('[data-testid="milestone-indicators"]')
    ).toBeVisible();
  });

  test('should display garden orchestrator with component management', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');
    await page.waitForSelector('[data-testid="garden-orchestrator"]');

    const orchestrator = page.locator('[data-testid="garden-orchestrator"]');
    await expect(orchestrator).toBeVisible();

    // Check for orchestrator controls
    await expect(
      page.locator('[data-testid="garden-view-controls"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="garden-zoom-controls"]')
    ).toBeVisible();

    // Test view switching
    const viewButtons = page.locator('[data-testid*="view-"]');
    const viewCount = await viewButtons.count();

    if (viewCount > 0) {
      await viewButtons.first().click();
      // Garden should update its display mode
      await expect(
        page.locator('[data-testid="garden-view-changed"]')
      ).toBeVisible();
    }
  });

  test('should animate garden elements with personality-aware timing', async ({
    page,
  }) => {
    const personalityModes = ['empathetic', 'pragmatic', 'adaptive'];

    for (const mode of personalityModes) {
      // Set personality mode
      await page.click('[data-testid="settings-link"]');
      await page.click(`[data-testid="personality-${mode}"]`);

      // Navigate to dashboard
      await page.click('[data-testid="dashboard-link"]');
      await page.waitForSelector('[data-testid="legacy-garden"]');

      // Check for animated elements
      const animatedElements = page.locator(
        '[data-testid*="animated-garden-"]'
      );
      const count = await animatedElements.count();

      if (count > 0) {
        const element = animatedElements.first();
        const animationDuration = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.animationDuration || style.transitionDuration;
        });

        // Verify personality-specific animation timing
        if (mode === 'empathetic') {
          // Slower, organic animations (0.8s+)
          expect(parseFloat(animationDuration)).toBeGreaterThanOrEqual(0.8);
        } else if (mode === 'pragmatic') {
          // Faster, efficient animations (0.4s or less)
          expect(parseFloat(animationDuration)).toBeLessThanOrEqual(0.4);
        } else if (mode === 'adaptive') {
          // Balanced animations (0.5s-0.7s)
          const duration = parseFloat(animationDuration);
          expect(duration).toBeGreaterThanOrEqual(0.5);
          expect(duration).toBeLessThanOrEqual(0.7);
        }
      }
    }
  });

  test('should show enhanced garden section with quick actions', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');
    await page.waitForSelector('[data-testid="enhanced-garden-section"]');

    const gardenSection = page.locator(
      '[data-testid="enhanced-garden-section"]'
    );
    await expect(gardenSection).toBeVisible();

    // Check for quick actions
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="add-document-quick"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="view-progress-quick"]')
    ).toBeVisible();

    // Test quick action functionality
    await page.click('[data-testid="add-document-quick"]');
    // Should open document upload modal or navigate to upload page
    await expect(
      page.locator(
        '[data-testid="document-upload-modal"], [data-testid="upload-page"]'
      )
    ).toBeVisible();
  });

  test('should display milestone celebrations in garden context', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Look for milestone celebration trigger
    const celebrationTrigger = page.locator(
      '[data-testid="milestone-celebration-trigger"]'
    );
    if (await celebrationTrigger.isVisible()) {
      await celebrationTrigger.click();

      // Check for garden-specific milestone celebration
      await expect(
        page.locator('[data-testid="garden-milestone-celebration"]')
      ).toBeVisible();

      // Should show garden growth animation
      await expect(
        page.locator('[data-testid="garden-growth-animation"]')
      ).toBeVisible();

      // Should show progress update in garden context
      await expect(
        page.locator('[data-testid="garden-progress-update"]')
      ).toBeVisible();
    }
  });

  test('should handle garden zoom and interaction controls', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');
    await page.waitForSelector('[data-testid="garden-zoom-controls"]');

    // Test zoom in
    await page.click('[data-testid="zoom-in-button"]');

    // Garden should scale up
    const gardenElement = page.locator('[data-testid="legacy-garden"]');
    const scaleAfterZoomIn = await gardenElement.evaluate(el => {
      const transform = window.getComputedStyle(el).transform;
      const matrix = transform.match(/matrix\\((.+)\\)/);
      return matrix ? parseFloat(matrix[1].split(', ')[0]) : 1;
    });
    expect(scaleAfterZoomIn).toBeGreaterThan(1);

    // Test zoom out
    await page.click('[data-testid="zoom-out-button"]');

    // Garden should scale down
    const scaleAfterZoomOut = await gardenElement.evaluate(el => {
      const transform = window.getComputedStyle(el).transform;
      const matrix = transform.match(/matrix\\((.+)\\)/);
      return matrix ? parseFloat(matrix[1].split(', ')[0]) : 1;
    });
    expect(scaleAfterZoomOut).toBeLessThan(scaleAfterZoomIn);

    // Test reset zoom
    await page.click('[data-testid="zoom-reset-button"]');
    const scaleAfterReset = await gardenElement.evaluate(el => {
      const transform = window.getComputedStyle(el).transform;
      return transform === 'none'
        ? 1
        : parseFloat(
            transform.match(/matrix\\((.+)\\)/)?.[1]?.split(', ')[0] || '1'
          );
    });
    expect(scaleAfterReset).toBe(1);
  });

  test('should show garden elements with personality-based recommendations', async ({
    page,
  }) => {
    const personalityModes = ['empathetic', 'pragmatic', 'adaptive'];

    for (const mode of personalityModes) {
      // Set personality mode
      await page.click('[data-testid="settings-link"]');
      await page.click(`[data-testid="personality-${mode}"]`);

      // Navigate to dashboard
      await page.click('[data-testid="dashboard-link"]');

      // Check for personality-specific recommendations
      await expect(
        page.locator('[data-testid="personality-recommendations"]')
      ).toBeVisible();

      const recommendationText = await page
        .locator('[data-testid="personality-recommendations"]')
        .textContent();

      // Verify personality-specific language
      if (mode === 'empathetic') {
        expect(recommendationText).toMatch(
          /care|love|support|nurture|cherish/i
        );
      } else if (mode === 'pragmatic') {
        expect(recommendationText).toMatch(
          /organize|efficient|complete|focus|direct/i
        );
      } else if (mode === 'adaptive') {
        expect(recommendationText).toMatch(
          /balance|flexible|smart|evolve|optimize/i
        );
      }
    }
  });

  test('should display garden system integration with existing components', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Verify garden system is properly integrated with dashboard
    await expect(
      page.locator('[data-testid="dashboard-garden-integration"]')
    ).toBeVisible();

    // Check integration with existing pillar system
    await expect(
      page.locator('[data-testid="pillar-garden-integration"]')
    ).toBeVisible();

    // Check integration with progress tracking
    await expect(
      page.locator('[data-testid="progress-garden-integration"]')
    ).toBeVisible();

    // Verify garden doesn't break existing functionality
    await expect(
      page.locator('[data-testid="existing-dashboard-features"]')
    ).toBeVisible();

    // Test navigation still works with garden present
    await page.click('[data-testid="vault-link"]');
    await page.waitForURL('**/vault');

    // Return to dashboard and verify garden is still functional
    await page.click('[data-testid="dashboard-link"]');
    await expect(page.locator('[data-testid="legacy-garden"]')).toBeVisible();
  });
});
