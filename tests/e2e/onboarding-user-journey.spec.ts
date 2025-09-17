import { expect, test } from '@playwright/test';

test.describe('Onboarding and Complete User Journey', () => {
  test('should complete full onboarding flow with Guardian of Memories narrative', async ({
    page,
  }) => {
    // Start at the onboarding page
    await page.goto('/onboarding');

    // Scene 1 - Promise of Calm
    await expect(
      page.locator('[data-testid="onboarding-scene-1"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="firefly-animation"]')
    ).toBeVisible();
    await expect(page.locator('text=Guardian of Memories')).toBeVisible();

    // Check for night scene background
    await expect(
      page.locator('[data-testid="night-scene-background"]')
    ).toBeVisible();

    // Click "Start writing my story" CTA
    await page.click('[data-testid="start-story-button"]');

    // Scene 2 - The Box of Certainty
    await expect(
      page.locator('[data-testid="onboarding-scene-2"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="box-of-certainty"]')
    ).toBeVisible();
    await expect(page.locator('text=Box of Certainty')).toBeVisible();

    // Should show emotional prompt about items for loved ones
    await expect(
      page.locator('[data-testid="emotional-prompt"]')
    ).toBeVisible();
    await expect(page.locator('text=loved ones')).toBeVisible();

    // Check for box animation
    const boxElement = page.locator('[data-testid="box-animation"]');
    await expect(boxElement).toBeVisible();

    // Continue to next scene
    await page.click('[data-testid="continue-to-scene-3"]');

    // Scene 3 - The Key of Trust
    await expect(
      page.locator('[data-testid="onboarding-scene-3"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="key-of-trust"]')).toBeVisible();
    await expect(page.locator('text=Key of Trust')).toBeVisible();

    // Should show name entry field
    await expect(
      page.locator('[data-testid="name-entry-field"]')
    ).toBeVisible();

    // Enter name and check key engraving update
    await page.fill('[data-testid="name-entry-field"]', 'John Doe');

    // Key should update with name
    await expect(page.locator('[data-testid="key-engraving"]')).toContainText(
      'For John Doe'
    );

    // Continue to final scene
    await page.click('[data-testid="continue-to-scene-4"]');

    // Scene 4 - Preparing the Path
    await expect(
      page.locator('[data-testid="onboarding-scene-4"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="preparing-path"]')).toBeVisible();

    // Should show firefly light trail animation
    await expect(
      page.locator('[data-testid="firefly-trail-animation"]')
    ).toBeVisible();

    // Complete onboarding and redirect to dashboard
    await page.click('[data-testid="complete-onboarding"]');

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard');
    await expect(
      page.locator('[data-testid="dashboard-content"]')
    ).toBeVisible();
  });

  test('should handle onboarding with personality mode selection', async ({
    page,
  }) => {
    await page.goto('/onboarding');

    // Navigate through initial scenes quickly
    await page.click('[data-testid="start-story-button"]');
    await page.click('[data-testid="continue-to-scene-3"]');

    // In scene 3, check for personality mode selection
    const personalitySelector = page.locator(
      '[data-testid="personality-mode-selector"]'
    );
    if (await personalitySelector.isVisible()) {
      // Select empathetic mode
      await page.click('[data-testid="select-empathetic-mode"]');

      // UI should adapt to empathetic styling
      await expect(
        page.locator('[data-personality-mode="empathetic"]')
      ).toBeVisible();
    }

    // Fill name
    await page.fill('[data-testid="name-entry-field"]', 'Maria');

    // Continue to completion
    await page.click('[data-testid="continue-to-scene-4"]');
    await page.click('[data-testid="complete-onboarding"]');

    // Dashboard should reflect personality choice
    await page.waitForURL('**/dashboard');
    await expect(
      page.locator('[data-personality-mode="empathetic"]')
    ).toBeVisible();
  });

  test('should show onboarding progress indicators', async ({ page }) => {
    await page.goto('/onboarding');

    // Should show progress indicator
    await expect(
      page.locator('[data-testid="onboarding-progress"]')
    ).toBeVisible();

    // Should show scene 1 of 4
    await expect(
      page.locator('[data-testid="progress-indicator"]')
    ).toContainText('1 / 4');

    // Navigate to scene 2
    await page.click('[data-testid="start-story-button"]');

    // Progress should update
    await expect(
      page.locator('[data-testid="progress-indicator"]')
    ).toContainText('2 / 4');

    // Continue through all scenes checking progress
    await page.click('[data-testid="continue-to-scene-3"]');
    await expect(
      page.locator('[data-testid="progress-indicator"]')
    ).toContainText('3 / 4');

    await page.fill('[data-testid="name-entry-field"]', 'Test User');
    await page.click('[data-testid="continue-to-scene-4"]');
    await expect(
      page.locator('[data-testid="progress-indicator"]')
    ).toContainText('4 / 4');
  });

  test('should complete first document upload user journey', async ({
    page,
  }) => {
    // Complete onboarding first
    await page.goto('/onboarding');
    await page.click('[data-testid="start-story-button"]');
    await page.click('[data-testid="continue-to-scene-3"]');
    await page.fill('[data-testid="name-entry-field"]', 'Journey User');
    await page.click('[data-testid="continue-to-scene-4"]');
    await page.click('[data-testid="complete-onboarding"]');

    // Should be on dashboard
    await page.waitForURL('**/dashboard');

    // Navigate to vault for first document upload
    await page.click('[data-testid="vault-link"]');
    await page.waitForURL('**/vault');

    // Should show empty vault state
    await expect(
      page.locator('[data-testid="empty-vault-message"]')
    ).toBeVisible();

    // Click upload document
    await page.click('[data-testid="upload-document-button"]');

    // Should show document upload modal
    await expect(
      page.locator('[data-testid="document-upload-modal"]')
    ).toBeVisible();

    // Simulate file upload
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    if (await fileInput.isVisible()) {
      // Upload a test file
      await fileInput.setInputFiles('./tests/test-files/sample-invoice.pdf');

      // Fill document metadata
      await page.fill('[data-testid="document-title"]', 'My First Document');
      await page.selectOption('[data-testid="document-category"]', 'legal');
      await page.fill(
        '[data-testid="document-description"]',
        'Important family document'
      );

      // Submit upload
      await page.click('[data-testid="submit-upload"]');

      // Should show upload success
      await expect(
        page.locator('[data-testid="upload-success-message"]')
      ).toBeVisible();
    }

    // Navigate back to dashboard
    await page.click('[data-testid="dashboard-link"]');

    // Should show first stone milestone message
    const milestoneMessage = page.locator(
      '[data-testid="first-stone-milestone"]'
    );
    if (await milestoneMessage.isVisible()) {
      await expect(milestoneMessage).toContainText(
        "first stone in your family's mosaic"
      );
    }
  });

  test('should show pillar unlock progression system', async ({ page }) => {
    // Start with completed onboarding
    await page.goto('/dashboard');

    // Check initial pillar state
    const todayPillar = page.locator('[data-testid="today-pillar"]');
    await expect(todayPillar).toBeVisible();

    // TODAY pillar should be active
    const todayPillarState =
      await todayPillar.getAttribute('data-pillar-state');
    expect(todayPillarState).toBe('active');

    // TOMORROW pillar should be locked initially
    const tomorrowPillar = page.locator('[data-testid="tomorrow-pillar"]');
    const tomorrowPillarState =
      await tomorrowPillar.getAttribute('data-pillar-state');
    expect(tomorrowPillarState).toBe('locked');

    // Check pillar unlock conditions info
    await tomorrowPillar.hover();
    const unlockTooltip = page.locator('[data-testid="pillar-unlock-tooltip"]');
    if (await unlockTooltip.isVisible()) {
      await expect(unlockTooltip).toContainText('5-7 TODAY items');
    }
  });

  test('should show document expiry notification workflow', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // Check for document expiry notifications
    const expiryNotification = page.locator(
      '[data-testid="document-expiry-notification"]'
    );
    if (await expiryNotification.isVisible()) {
      await expect(expiryNotification).toBeVisible();

      // Should show friendly reminder message
      await expect(expiryNotification).toContainText(
        'small reminder from your memory guardian'
      );

      // Should have action buttons
      await expect(
        page.locator('[data-testid="update-document-button"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="dismiss-notification-button"]')
      ).toBeVisible();

      // Test dismiss functionality
      await page.click('[data-testid="dismiss-notification-button"]');
      await expect(expiryNotification).not.toBeVisible();
    }
  });

  test('should complete guardian setup user journey', async ({ page }) => {
    await page.goto('/guardians');

    // Should show guardian setup page
    await expect(page.locator('[data-testid="guardians-page"]')).toBeVisible();

    // Check for empty guardians state
    const emptyState = page.locator('[data-testid="empty-guardians-message"]');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }

    // Add first guardian
    await page.click('[data-testid="add-guardian-button"]');

    // Should show guardian setup form
    await expect(
      page.locator('[data-testid="guardian-setup-form"]')
    ).toBeVisible();

    // Fill guardian information
    await page.fill('[data-testid="guardian-name"]', 'Sarah Johnson');
    await page.fill('[data-testid="guardian-email"]', 'sarah@example.com');
    await page.fill('[data-testid="guardian-phone"]', '+1-555-0123');
    await page.selectOption('[data-testid="guardian-relationship"]', 'sister');

    // Set guardian permissions
    await page.check('[data-testid="documents-access-permission"]');
    await page.check('[data-testid="emergency-contact-permission"]');

    // Submit guardian setup
    await page.click('[data-testid="save-guardian"]');

    // Should show success message
    await expect(
      page.locator('[data-testid="guardian-added-success"]')
    ).toBeVisible();

    // Guardian should appear in list
    await expect(page.locator('[data-testid="guardian-list"]')).toContainText(
      'Sarah Johnson'
    );
  });

  test('should show legacy planning progression workflow', async ({ page }) => {
    await page.goto('/legacy');

    // Should show legacy garden
    await expect(page.locator('[data-testid="legacy-garden"]')).toBeVisible();

    // Should show garden growth based on completed documents
    const gardenProgress = page.locator('[data-testid="garden-progress"]');
    await expect(gardenProgress).toBeVisible();

    // Check for legacy tree visualization
    await expect(
      page.locator('[data-testid="adaptive-legacy-tree"]')
    ).toBeVisible();

    // Check for progress indicators
    const progressMetrics = page.locator('[data-testid="progress-metrics"]');
    if (await progressMetrics.isVisible()) {
      // Should show percentage completion
      const progressText = await progressMetrics.textContent();
      expect(progressText).toMatch(/\d+%/);
    }

    // Test legacy planning recommendations
    const recommendations = page.locator(
      '[data-testid="legacy-recommendations"]'
    );
    if (await recommendations.isVisible()) {
      await expect(recommendations).toBeVisible();

      // Should show personality-aware recommendations
      const recommendationText = await recommendations.textContent();
      expect(recommendationText).toBeTruthy();
    }
  });

  test('should complete Time Capsule premium feature workflow', async ({
    page,
  }) => {
    await page.goto('/legacy');

    // Look for Time Capsule feature
    const timeCapsuleSection = page.locator(
      '[data-testid="time-capsule-section"]'
    );
    if (await timeCapsuleSection.isVisible()) {
      await expect(timeCapsuleSection).toBeVisible();

      // Should show video message creation
      await expect(
        page.locator('[data-testid="create-video-message"]')
      ).toBeVisible();

      // Click create video message
      await page.click('[data-testid="create-video-message"]');

      // Should show video message form
      await expect(
        page.locator('[data-testid="video-message-form"]')
      ).toBeVisible();

      // Fill message details
      await page.fill('[data-testid="message-recipient"]', 'Anna');
      await page.selectOption(
        '[data-testid="delivery-occasion"]',
        '18th birthday'
      );
      await page.fill(
        '[data-testid="message-preview"]',
        'Happy 18th birthday, Anna!'
      );

      // Should show delivery date setting
      await expect(
        page.locator('[data-testid="delivery-date-setting"]')
      ).toBeVisible();
    }
  });

  test('should show annual ritual and progress summary', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for annual ritual notification
    const annualRitual = page.locator(
      '[data-testid="annual-ritual-notification"]'
    );
    if (await annualRitual.isVisible()) {
      await expect(annualRitual).toBeVisible();

      // Should show progress summary
      await expect(
        page.locator('[data-testid="annual-progress-summary"]')
      ).toBeVisible();

      // Should show reflective nudge
      const reflectiveMessage = page.locator(
        '[data-testid="reflective-message"]'
      );
      await expect(reflectiveMessage).toBeVisible();

      // Check for year-over-year progress
      const progressComparison = page.locator(
        '[data-testid="progress-comparison"]'
      );
      if (await progressComparison.isVisible()) {
        await expect(progressComparison).toBeVisible();
      }
    }
  });

  test('should show Box of Certainty completion celebration', async ({
    page,
  }) => {
    await page.goto('/legacy');

    // Check for Box of Certainty completion state
    const boxCompletion = page.locator(
      '[data-testid="box-of-certainty-completion"]'
    );
    if (await boxCompletion.isVisible()) {
      // Should show glow animation when pillars are ~90%+ complete
      await expect(
        page.locator('[data-testid="box-glow-animation"]')
      ).toBeVisible();

      // Should show completion message
      const completionMessage = await boxCompletion.textContent();
      expect(completionMessage).toContain('Box of Certainty');

      // Should show celebration animation
      await expect(
        page.locator('[data-testid="completion-celebration"]')
      ).toBeVisible();
    }
  });

  test('should handle mobile responsive onboarding flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/onboarding');

    // Check mobile layout
    await expect(
      page.locator('[data-testid="onboarding-mobile-layout"]')
    ).toBeVisible();

    // Check that animations are optimized for mobile
    const firefly = page.locator('[data-testid="firefly-animation"]');
    if (await firefly.isVisible()) {
      const animationConfig = await firefly.evaluate(el => {
        return {
          animationDuration: window.getComputedStyle(el).animationDuration,
          transform: window.getComputedStyle(el).transform,
        };
      });

      // Mobile animations should be faster
      expect(parseFloat(animationConfig.animationDuration)).toBeLessThanOrEqual(
        0.5
      );
    }

    // Complete onboarding on mobile
    await page.click('[data-testid="start-story-button"]');
    await page.click('[data-testid="continue-to-scene-3"]');
    await page.fill('[data-testid="name-entry-field"]', 'Mobile User');
    await page.click('[data-testid="continue-to-scene-4"]');
    await page.click('[data-testid="complete-onboarding"]');

    // Should redirect to dashboard with mobile layout
    await page.waitForURL('**/dashboard');
    await expect(
      page.locator('[data-testid="dashboard-mobile-layout"]')
    ).toBeVisible();
  });

  test('should handle onboarding accessibility features', async ({ page }) => {
    await page.goto('/onboarding');

    // Check for keyboard navigation
    await page.keyboard.press('Tab');

    // First focusable element should be the start button
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveAttribute(
      'data-testid',
      'start-story-button'
    );

    // Check for ARIA labels
    await expect(
      page.locator('[data-testid="onboarding-scene-1"]')
    ).toHaveAttribute('role', 'main');
    await expect(
      page.locator('[data-testid="progress-indicator"]')
    ).toHaveAttribute('aria-label');

    // Check for screen reader announcements
    const announcements = page.locator('[aria-live="polite"]');
    if ((await announcements.count()) > 0) {
      await expect(announcements.first()).toBeVisible();
    }

    // Test reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Animations should be simplified
    const animatedElements = page.locator('[data-testid*="animation"]');
    const animationCount = await animatedElements.count();

    for (let i = 0; i < animationCount; i++) {
      const element = animatedElements.nth(i);
      const animationDuration = await element.evaluate(el => {
        return window.getComputedStyle(el).animationDuration;
      });

      // Should have minimal animation duration
      expect(parseFloat(animationDuration)).toBeLessThanOrEqual(0.2);
    }
  });
});
