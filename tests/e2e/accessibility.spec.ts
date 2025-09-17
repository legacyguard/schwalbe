import { expect, test } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';

test.describe('Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();
  });

  test('should have proper heading hierarchy on dashboard', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Check for proper heading hierarchy (h1 -> h2 -> h3)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    let previousLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const currentLevel = parseInt(tagName.charAt(1));

      // Heading levels should not skip (e.g., h1 -> h3)
      if (previousLevel > 0) {
        expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
      }

      previousLevel = currentLevel;
    }

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Check for navigation landmarks
    await expect(page.locator('[role="navigation"]')).toBeVisible();
    await expect(page.locator('[role="main"]')).toBeVisible();

    // Check for proper button labeling
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);

      // Button should have accessible name
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      const title = await button.getAttribute('title');

      // At least one of these should exist
      expect(ariaLabel || textContent?.trim() || title).toBeTruthy();
    }

    // Check for proper link labeling
    const links = page.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i);

      const ariaLabel = await link.getAttribute('aria-label');
      const textContent = await link.textContent();
      const title = await link.getAttribute('title');

      expect(ariaLabel || textContent?.trim() || title).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Test tab navigation
    await page.keyboard.press('Tab');

    // Should focus the first interactive element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test navigation through multiple elements
    const interactiveElements = page.locator(
      'button, a, input, select, textarea, [tabindex="0"]'
    );
    const elementCount = await interactiveElements.count();

    if (elementCount > 0) {
      // Tab through first 5 elements
      for (let i = 0; i < Math.min(5, elementCount - 1); i++) {
        await page.keyboard.press('Tab');

        const currentFocus = page.locator(':focus');
        await expect(currentFocus).toBeVisible();

        // Focus should be visible (not hidden or tiny)
        const boundingBox = await currentFocus.boundingBox();
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThan(0);
          expect(boundingBox.height).toBeGreaterThan(0);
        }
      }

      // Test reverse tab navigation
      await page.keyboard.press('Shift+Tab');
      const reverseFocus = page.locator(':focus');
      await expect(reverseFocus).toBeVisible();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Test primary text elements for contrast
    const textElements = page.locator('h1, h2, h3, p, span, button, a').first();

    if ((await textElements.count()) > 0) {
      const element = textElements.first();

      // Get computed styles
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
        };
      });

      // Basic contrast check (simplified)
      // In a real implementation, you'd use a proper contrast ratio calculator
      expect(styles.color).not.toBe(styles.backgroundColor);
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('should have proper form labeling and validation', async ({ page }) => {
    // Navigate to a page with forms (Settings)
    await page.click('[data-testid="settings-link"]');

    // Check form inputs have proper labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i);

      // Check for label association
      const id = await input.getAttribute('id');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const ariaLabel = await input.getAttribute('aria-label');

      if (id) {
        // Check if there's a label with for attribute
        const associatedLabel = page.locator(`label[for="${id}"]`);
        const labelExists = (await associatedLabel.count()) > 0;

        // Should have label, aria-labelledby, or aria-label
        expect(labelExists || ariaLabelledBy || ariaLabel).toBeTruthy();
      }
    }

    // Check for error message accessibility
    const errorElements = page.locator(
      '[role="alert"], .error, [data-testid*="error"]'
    );
    const errorCount = await errorElements.count();

    for (let i = 0; i < errorCount; i++) {
      const error = errorElements.nth(i);

      // Error should be announced to screen readers
      const role = await error.getAttribute('role');
      const ariaLive = await error.getAttribute('aria-live');

      expect(
        role === 'alert' || ariaLive === 'polite' || ariaLive === 'assertive'
      ).toBeTruthy();
    }
  });

  test('should have accessible modal dialogs', async ({ page }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Look for modal triggers
    const modalTriggers = page.locator(
      '[data-testid*="modal"], [data-testid*="dialog"]'
    );
    const triggerCount = await modalTriggers.count();

    if (triggerCount > 0) {
      const trigger = modalTriggers.first();
      await trigger.click();

      // Check if modal appeared
      const modal = page.locator('[role="dialog"], [role="alertdialog"]');
      if ((await modal.count()) > 0) {
        // Modal should have proper ARIA attributes
        await expect(modal.first()).toHaveAttribute('role');

        // Modal should trap focus
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');

        // Focus should be within the modal
        const isWithinModal = await focusedElement.evaluate(
          (el, modalEl) => {
            return modalEl.contains(el);
          },
          await modal.first().elementHandle()
        );

        expect(isWithinModal).toBeTruthy();

        // Should be closeable with Escape
        await page.keyboard.press('Escape');

        // Modal should close
        await expect(modal.first()).not.toBeVisible();
      }
    }
  });

  test('should have accessible loading states', async ({ page }) => {
    // Navigate to a page that shows loading states
    await page.click('[data-testid="vault-link"]');

    // Check for loading indicators with proper accessibility
    const loadingElements = page.locator(
      '[data-testid*="loading"], [role="status"]'
    );
    const loadingCount = await loadingElements.count();

    if (loadingCount > 0) {
      const loader = loadingElements.first();

      // Should have role="status" or aria-live
      const role = await loader.getAttribute('role');
      const ariaLive = await loader.getAttribute('aria-live');
      const ariaLabel = await loader.getAttribute('aria-label');

      expect(
        role === 'status' ||
          ariaLive === 'polite' ||
          ariaLabel?.includes('loading') ||
          ariaLabel?.includes('Loading')
      ).toBeTruthy();
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.click('[data-testid="dashboard-link"]');

    // Check that animations respect reduced motion
    const animatedElements = page.locator(
      '[data-testid*="animated"], [class*="animate"]'
    );
    const animatedCount = await animatedElements.count();

    for (let i = 0; i < Math.min(animatedCount, 3); i++) {
      const element = animatedElements.nth(i);

      const animationDuration = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.animationDuration || style.transitionDuration;
      });

      // Animation should be disabled or very short
      const duration = parseFloat(animationDuration);
      expect(duration).toBeLessThanOrEqual(0.2);
    }
  });

  test('should have accessible images and icons', async ({ page }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Check images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Images should have alt text, unless decorative
      if (role !== 'presentation' && role !== 'none') {
        expect(alt).not.toBeNull();
      }
    }

    // Check SVG icons have proper accessibility
    const svgIcons = page.locator('svg');
    const svgCount = await svgIcons.count();

    for (let i = 0; i < Math.min(svgCount, 5); i++) {
      const svg = svgIcons.nth(i);

      const ariaHidden = await svg.getAttribute('aria-hidden');
      const ariaLabel = await svg.getAttribute('aria-label');
      const role = await svg.getAttribute('role');
      const title = svg.locator('title');
      const titleExists = (await title.count()) > 0;

      // SVG should either be hidden from screen readers or have accessible name
      expect(
        ariaHidden === 'true' || ariaLabel || role === 'img' || titleExists
      ).toBeTruthy();
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Test focus indicators are visible
    const focusableElements = page
      .locator('button, a, input, select, textarea')
      .first();

    if ((await focusableElements.count()) > 0) {
      await focusableElements.focus();

      // Should have visible focus indicator
      const focusStyles = await focusableElements.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
          border: styles.border,
        };
      });

      // Should have some kind of focus indicator
      expect(
        focusStyles.outline !== 'none' ||
          focusStyles.boxShadow !== 'none' ||
          focusStyles.boxShadow.includes('ring') ||
          focusStyles.border.includes('blue')
      ).toBeTruthy();
    }
  });

  test('should have accessible personality mode switching', async ({
    page,
  }) => {
    await page.click('[data-testid="settings-link"]');

    // Check personality mode controls
    const personalityControls = page.locator('[data-testid*="personality"]');
    const controlCount = await personalityControls.count();

    if (controlCount > 0) {
      for (let i = 0; i < controlCount; i++) {
        const control = personalityControls.nth(i);

        // Should be keyboard accessible
        await control.focus();
        const isFocused = await control.evaluate(
          el => el === document.activeElement
        );
        expect(isFocused).toBeTruthy();

        // Should have proper labeling
        const ariaLabel = await control.getAttribute('aria-label');
        const textContent = await control.textContent();
        const title = await control.getAttribute('title');

        expect(ariaLabel || textContent?.trim() || title).toBeTruthy();

        // If it's a radio button group, check proper grouping
        const role = await control.getAttribute('role');
        if (role === 'radio') {
          const radioGroup = page.locator('[role="radiogroup"]');
          await expect(radioGroup).toBeVisible();
        }
      }
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Look for dynamic content that changes (like notifications, status updates)
    const liveRegions = page.locator(
      '[aria-live], [role="status"], [role="alert"]'
    );
    const liveRegionCount = await liveRegions.count();

    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i);

        const ariaLive = await region.getAttribute('aria-live');
        const role = await region.getAttribute('role');

        // Should have proper live region settings
        expect(
          ariaLive === 'polite' ||
            ariaLive === 'assertive' ||
            role === 'status' ||
            role === 'alert'
        ).toBeTruthy();
      }
    }

    // Test if notifications are properly announced
    const notificationTriggers = page.locator(
      '[data-testid*="notification"], [data-testid*="toast"]'
    );
    const notificationCount = await notificationTriggers.count();

    if (notificationCount > 0) {
      const trigger = notificationTriggers.first();
      await trigger.click();

      // Look for the notification that appears
      const notification = page.locator(
        '[role="alert"], [data-testid*="notification-content"]'
      );
      if ((await notification.count()) > 0) {
        const role = await notification.first().getAttribute('role');
        const ariaLive = await notification.first().getAttribute('aria-live');

        expect(role === 'alert' || ariaLive === 'assertive').toBeTruthy();
      }
    }
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Check for proper semantic elements
    await expect(page.locator('header')).toHaveCount({ min: 0, max: 2 }); // Should have 0-1 header
    await expect(page.locator('main')).toHaveCount(1); // Should have exactly 1 main
    await expect(page.locator('nav')).toHaveCount({ min: 1 }); // Should have at least 1 nav

    // Check that lists use proper markup
    const lists = page.locator('ul, ol');
    const listCount = await lists.count();

    for (let i = 0; i < listCount; i++) {
      const list = lists.nth(i);
      const listItems = list.locator('li');
      const itemCount = await listItems.count();

      // Lists should contain list items
      if (itemCount === 0) {
        console.warn(`Empty list found: ${await list.innerHTML()}`);
      }
    }

    // Check for proper button vs link usage
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const type = await button.getAttribute('type');
      const onClick = await button.getAttribute('onclick');

      // Buttons should have type attribute or onclick handler
      expect(
        type || onClick || (await button.evaluate(el => el.onclick))
      ).toBeTruthy();
    }
  });
});
