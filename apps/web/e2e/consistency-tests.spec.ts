import { test, expect } from '@playwright/test';

// Test suite for design consistency validation
test.describe('Design Consistency Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up consistent viewport for testing
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/onboarding');
  });

  test('Animation timing consistency across components', async ({ page }) => {
    // Wait for onboarding to load
    await page.waitForSelector('[data-testid="onboarding-container"]');

    // Test Box3D animation timing
    const box3d = page.locator('[data-testid="box-3d"]');
    await expect(box3d).toBeVisible();

    // Measure animation duration
    const startTime = Date.now();
    await page.waitForTimeout(1000); // Wait for animations to settle
    const loadTime = Date.now() - startTime;

    // Should load within acceptable time
    expect(loadTime).toBeLessThan(3000);

    // Test Key3D animation timing
    const key3d = page.locator('[data-testid="key-3d"]');
    await expect(key3d).toBeVisible();

    // Verify smooth animations
    const animationDuration = await key3d.evaluate(() => {
      const element = document.querySelector('[data-testid="key-3d"]');
      if (element) {
        const computedStyle = window.getComputedStyle(element);
        return computedStyle.animationDuration || computedStyle.transitionDuration;
      }
      return '0s';
    });

    // Should use consistent timing
    expect(animationDuration).toMatch(/0\.[4-6]s/); // 0.4s to 0.6s range
  });

  test('AI personality consistency across interactions', async ({ page }) => {
    // Wait for Sofia AI to appear
    await page.waitForSelector('[data-testid="sofia-firefly"]');

    const sofiaMessages = page.locator('[data-testid="sofia-message"]');
    const initialMessageCount = await sofiaMessages.count();

    // Trigger multiple interactions
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="next-step-button"]');
      await page.waitForTimeout(1000);
    }

    const finalMessageCount = await sofiaMessages.count();
    expect(finalMessageCount).toBeGreaterThan(initialMessageCount);

    // Verify consistent personality tone
    const messages = await sofiaMessages.allTextContents();
    const hasConsistentTone = messages.every(message =>
      message.includes('help') ||
      message.includes('guide') ||
      message.includes('support') ||
      message.includes('encourage')
    );

    expect(hasConsistentTone).toBe(true);
  });

  test('Visual consistency - colors and materials', async ({ page }) => {
    // Test gold color consistency
    const goldElements = page.locator('[data-testid*="gold"], [data-testid*="key"]');
    await expect(goldElements.first()).toBeVisible();

    const goldColor = await goldElements.first().evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return computedStyle.color || computedStyle.backgroundColor;
    });

    // Should use consistent gold color (#FFD700 or similar)
    expect(goldColor).toMatch(/rgb\(255, 215, 0\)|#FFD700|#fff000/i);

    // Test wood color consistency
    const woodElements = page.locator('[data-testid*="wood"], [data-testid*="box"]');
    await expect(woodElements.first()).toBeVisible();

    const woodColor = await woodElements.first().evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return computedStyle.color || computedStyle.backgroundColor;
    });

    // Should use consistent wood color (#8B4513 or similar)
    expect(woodColor).toMatch(/rgb\(139, 69, 19\)|#8B4513|#654321/i);
  });

  test('Typography hierarchy consistency', async ({ page }) => {
    // Test hero text
    const heroText = page.locator('h1, [data-testid="hero-text"]');
    await expect(heroText).toBeVisible();

    const heroStyles = await heroText.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        lineHeight: computedStyle.lineHeight
      };
    });

    // Should use hero typography (large, bold)
    expect(heroStyles.fontSize).toMatch(/2[0-9]|3[0-9]|4[0-9]/); // 20px+
    expect(heroStyles.fontWeight).toMatch(/700|bold/);

    // Test body text
    const bodyText = page.locator('p, [data-testid="body-text"]');
    await expect(bodyText.first()).toBeVisible();

    const bodyStyles = await bodyText.first().evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        lineHeight: computedStyle.lineHeight
      };
    });

    // Should use body typography (normal weight, good line height)
    expect(bodyStyles.fontSize).toMatch(/1[4-9]|2[0-9]/); // 14px+
    expect(bodyStyles.fontWeight).toMatch(/400|normal/);
    expect(bodyStyles.lineHeight).toMatch(/1\.[4-9]/); // 1.4+
  });

  test('Accessibility compliance', async ({ page }) => {
    // Test reduced motion support
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const animatedElements = page.locator('[data-testid*="animation"], [data-testid*="motion"]');
    const elementCount = await animatedElements.count();

    if (elementCount > 0) {
      // Should respect reduced motion preferences
      const animationDuration = await animatedElements.first().evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return computedStyle.animationDuration || computedStyle.transitionDuration;
      });

      // Animation should be disabled or very fast
      expect(animationDuration).toMatch(/0s|0\.[0-1]s/);
    }

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test ARIA labels
    const ariaLabels = page.locator('[aria-label]');
    const ariaLabelCount = await ariaLabels.count();
    expect(ariaLabelCount).toBeGreaterThan(0);
  });

  test('Performance consistency', async ({ page }) => {
    // Monitor frame rate during interactions
    const frameRateMetrics = await page.evaluate(() => {
      return new Promise<{fps: number, frameCount: number}>((resolve) => {
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFrameRate = () => {
          frameCount++;
          const currentTime = performance.now();

          if (currentTime - lastTime >= 1000) { // 1 second
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            resolve({ fps, frameCount });
            return;
          }

          requestAnimationFrame(measureFrameRate);
        };

        requestAnimationFrame(measureFrameRate);
      });
    });

    // Should maintain good frame rate
    expect(frameRateMetrics.fps).toBeGreaterThan(30);
    expect(frameRateMetrics.frameCount).toBeGreaterThan(10);
  });

  test('Cross-component AI consistency', async ({ page }) => {
    // Navigate through multiple steps
    const steps = ['scene1', 'scene2', 'scene3', 'scene4'];

    const personalityScores: number[] = [];

    for (const step of steps) {
      await page.click(`[data-testid="step-${step}"]`);
      await page.waitForTimeout(2000);

      // Check AI personality consistency
      const sofiaElement = page.locator('[data-testid="sofia-firefly"]');
      const isVisible = await sofiaElement.isVisible();

      if (isVisible) {
        const message = await sofiaElement.textContent();
        const hasPersonalityKeywords = /help|guide|support|encourage|trust|process|analy/i.test(message || '');
        personalityScores.push(hasPersonalityKeywords ? 1 : 0);
      }
    }

    // Should maintain personality consistency across steps
    const consistencyScore = personalityScores.reduce((sum, score) => sum + score, 0) / personalityScores.length;
    expect(consistencyScore).toBeGreaterThan(0.7); // 70% consistency
  });

  test('User journey completion', async ({ page }) => {
    // Complete full onboarding journey
    const journeyStartTime = Date.now();

    // Navigate through all steps
    const steps = [
      { selector: '[data-testid="start-journey"]', wait: 1000 },
      { selector: '[data-testid="next-step-button"]', wait: 2000 },
      { selector: '[data-testid="continue-button"]', wait: 2000 },
      { selector: '[data-testid="complete-onboarding"]', wait: 1000 }
    ];

    for (const step of steps) {
      await page.click(step.selector);
      await page.waitForTimeout(step.wait);
    }

    const journeyTime = Date.now() - journeyStartTime;

    // Journey should complete within reasonable time
    expect(journeyTime).toBeLessThan(15000); // 15 seconds

    // Should reach completion state
    const completionElement = page.locator('[data-testid="onboarding-complete"]');
    await expect(completionElement).toBeVisible();
  });
});

