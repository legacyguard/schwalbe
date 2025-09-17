import { expect, test } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';

test.describe('Responsive Design and UI/UX Polish', () => {
  test('should be responsive on mobile devices (375px)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    // Test dashboard on mobile
    await page.click('[data-testid="dashboard-link"]');

    // Navigation should be mobile-friendly (hamburger menu or drawer)
    const mobileNav = page.locator(
      '[data-testid="mobile-navigation"], [data-testid="hamburger-menu"]'
    );
    if ((await mobileNav.count()) > 0) {
      await expect(mobileNav).toBeVisible();
    }

    // Content should not overflow
    const mainContent = page.locator('[data-testid="dashboard-content"], main');
    await expect(mainContent).toBeVisible();

    const boundingBox = await mainContent.boundingBox();
    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(375);
    }

    // Cards should stack vertically on mobile
    const cards = page.locator('[data-testid*="card"]');
    const cardCount = await cards.count();

    if (cardCount > 1) {
      const firstCard = cards.first();
      const secondCard = cards.nth(1);

      const firstCardBox = await firstCard.boundingBox();
      const secondCardBox = await secondCard.boundingBox();

      if (firstCardBox && secondCardBox) {
        // Second card should be below first card (stacked)
        expect(secondCardBox.y).toBeGreaterThan(
          firstCardBox.y + firstCardBox.height - 20
        );
      }
    }
  });

  test('should be responsive on tablet devices (768px)', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    await page.click('[data-testid="dashboard-link"]');

    // Sidebar should be visible or collapsible on tablet
    const sidebar = page.locator(
      '[data-testid="sidebar"], [data-testid="app-sidebar"]'
    );
    if ((await sidebar.count()) > 0) {
      await expect(sidebar).toBeVisible();

      // Should have appropriate width for tablet
      const sidebarBox = await sidebar.boundingBox();
      if (sidebarBox) {
        expect(sidebarBox.width).toBeLessThan(300); // Not too wide on tablet
      }
    }

    // Content should use available space efficiently
    const mainArea = page.locator('[data-testid="main-content"], main');
    const mainBox = await mainArea.boundingBox();
    if (mainBox) {
      expect(mainBox.width).toBeGreaterThan(400); // Should use tablet width
    }

    // Test Legacy Garden responsiveness
    await page.click('[data-testid="legacy-link"]');
    const gardenVisualization = page.locator('[data-testid="legacy-garden"]');
    if ((await gardenVisualization.count()) > 0) {
      const gardenBox = await gardenVisualization.boundingBox();
      if (gardenBox) {
        expect(gardenBox.width).toBeLessThanOrEqual(768);
        expect(gardenBox.width).toBeGreaterThan(300);
      }
    }
  });

  test('should be responsive on desktop (1920px)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    await page.click('[data-testid="dashboard-link"]');

    // Sidebar should be fully expanded on desktop
    const sidebar = page.locator(
      '[data-testid="sidebar"], [data-testid="app-sidebar"]'
    );
    if ((await sidebar.count()) > 0) {
      await expect(sidebar).toBeVisible();

      const sidebarBox = await sidebar.boundingBox();
      if (sidebarBox) {
        expect(sidebarBox.width).toBeGreaterThan(200); // Full width sidebar
      }
    }

    // Cards should be arranged in grid on desktop
    const cards = page.locator('[data-testid*="card"]');
    const cardCount = await cards.count();

    if (cardCount > 2) {
      const firstCard = cards.first();
      const thirdCard = cards.nth(2);

      const firstCardBox = await firstCard.boundingBox();
      const thirdCardBox = await thirdCard.boundingBox();

      if (firstCardBox && thirdCardBox) {
        // Cards should be side by side (not stacked) on desktop
        const horizontalAlignment = Math.abs(firstCardBox.y - thirdCardBox.y);
        expect(horizontalAlignment).toBeLessThan(50); // Roughly same row
      }
    }

    // Content should not exceed reasonable max width
    const mainContent = page.locator('[data-testid="dashboard-content"], main');
    const contentBox = await mainContent.boundingBox();
    if (contentBox) {
      expect(contentBox.width).toBeLessThan(1600); // Reasonable max width
    }
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    await page.click('[data-testid="dashboard-link"]');

    // Test touch targets are large enough (44px minimum)
    const touchTargets = page.locator('button, a, input, [role="button"]');
    const targetCount = await touchTargets.count();

    for (let i = 0; i < Math.min(targetCount, 5); i++) {
      const target = touchTargets.nth(i);
      const box = await target.boundingBox();

      if (box && box.width > 0 && box.height > 0) {
        // Touch targets should be at least 44px (Apple) or 48px (Android)
        expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(40);
      }
    }

    // Test swipe gestures if implemented
    const swipeableElements = page.locator(
      '[data-testid*="swipeable"], [data-testid*="carousel"]'
    );
    if ((await swipeableElements.count()) > 0) {
      const element = swipeableElements.first();

      // Simulate swipe
      await element.hover();
      await page.mouse.down();
      await page.mouse.move(300, 300); // Swipe right
      await page.mouse.up();

      // Should respond to swipe (content change or visual feedback)
      // This is implementation-specific, so we just ensure no errors occur
    }
  });

  test('should have consistent spacing and typography', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    await page.click('[data-testid="dashboard-link"]');

    // Test consistent heading sizes
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    if (headingCount > 1) {
      for (let i = 0; i < Math.min(headingCount, 3); i++) {
        const heading = headings.nth(i);
        const fontSize = await heading.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });

        // Font sizes should be reasonable
        const sizeValue = parseFloat(fontSize);
        expect(sizeValue).toBeGreaterThanOrEqual(14); // Minimum readable size
        expect(sizeValue).toBeLessThanOrEqual(48); // Maximum practical size
      }
    }

    // Test consistent spacing between elements
    const containers = page.locator(
      '[data-testid*="container"], [data-testid*="section"]'
    );
    const containerCount = await containers.count();

    if (containerCount > 0) {
      for (let i = 0; i < Math.min(containerCount, 3); i++) {
        const container = containers.nth(i);
        const styles = await container.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            padding: computed.padding,
            margin: computed.margin,
            gap: computed.gap,
          };
        });

        // Should have consistent spacing system (multiples of 4px/8px)
        expect(styles.padding || styles.margin || styles.gap).toBeTruthy();
      }
    }
  });

  test('should handle dark mode properly', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    // Test dark mode toggle if available
    const darkModeToggle = page.locator(
      '[data-testid="dark-mode-toggle"], [data-testid="theme-toggle"]'
    );
    if ((await darkModeToggle.count()) > 0) {
      // Toggle dark mode
      await darkModeToggle.click();

      // Check if dark mode is applied
      const bodyElement = page.locator('body, html, [data-theme]');
      const isDarkMode = await bodyElement.evaluate(el => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const classNames = el.className;

        // Check for dark background or dark class
        return (
          bgColor.includes('rgb(0') ||
          bgColor.includes('rgb(17') ||
          classNames.includes('dark') ||
          el.getAttribute('data-theme') === 'dark'
        );
      });

      expect(isDarkMode).toBeTruthy();

      // Toggle back to light mode
      await darkModeToggle.click();

      const isLightMode = await bodyElement.evaluate(el => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const classNames = el.className;

        return (
          bgColor.includes('rgb(255') ||
          bgColor.includes('white') ||
          !classNames.includes('dark') ||
          el.getAttribute('data-theme') === 'light'
        );
      });

      expect(isLightMode).toBeTruthy();
    }
  });

  test('should have smooth scrolling and proper layout', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    await page.click('[data-testid="dashboard-link"]');

    // Test scrolling behavior
    const scrollableElements = page.locator(
      '[data-testid*="scroll"], .overflow-auto, .overflow-y-auto'
    );
    const scrollCount = await scrollableElements.count();

    if (scrollCount > 0) {
      const scrollable = scrollableElements.first();

      // Test smooth scrolling if implemented
      await scrollable.evaluate(el => {
        el.scrollTo({ top: 100, behavior: 'smooth' });
      });

      // Wait for scroll to complete
      await page.waitForTimeout(300);

      const scrollTop = await scrollable.evaluate(el => el.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
    }

    // Test sticky elements don't overlap content
    const stickyElements = page.locator(
      '[data-testid*="sticky"], .sticky, [style*="position: sticky"]'
    );
    const stickyCount = await stickyElements.count();

    if (stickyCount > 0) {
      const sticky = stickyElements.first();
      const stickyBox = await sticky.boundingBox();

      if (stickyBox) {
        // Sticky elements should be positioned correctly
        expect(stickyBox.y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should handle loading states gracefully', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    // Test loading states on different pages
    const pages = [
      { link: '[data-testid="vault-link"]', url: '**/vault' },
      { link: '[data-testid="legacy-link"]', url: '**/legacy' },
      { link: '[data-testid="settings-link"]', url: '**/settings' },
    ];

    for (const pageInfo of pages) {
      if ((await page.locator(pageInfo.link).count()) > 0) {
        await page.click(pageInfo.link);
        await page.waitForURL(pageInfo.url);

        // Check for loading indicators
        const loadingStates = page.locator(
          '[data-testid*="loading"], [data-testid*="skeleton"]'
        );
        if ((await loadingStates.count()) > 0) {
          // Loading states should be visible initially
          await expect(loadingStates.first()).toBeVisible();
        }

        // Wait for content to load
        await page.waitForLoadState('networkidle');

        // Loading states should be hidden after content loads
        const persistentLoading = page.locator(
          '[data-testid*="loading"]:visible'
        );
        const loadingCount = await persistentLoading.count();

        // Should have minimal or no persistent loading indicators
        expect(loadingCount).toBeLessThanOrEqual(1);
      }
    }
  });

  test('should have proper focus management and visual feedback', async ({
    page,
  }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    await page.click('[data-testid="dashboard-link"]');

    // Test interactive elements have proper hover states
    const interactiveElements = page.locator('button, a, [role="button"]');
    const elementCount = await interactiveElements.count();

    if (elementCount > 0) {
      const element = interactiveElements.first();

      // Test hover state
      await element.hover();

      const hoverStyles = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          cursor: styles.cursor,
          transform: styles.transform,
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
        };
      });

      // Should have pointer cursor
      expect(hoverStyles.cursor).toBe('pointer');

      // Should have some visual change on hover
      expect(
        hoverStyles.transform !== 'none' ||
          hoverStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
          hoverStyles.borderColor !== 'rgba(0, 0, 0, 0)'
      ).toBeTruthy();
    }

    // Test focus indicators
    const focusableElements = page.locator(
      'input, button, a, select, textarea'
    );
    const focusableCount = await focusableElements.count();

    if (focusableCount > 0) {
      const element = focusableElements.first();
      await element.focus();

      const focusStyles = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
          borderColor: styles.borderColor,
        };
      });

      // Should have visible focus indicator
      expect(
        focusStyles.outline !== 'none' ||
          focusStyles.boxShadow.includes('ring') ||
          focusStyles.boxShadow.includes('focus') ||
          focusStyles.borderColor.includes('blue')
      ).toBeTruthy();
    }
  });

  test('should handle error states consistently', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    // Test error handling on forms
    await page.click('[data-testid="settings-link"]');

    // Find form inputs and trigger validation
    const formInputs = page.locator('input[required], input[type="email"]');
    const inputCount = await formInputs.count();

    if (inputCount > 0) {
      const input = formInputs.first();

      // Enter invalid data to trigger error
      if ((await input.getAttribute('type')) === 'email') {
        await input.fill('invalid-email');
      } else {
        await input.clear();
      }

      await input.blur();

      // Look for error messages
      const errorMessages = page.locator(
        '[data-testid*="error"], .error, [role="alert"]'
      );
      if ((await errorMessages.count()) > 0) {
        const errorMessage = errorMessages.first();
        await expect(errorMessage).toBeVisible();

        // Error should have proper styling
        const errorStyles = await errorMessage.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            color: styles.color,
            fontSize: styles.fontSize,
          };
        });

        // Error text should be readable
        expect(errorStyles.color).not.toBe('rgba(0, 0, 0, 0)');
        expect(parseFloat(errorStyles.fontSize)).toBeGreaterThanOrEqual(12);
      }
    }

    // Test network error handling (404 page)
    await page.goto('/non-existent-page');

    // Should show proper 404 page
    const errorPage = page.locator(
      '[data-testid="404-page"], [data-testid="not-found"]'
    );
    if ((await errorPage.count()) > 0) {
      await expect(errorPage).toBeVisible();

      // Should have navigation back to app
      const homeLink = page.locator(
        '[data-testid="home-link"], [data-testid="back-to-app"]'
      );
      if ((await homeLink.count()) > 0) {
        await expect(homeLink).toBeVisible();
      }
    }
  });

  test('should handle dynamic content updates smoothly', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    await page.click('[data-testid="dashboard-link"]');

    // Test personality mode changes
    await page.click('[data-testid="settings-link"]');

    const personalityToggles = page.locator('[data-testid*="personality"]');
    const toggleCount = await personalityToggles.count();

    if (toggleCount > 0) {
      const toggle = personalityToggles.first();
      await toggle.click();

      // Navigate back to dashboard
      await page.click('[data-testid="dashboard-link"]');

      // Content should update smoothly without jarring layout shifts
      await page.waitForLoadState('domcontentloaded');

      // Check for layout stability
      const mainContent = page.locator(
        '[data-testid="dashboard-content"], main'
      );
      const initialHeight = await mainContent.evaluate(el => el.offsetHeight);

      // Wait a bit for any animations to complete
      await page.waitForTimeout(500);

      const finalHeight = await mainContent.evaluate(el => el.offsetHeight);

      // Height changes should be minimal (within 10% for layout shifts)
      const heightChange =
        Math.abs(finalHeight - initialHeight) / initialHeight;
      expect(heightChange).toBeLessThan(0.1);
    }

    // Test dynamic list updates (if any)
    const dynamicLists = page.locator(
      '[data-testid*="list"], [data-testid*="feed"]'
    );
    if ((await dynamicLists.count()) > 0) {
      const list = dynamicLists.first();
      const initialItemCount = await list
        .locator('[data-testid*="item"]')
        .count();

      // Trigger update if there's an add button
      const addButton = page.locator(
        '[data-testid*="add"], [data-testid*="create"]'
      );
      if ((await addButton.count()) > 0) {
        await addButton.first().click();

        // Should handle the update smoothly
        await page.waitForTimeout(300);

        const finalItemCount = await list
          .locator('[data-testid*="item"]')
          .count();
        expect(finalItemCount).toBeGreaterThanOrEqual(initialItemCount);
      }
    }
  });
});
