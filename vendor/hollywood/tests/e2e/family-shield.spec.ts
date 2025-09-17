import { expect, test } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';

test.describe('Family Shield Emergency System', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.signIn();
  });

  test('should display Family Protection navigation and access', async ({
    page,
  }) => {
    // Check if Family Shield/Protection link exists in navigation
    await expect(
      page.locator('[data-testid="family-protection-link"]')
    ).toBeVisible();

    // Navigate to Family Protection dashboard
    await page.click('[data-testid="family-protection-link"]');
    await page.waitForURL('**/family-protection');

    // Check main Family Protection Dashboard components
    await expect(
      page.locator('[data-testid="family-protection-dashboard"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="dead-mans-switch-manager"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="emergency-contact-system"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="guardian-notification-center"]')
    ).toBeVisible();
  });

  test("should configure Dead Man's Switch with personality integration", async ({
    page,
  }) => {
    await page.click('[data-testid="family-protection-link"]');
    await page.waitForSelector('[data-testid="dead-mans-switch-manager"]');

    // Check Dead Man's Switch configuration
    const switchManager = page.locator(
      '[data-testid="dead-mans-switch-manager"]'
    );
    await expect(switchManager).toBeVisible();

    // Check for personality-aware interface elements
    await expect(
      page.locator('[data-testid="personality-aware-switch-ui"]')
    ).toBeVisible();

    // Test switch activation
    const activateButton = page.locator(
      '[data-testid="activate-dead-mans-switch"]'
    );
    if (await activateButton.isVisible()) {
      await activateButton.click();

      // Should show confirmation dialog
      await expect(
        page.locator('[data-testid="switch-activation-confirmation"]')
      ).toBeVisible();

      // Confirm activation
      await page.click('[data-testid="confirm-switch-activation"]');

      // Should show active state
      await expect(
        page.locator('[data-testid="switch-active-indicator"]')
      ).toBeVisible();
    }

    // Test switch configuration
    const configureButton = page.locator(
      '[data-testid="configure-dead-mans-switch"]'
    );
    if (await configureButton.isVisible()) {
      await configureButton.click();

      // Should show configuration options
      await expect(
        page.locator('[data-testid="switch-configuration-panel"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="inactivity-threshold-setting"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="notification-frequency-setting"]')
      ).toBeVisible();
    }
  });

  test('should manage emergency contacts and guardians', async ({ page }) => {
    await page.click('[data-testid="family-protection-link"]');
    await page.waitForSelector('[data-testid="emergency-contact-system"]');

    const contactSystem = page.locator(
      '[data-testid="emergency-contact-system"]'
    );
    await expect(contactSystem).toBeVisible();

    // Test adding new guardian
    const addGuardianButton = page.locator(
      '[data-testid="add-guardian-button"]'
    );
    if (await addGuardianButton.isVisible()) {
      await addGuardianButton.click();

      // Should show add guardian form
      await expect(
        page.locator('[data-testid="add-guardian-form"]')
      ).toBeVisible();

      // Fill guardian details
      await page.fill('[data-testid="guardian-name-input"]', 'John Doe');
      await page.fill(
        '[data-testid="guardian-email-input"]',
        'john.doe@example.com'
      );
      await page.fill('[data-testid="guardian-phone-input"]', '+1234567890');
      await page.selectOption(
        '[data-testid="guardian-relationship-select"]',
        'spouse'
      );

      // Submit form
      await page.click('[data-testid="save-guardian-button"]');

      // Should show success message
      await expect(
        page.locator('[data-testid="guardian-added-success"]')
      ).toBeVisible();

      // Should appear in guardian list
      await expect(page.locator('[data-testid="guardian-list"]')).toContainText(
        'John Doe'
      );
    }

    // Test guardian permissions
    const existingGuardian = page
      .locator('[data-testid*="guardian-item-"]')
      .first();
    if (await existingGuardian.isVisible()) {
      await existingGuardian.click();

      // Should show guardian details and permissions
      await expect(
        page.locator('[data-testid="guardian-permissions-panel"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="document-access-permission"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="emergency-contact-permission"]')
      ).toBeVisible();
    }
  });

  test('should show guardian notification center with multi-channel support', async ({
    page,
  }) => {
    await page.click('[data-testid="family-protection-link"]');
    await page.waitForSelector('[data-testid="guardian-notification-center"]');

    const notificationCenter = page.locator(
      '[data-testid="guardian-notification-center"]'
    );
    await expect(notificationCenter).toBeVisible();

    // Check notification channel options
    await expect(
      page.locator('[data-testid="email-notification-channel"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="sms-notification-channel"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="push-notification-channel"]')
    ).toBeVisible();

    // Test notification preferences
    const notificationSettings = page.locator(
      '[data-testid="notification-settings-button"]'
    );
    if (await notificationSettings.isVisible()) {
      await notificationSettings.click();

      // Should show notification configuration
      await expect(
        page.locator('[data-testid="notification-frequency-setting"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="notification-urgency-setting"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="notification-template-setting"]')
      ).toBeVisible();
    }

    // Test sending test notification
    const testNotificationButton = page.locator(
      '[data-testid="send-test-notification"]'
    );
    if (await testNotificationButton.isVisible()) {
      await testNotificationButton.click();

      // Should show confirmation
      await expect(
        page.locator('[data-testid="test-notification-sent"]')
      ).toBeVisible();
    }
  });

  test('should adapt Family Shield interface to personality mode', async ({
    page,
  }) => {
    const personalityModes = ['empathetic', 'pragmatic', 'adaptive'];

    for (const mode of personalityModes) {
      // Set personality mode
      await page.click('[data-testid="settings-link"]');
      await page.click(`[data-testid="personality-${mode}"]`);

      // Navigate to Family Protection
      await page.click('[data-testid="family-protection-link"]');

      // Check for personality-specific styling
      const dashboard = page.locator(
        '[data-testid="family-protection-dashboard"]'
      );
      await expect(dashboard).toHaveAttribute('data-personality-mode', mode);

      // Check for personality-specific language
      const welcomeMessage = page.locator(
        '[data-testid="family-shield-welcome"]'
      );
      if (await welcomeMessage.isVisible()) {
        const messageText = await welcomeMessage.textContent();

        if (mode === 'empathetic') {
          expect(messageText).toMatch(/care|love|protect|cherish|family/i);
        } else if (mode === 'pragmatic') {
          expect(messageText).toMatch(
            /secure|efficient|organize|prepare|plan/i
          );
        } else if (mode === 'adaptive') {
          expect(messageText).toMatch(
            /smart|flexible|comprehensive|evolving|balanced/i
          );
        }
      }

      // Check for personality-specific color themes
      const emergencyButton = page
        .locator('[data-testid="emergency-action-button"]')
        .first();
      if (await emergencyButton.isVisible()) {
        const buttonClasses = await emergencyButton.getAttribute('class');

        if (mode === 'empathetic') {
          expect(buttonClasses).toMatch(/pink|purple|rose/);
        } else if (mode === 'pragmatic') {
          expect(buttonClasses).toMatch(/gray|slate|neutral/);
        } else if (mode === 'adaptive') {
          expect(buttonClasses).toMatch(/blue|green|teal/);
        }
      }
    }
  });

  test('should handle emergency access token generation and validation', async ({
    page,
  }) => {
    await page.click('[data-testid="family-protection-link"]');

    // Test emergency access token generation
    const generateTokenButton = page.locator(
      '[data-testid="generate-emergency-token"]'
    );
    if (await generateTokenButton.isVisible()) {
      await generateTokenButton.click();

      // Should show token generation form
      await expect(
        page.locator('[data-testid="emergency-token-form"]')
      ).toBeVisible();

      // Fill token details
      await page.fill(
        '[data-testid="token-guardian-email"]',
        'guardian@example.com'
      );
      await page.fill('[data-testid="token-validity-hours"]', '72');
      await page.fill(
        '[data-testid="token-access-reason"]',
        'Emergency family access'
      );

      // Generate token
      await page.click('[data-testid="create-emergency-token"]');

      // Should show generated token
      await expect(
        page.locator('[data-testid="generated-emergency-token"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="token-verification-code"]')
      ).toBeVisible();

      // Should show token sharing options
      await expect(
        page.locator('[data-testid="share-token-email"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="share-token-sms"]')
      ).toBeVisible();
    }

    // Test viewing active tokens
    const activeTokensButton = page.locator(
      '[data-testid="view-active-tokens"]'
    );
    if (await activeTokensButton.isVisible()) {
      await activeTokensButton.click();

      // Should show active tokens list
      await expect(
        page.locator('[data-testid="active-tokens-list"]')
      ).toBeVisible();

      // Test revoking a token
      const revokeButton = page
        .locator('[data-testid*="revoke-token-"]')
        .first();
      if (await revokeButton.isVisible()) {
        await revokeButton.click();

        // Should show confirmation
        await expect(
          page.locator('[data-testid="revoke-token-confirmation"]')
        ).toBeVisible();
        await page.click('[data-testid="confirm-revoke-token"]');

        // Should show success message
        await expect(
          page.locator('[data-testid="token-revoked-success"]')
        ).toBeVisible();
      }
    }
  });

  test('should show health score and system status indicators', async ({
    page,
  }) => {
    await page.click('[data-testid="family-protection-link"]');

    // Check for health score display
    await expect(
      page.locator('[data-testid="family-shield-health-score"]')
    ).toBeVisible();

    // Check health score components
    await expect(
      page.locator('[data-testid="dead-mans-switch-status"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="guardian-contacts-status"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="notification-system-status"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="document-access-status"]')
    ).toBeVisible();

    // Test health score calculation
    const healthScore = page.locator('[data-testid="health-score-percentage"]');
    await expect(healthScore).toBeVisible();

    const scoreText = await healthScore.textContent();
    const score = parseInt(scoreText?.replace('%', '') || '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);

    // Check for health improvement recommendations
    if (score < 100) {
      await expect(
        page.locator('[data-testid="health-improvement-recommendations"]')
      ).toBeVisible();
    }
  });

  test('should handle emergency activation workflow', async ({ page }) => {
    await page.click('[data-testid="family-protection-link"]');

    // Test manual emergency activation
    const emergencyActivateButton = page.locator(
      '[data-testid="manual-emergency-activation"]'
    );
    if (await emergencyActivateButton.isVisible()) {
      await emergencyActivateButton.click();

      // Should show emergency activation confirmation
      await expect(
        page.locator('[data-testid="emergency-activation-warning"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="emergency-activation-consequences"]')
      ).toBeVisible();

      // Should require confirmation
      await expect(
        page.locator('[data-testid="emergency-activation-confirm-checkbox"]')
      ).toBeVisible();
      await page.check('[data-testid="emergency-activation-confirm-checkbox"]');

      // Should enable activation button
      const confirmButton = page.locator(
        '[data-testid="confirm-emergency-activation"]'
      );
      await expect(confirmButton).toBeEnabled();

      // Note: We don't actually activate in test to avoid triggering real emergency protocols
    }

    // Test emergency status monitoring
    const emergencyStatus = page.locator(
      '[data-testid="emergency-status-indicator"]'
    );
    await expect(emergencyStatus).toBeVisible();

    const statusText = await emergencyStatus.textContent();
    expect(['Active', 'Inactive', 'Monitoring', 'Standby']).toContain(
      statusText?.trim()
    );
  });

  test('should integrate with document access and permission system', async ({
    page,
  }) => {
    await page.click('[data-testid="family-protection-link"]');

    // Check for document access management
    await expect(
      page.locator('[data-testid="emergency-document-access"]')
    ).toBeVisible();

    // Test document permission configuration
    const configureAccessButton = page.locator(
      '[data-testid="configure-document-access"]'
    );
    if (await configureAccessButton.isVisible()) {
      await configureAccessButton.click();

      // Should show document access configuration
      await expect(
        page.locator('[data-testid="document-access-configuration"]')
      ).toBeVisible();

      // Check for document categories
      await expect(
        page.locator('[data-testid="legal-documents-access"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="financial-documents-access"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="personal-documents-access"]')
      ).toBeVisible();

      // Test permission levels
      const permissionSelects = page.locator(
        '[data-testid*="permission-level-"]'
      );
      const selectCount = await permissionSelects.count();

      if (selectCount > 0) {
        await permissionSelects.first().selectOption('read-only');

        // Should show permission updated
        await expect(
          page.locator('[data-testid="permission-updated-success"]')
        ).toBeVisible();
      }
    }

    // Test guardian document access simulation
    const testAccessButton = page.locator(
      '[data-testid="test-guardian-access"]'
    );
    if (await testAccessButton.isVisible()) {
      await testAccessButton.click();

      // Should show access test results
      await expect(
        page.locator('[data-testid="guardian-access-test-results"]')
      ).toBeVisible();
    }
  });

  test('should show audit trail and logging for emergency activities', async ({
    page,
  }) => {
    await page.click('[data-testid="family-protection-link"]');

    // Check for audit trail access
    const auditTrailButton = page.locator('[data-testid="view-audit-trail"]');
    if (await auditTrailButton.isVisible()) {
      await auditTrailButton.click();

      // Should show audit log
      await expect(
        page.locator('[data-testid="emergency-audit-log"]')
      ).toBeVisible();

      // Check for log entries
      const logEntries = page.locator('[data-testid*="audit-entry-"]');
      const entryCount = await logEntries.count();

      if (entryCount > 0) {
        const firstEntry = logEntries.first();
        await expect(firstEntry).toBeVisible();

        // Should show entry details
        await expect(
          firstEntry.locator('[data-testid="audit-timestamp"]')
        ).toBeVisible();
        await expect(
          firstEntry.locator('[data-testid="audit-action"]')
        ).toBeVisible();
        await expect(
          firstEntry.locator('[data-testid="audit-user"]')
        ).toBeVisible();
      }

      // Test audit log filtering
      const filterButton = page.locator('[data-testid="filter-audit-log"]');
      if (await filterButton.isVisible()) {
        await filterButton.click();

        // Should show filter options
        await expect(
          page.locator('[data-testid="audit-date-filter"]')
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="audit-action-filter"]')
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="audit-user-filter"]')
        ).toBeVisible();
      }
    }
  });
});