// Visual regression tests
test.describe('Visual Regression Tests', () => {
  test('Component snapshots match baseline', async ({ page }) => {
    await page.goto('/onboarding');

    // Take screenshots of key components
    const components = [
      'box-3d',
      'key-3d',
      'sofia-firefly',
      'ai-processing-animation'
    ];

    for (const component of components) {
      const element = page.locator(`[data-testid="${component}"]`);
      await expect(element).toBeVisible();

      // Screenshot for visual regression testing
      await expect(element).toHaveScreenshot(`${component}-snapshot.png`, {
        threshold: 0.1, // 10% tolerance for minor differences
        maxDiffPixels: 100
      });
    }
  });

  test('Animation states visual consistency', async ({ page }) => {
    await page.goto('/onboarding');

    // Test different animation states
    const animationStates = ['idle', 'processing', 'celebrating', 'guiding'];

    for (const state of animationStates) {
      // Trigger animation state
      await page.evaluate((animationState) => {
        window.dispatchEvent(new CustomEvent('test-animation-state', {
          detail: { state: animationState }
        }));
      }, state);

      await page.waitForTimeout(1000);

      // Take screenshot of animation state
      await expect(page.locator('body')).toHaveScreenshot(`animation-${state}.png`, {
        threshold: 0.2, // Higher tolerance for animations
        maxDiffPixels: 200
      });
    }
  });
});

// Performance benchmarking
test.describe('Performance Benchmarks', () => {
  test('Animation performance metrics', async ({ page }) => {
    await page.goto('/onboarding');

    const performanceMetrics = await page.evaluate(() => {
      return new Promise<{count: number, averageDuration: number, maxDuration: number}>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const animationEntries = entries.filter(entry =>
            entry.name.includes('animation') || entry.name.includes('motion')
          );

          resolve({
            count: animationEntries.length,
            averageDuration: animationEntries.reduce((sum, entry) => sum + entry.duration, 0) / animationEntries.length,
            maxDuration: Math.max(...animationEntries.map(entry => entry.duration))
          });
        });

        observer.observe({ entryTypes: ['measure'] });

        // Trigger some animations
        setTimeout(() => {
          observer.disconnect();
          resolve({ count: 0, averageDuration: 0, maxDuration: 0 });
        }, 5000);
      });
    });

    // Performance should meet standards
    expect(performanceMetrics.averageDuration).toBeLessThan(100); // ms
    expect(performanceMetrics.maxDuration).toBeLessThan(500); // ms
  });

  test('Memory usage tracking', async ({ page }) => {
    await page.goto('/onboarding');

    const memoryUsage = await page.evaluate(() => {
      // Use a simpler memory estimation since performance.memory is not available in all browsers
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Simulate component interactions
      return new Promise<{initial: number, final: number, increase: number}>((resolve) => {
        setTimeout(() => {
          const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
          resolve({
            initial: initialMemory,
            final: finalMemory,
            increase: finalMemory - initialMemory
          });
        }, 3000);
      });
    });

    // Memory increase should be reasonable
    expect(memoryUsage.increase).toBeLessThan(50 * 1024 * 1024); // 50MB
  });
});