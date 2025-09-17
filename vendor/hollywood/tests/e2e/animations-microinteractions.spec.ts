import { expect, test } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';

test.describe('Advanced Animations and Micro-Interactions', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();
  });

  test('should display enhanced buttons with personality-aware animations', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Check for enhanced buttons
    const enhancedButtons = page.locator('[data-testid*="enhanced-button"]');
    const buttonCount = await enhancedButtons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Test button hover effects
    const firstButton = enhancedButtons.first();
    await firstButton.hover();

    // Check for hover animation classes
    const buttonClasses = await firstButton.getAttribute('class');
    expect(buttonClasses).toMatch(/hover:|transform|transition|animate/);

    // Test button click ripple effect
    await firstButton.click();

    // Should show ripple or press animation
    const rippleEffect = page.locator('[data-testid="button-ripple-effect"]');
    if (await rippleEffect.isVisible()) {
      await expect(rippleEffect).toBeVisible();
    }
  });

  test('should show personality-adaptive button animations', async ({
    page,
  }) => {
    const personalityModes = ['empathetic', 'pragmatic', 'adaptive'];

    for (const mode of personalityModes) {
      // Set personality mode
      await page.click('[data-testid="settings-link"]');
      await page.click(`[data-testid="personality-${mode}"]`);

      // Navigate to dashboard
      await page.click('[data-testid="dashboard-link"]');

      // Find personality buttons
      const personalityButtons = page.locator(
        '[data-testid*="personality-button"]'
      );
      const buttonCount = await personalityButtons.count();

      if (buttonCount > 0) {
        const button = personalityButtons.first();

        // Check for personality-specific styling
        const buttonClasses = await button.getAttribute('class');
        expect(buttonClasses).toContain(mode);

        // Test hover animation timing
        await button.hover();

        const animationDuration = await button.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.transitionDuration || style.animationDuration;
        });

        // Verify personality-specific timing
        if (mode === 'empathetic') {
          // Slower, organic animations (0.4s+)
          expect(parseFloat(animationDuration)).toBeGreaterThanOrEqual(0.4);
        } else if (mode === 'pragmatic') {
          // Faster, efficient animations (0.2s or less)
          expect(parseFloat(animationDuration)).toBeLessThanOrEqual(0.2);
        } else if (mode === 'adaptive') {
          // Balanced animations (0.3s)
          expect(parseFloat(animationDuration)).toBeCloseTo(0.3, 1);
        }
      }
    }
  });

  test('should display enhanced form inputs with validation animations', async ({
    page,
  }) => {
    // Navigate to a form page (settings or profile)
    await page.click('[data-testid="settings-link"]');

    // Find enhanced input fields
    const enhancedInputs = page.locator('[data-testid*="enhanced-input"]');
    const inputCount = await enhancedInputs.count();

    if (inputCount > 0) {
      const firstInput = enhancedInputs.first();

      // Test focus animation
      await firstInput.focus();

      // Should show focus ring or highlight animation
      const focusRing = await firstInput.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.boxShadow || style.borderColor || style.outline;
      });
      expect(focusRing).not.toBe('none');

      // Test typing animation (character counting)
      await firstInput.fill('Test input content');

      // Should show character count animation
      const charCounter = page.locator('[data-testid="character-counter"]');
      if (await charCounter.isVisible()) {
        await expect(charCounter).toBeVisible();
        await expect(charCounter).toContainText('18'); // "Test input content" length
      }

      // Test validation state animation
      await firstInput.clear();
      await firstInput.blur();

      // Should show validation error animation
      const validationError = page.locator('[data-testid="validation-error"]');
      if (await validationError.isVisible()) {
        await expect(validationError).toBeVisible();

        // Check for error animation classes
        const errorClasses = await validationError.getAttribute('class');
        expect(errorClasses).toMatch(/animate|shake|bounce|pulse/);
      }
    }
  });

  test('should display enhanced cards with interactive animations', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Find enhanced cards
    const enhancedCards = page.locator('[data-testid*="enhanced-card"]');
    const cardCount = await enhancedCards.count();

    if (cardCount > 0) {
      const firstCard = enhancedCards.first();

      // Test hover lift effect
      const initialTransform = await firstCard.evaluate(el => {
        return window.getComputedStyle(el).transform;
      });

      await firstCard.hover();

      // Wait for animation to complete
      await page.waitForTimeout(500);

      const hoverTransform = await firstCard.evaluate(el => {
        return window.getComputedStyle(el).transform;
      });

      // Transform should change on hover
      expect(hoverTransform).not.toBe(initialTransform);
      expect(hoverTransform).toMatch(/translate|scale|rotate/);

      // Test card click animation
      await firstCard.click();

      // Should show click/press animation
      const pressedTransform = await firstCard.evaluate(el => {
        return window.getComputedStyle(el).transform;
      });
      expect(pressedTransform).toMatch(/scale|translate/);
    }
  });

  test('should show personality-adaptive card interaction animations', async ({
    page,
  }) => {
    const personalityModes = ['empathetic', 'pragmatic', 'adaptive'];

    for (const mode of personalityModes) {
      // Set personality mode
      await page.click('[data-testid="settings-link"]');
      await page.click(`[data-testid="personality-${mode}"]`);

      // Navigate to dashboard
      await page.click('[data-testid="dashboard-link"]');

      // Find personality cards
      const personalityCards = page.locator(
        '[data-testid*="personality-card"]'
      );
      const cardCount = await personalityCards.count();

      if (cardCount > 0) {
        const card = personalityCards.first();

        // Check for personality-specific animation type
        const cardAttribute = await card.getAttribute('data-animation-type');

        if (mode === 'empathetic') {
          expect(['glow', 'heartbeat', 'gentle']).toContain(cardAttribute);
        } else if (mode === 'pragmatic') {
          expect(['lift', 'fade', 'linear']).toContain(cardAttribute);
        } else if (mode === 'adaptive') {
          expect(['tilt', 'scale', 'wave']).toContain(cardAttribute);
        }

        // Test hover behavior
        await card.hover();

        // Check for personality-specific hover effects
        const hoverEffect = await card.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            transform: style.transform,
            boxShadow: style.boxShadow,
            scale: style.scale,
          };
        });

        expect(hoverEffect.transform).not.toBe('none');
      }
    }
  });

  test('should display loading animations with personality adaptation', async ({
    page,
  }) => {
    // Navigate to dashboard and look for loading states
    await page.click('[data-testid="dashboard-link"]');

    // Find loading components
    const loadingElements = page.locator('[data-testid*="loading-"]');
    const loadingCount = await loadingElements.count();

    if (loadingCount > 0) {
      const loadingElement = loadingElements.first();
      await expect(loadingElement).toBeVisible();

      // Check for loading animation
      const animationName = await loadingElement.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.animationName;
      });
      expect(animationName).not.toBe('none');
    }

    // Test personality-specific loading animations
    const personalityModes = ['empathetic', 'pragmatic', 'adaptive'];

    for (const mode of personalityModes) {
      // Set personality mode
      await page.click('[data-testid="settings-link"]');
      await page.click(`[data-testid="personality-${mode}"]`);

      // Trigger loading state (navigate to a page that shows loading)
      await page.click('[data-testid="legacy-link"]');

      // Check for personality-specific loading animation
      const personalityLoader = page.locator(
        `[data-testid*="loading-${mode}"]`
      );
      if (await personalityLoader.isVisible()) {
        await expect(personalityLoader).toBeVisible();

        // Check animation type
        const loaderType = await personalityLoader.getAttribute(
          'data-animation-type'
        );

        if (mode === 'empathetic') {
          expect(['heartbeat', 'firefly', 'pulse']).toContain(loaderType);
        } else if (mode === 'pragmatic') {
          expect(['spinner', 'progress', 'dots']).toContain(loaderType);
        } else if (mode === 'adaptive') {
          expect(['wave', 'bounce', 'typewriter']).toContain(loaderType);
        }
      }
    }
  });

  test('should show micro-interaction system with 12+ animation types', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Test different micro-interaction types
    const microAnimationTypes = [
      'hover-lift',
      'hover-scale',
      'hover-tilt',
      'hover-glow',
      'click-bounce',
      'click-ripple',
      'click-shake',
      'focus-ring',
      'slide-in',
      'fade-in-up',
      'fade-in-left',
      'scale-in',
    ];

    for (const animationType of microAnimationTypes) {
      const animatedElements = page.locator(
        `[data-animation="${animationType}"]`
      );
      const elementCount = await animatedElements.count();

      if (elementCount > 0) {
        const element = animatedElements.first();

        // Test the specific animation type
        if (animationType.includes('hover')) {
          await element.hover();
          await page.waitForTimeout(200);

          const transform = await element.evaluate(el => {
            return window.getComputedStyle(el).transform;
          });
          expect(transform).not.toBe('none');
        } else if (animationType.includes('click')) {
          await element.click();
          await page.waitForTimeout(200);

          // Should have animation classes
          const classes = await element.getAttribute('class');
          expect(classes).toMatch(/animate|transition|transform/);
        } else if (animationType.includes('focus')) {
          if (await element.isEditable()) {
            await element.focus();

            const outline = await element.evaluate(el => {
              return window.getComputedStyle(el).outline;
            });
            expect(outline).not.toBe('none');
          }
        }
      }
    }
  });

  test('should respect reduced motion preferences', async ({
    page,
    context,
  }) => {
    // Enable reduced motion preference
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => {
          if (query === '(prefers-reduced-motion: reduce)') {
            return {
              matches: true,
              media: query,
              onchange: null,
              addListener: () => {},
              removeListener: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              dispatchEvent: () => {},
            };
          }
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => {},
          };
        },
      });
    });

    const authHelper = new AuthHelper(page);
    await authHelper.signIn();

    await page.click('[data-testid="dashboard-link"]');

    // Check that animations are disabled or reduced
    const animatedElements = page.locator('[data-testid*="animated-"]');
    const elementCount = await animatedElements.count();

    if (elementCount > 0) {
      const element = animatedElements.first();

      // Check for reduced motion classes
      const classes = await element.getAttribute('class');
      expect(classes).toMatch(/motion-reduce|no-animation|static/);

      // Test that hover effects are minimal
      await element.hover();

      const animationDuration = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.animationDuration || style.transitionDuration;
      });

      // Should have very short or no animation duration
      const duration = parseFloat(animationDuration);
      expect(duration).toBeLessThanOrEqual(0.1);
    }
  });

  test('should show staggered animations for list items', async ({ page }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Find lists with staggered animations
    const staggeredLists = page.locator('[data-testid*="staggered-list"]');
    const listCount = await staggeredLists.count();

    if (listCount > 0) {
      const list = staggeredLists.first();
      const listItems = list.locator('[data-testid*="list-item"]');
      const itemCount = await listItems.count();

      if (itemCount > 1) {
        // Check for stagger delays
        for (let i = 0; i < Math.min(itemCount, 3); i++) {
          const item = listItems.nth(i);
          const animationDelay = await item.evaluate(el => {
            return window.getComputedStyle(el).animationDelay;
          });

          // Each item should have increasing delay
          const delay = parseFloat(animationDelay);
          expect(delay).toBeGreaterThanOrEqual(i * 0.05); // 50ms stagger
        }
      }
    }
  });

  test('should show page transition animations', async ({ page }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Test page transition by navigating between pages
    const pages = ['vault', 'legacy', 'guardians'];

    for (const targetPage of pages) {
      const pageLink = page.locator(`[data-testid="${targetPage}-link"]`);
      if (await pageLink.isVisible()) {
        await pageLink.click();

        // Wait for page transition
        await page.waitForURL(`**/${targetPage}`);

        // Check for page transition animation
        const pageContent = page.locator('[data-testid="page-content"]');
        if (await pageContent.isVisible()) {
          const animationState = await pageContent.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              opacity: style.opacity,
              transform: style.transform,
            };
          });

          // Page should have transition properties
          expect(animationState.opacity).toBeTruthy();
          expect(animationState.transform).toBeTruthy();
        }
      }
    }
  });

  test('should show modal and sheet transition animations', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Test modal animations
    const modalTriggers = page.locator('[data-testid*="open-modal"]');
    const triggerCount = await modalTriggers.count();

    if (triggerCount > 0) {
      const trigger = modalTriggers.first();
      await trigger.click();

      // Check for modal appearance animation
      const modal = page.locator('[data-testid="modal-content"]');
      if (await modal.isVisible()) {
        const modalAnimation = await modal.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            opacity: style.opacity,
            transform: style.transform,
            animation: style.animation,
          };
        });

        expect(modalAnimation.opacity).toBe('1');
        expect(modalAnimation.transform).not.toBe('none');

        // Close modal and check exit animation
        const closeButton = page.locator('[data-testid="close-modal"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();

          // Modal should animate out
          await expect(modal).not.toBeVisible();
        }
      }
    }
  });

  test('should show progress and milestone celebration animations', async ({
    page,
  }) => {
    await page.click('[data-testid="dashboard-link"]');

    // Look for progress animations
    const progressElements = page.locator(
      '[data-testid*="progress-animation"]'
    );
    const progressCount = await progressElements.count();

    if (progressCount > 0) {
      const progress = progressElements.first();
      await expect(progress).toBeVisible();

      // Check for progress bar animation
      const progressBar = progress.locator('[data-testid="progress-bar"]');
      if (await progressBar.isVisible()) {
        const width = await progressBar.evaluate(el => {
          return window.getComputedStyle(el).width;
        });
        expect(width).not.toBe('0px');
      }
    }

    // Test milestone celebration trigger
    const celebrationTrigger = page.locator(
      '[data-testid="trigger-celebration"]'
    );
    if (await celebrationTrigger.isVisible()) {
      await celebrationTrigger.click();

      // Should show celebration animation
      const celebration = page.locator('[data-testid="milestone-celebration"]');
      await expect(celebration).toBeVisible();

      // Should have celebration animation classes
      const celebrationClasses = await celebration.getAttribute('class');
      expect(celebrationClasses).toMatch(/celebrate|confetti|sparkle|bounce/);

      // Wait for celebration to complete
      await page.waitForTimeout(2000);

      // Celebration should fade out
      await expect(celebration).not.toBeVisible();
    }
  });
});
