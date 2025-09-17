import { expect, type Page, test } from '@playwright/test';
import { generateTestUser, waitForClerk } from './helpers/auth';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Comprehensive E2E Test - "Guardian of Memories" Full User Journey
 * This test simulates the complete experience of a new user from registration
 * through the emotional onboarding to becoming an active guardian.
 */

test.describe('🎭 Guardian of Memories - Complete User Journey', () => {
  const testUser = generateTestUser();
  let page: Page;

  // Configure tests to run in sequence
  test.describe.configure({ mode: 'serial' });

  // Set longer timeout for complete journey
  test.setTimeout(120000); // 2 minutes per test

  test.beforeAll(async ({ browser }) => {
    // Create a new context and page for the entire journey
    const context = await browser.newContext({
      recordVideo: {
        dir: 'tests/videos/',
        size: { width: 1280, height: 720 },
      },
    });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Act 1, Scene 1: Registration - Beginning the Journey', async () => {
    // console.error('🚀 Starting Guardian Journey with user:', testUser.email);

    // Navigate to sign-up page
    await page.goto('/sign-up');

    // Wait for Clerk to initialize
    await waitForClerk(page);

    // Screenshot the registration page
    await page.screenshot({
      path: 'tests/screenshots/journey-01-registration.png',
      fullPage: true,
    });

    // Fill registration form
    // Email field
    const emailInput = page
      .locator(
        'input[name="emailAddress"], input[type="email"], [data-testid="email-input"]'
      )
      .first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(testUser.email);

    // Password fields
    const passwordInput = page
      .locator(
        'input[name="password"], input[type="password"]:not([name="confirmPassword"]), [data-testid="password-input"]'
      )
      .first();
    await passwordInput.fill(testUser.password);

    const confirmPasswordInput = page.locator(
      'input[name="confirmPassword"], [data-testid="confirm-password-input"]'
    );
    if (await confirmPasswordInput.isVisible()) {
      await confirmPasswordInput.fill(testUser.password);
    }

    // First and Last name if present
    const firstNameInput = page.locator(
      'input[name="firstName"], [data-testid="first-name-input"]'
    );
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill(testUser.firstName || 'Guardian');
    }

    const lastNameInput = page.locator(
      'input[name="lastName"], [data-testid="last-name-input"]'
    );
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill(testUser.lastName || 'Test');
    }

    // Submit registration
    const submitButton = page
      .locator(
        'button[type="submit"], button:has-text("Sign up"), button:has-text("Create account"), [data-testid="submit-registration"]'
      )
      .first();
    await submitButton.click();

    // Wait for navigation after registration
    // Note: Actual implementation would need to handle email verification
    await page.waitForLoadState('networkidle');

    // Verify redirection to onboarding
    await expect(page).toHaveURL(/\/onboarding|\/welcome|\/setup/, {
      timeout: 15000,
    });

    // console.error('✅ Registration completed, proceeding to onboarding');
  });

  test('Act 1, Scene 2: The Promise of Calm - Onboarding Introduction', async () => {
    // Verify we're on the onboarding page
    const onboardingContainer = page.locator(
      '[data-testid="onboarding-container"], .onboarding-wizard, .guardian-journey'
    );
    await expect(onboardingContainer).toBeVisible({ timeout: 10000 });

    // Look for the firefly animation or welcome message
    const welcomeText = page.locator(
      'text=/Every life is a story|Každý život je príbeh|Start writing my story/i'
    );
    await expect(welcomeText.first()).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/journey-02-promise-of-calm.png',
      fullPage: true,
    });

    // Click "Start writing my story" or similar CTA
    const startButton = page
      .locator(
        'button:has-text("Start writing my story"), button:has-text("Begin"), [data-testid="start-onboarding"]'
      )
      .first();
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    // console.error('✅ Onboarding introduction completed');
  });

  test('Act 1, Scene 3: The Box of Certainty - Emotional Prompt', async () => {
    // Wait for the emotional prompt about the box
    const boxPrompt = page
      .locator(
        '[data-testid="box-of-certainty"], .emotional-prompt, textarea[placeholder*="box"], textarea[placeholder*="loved ones"]'
      )
      .first();
    await expect(boxPrompt).toBeVisible({ timeout: 10000 });

    // Fill in the emotional response
    const emotionalResponse = `My family photos and memories
Our important documents
Letters to my children
Access to our financial accounts`;

    await boxPrompt.fill(emotionalResponse);

    await page.screenshot({
      path: 'tests/screenshots/journey-03-box-of-certainty.png',
      fullPage: true,
    });

    // Submit the response
    const continueButton = page
      .locator(
        'button:has-text("Continue"), button:has-text("Next"), [data-testid="continue-box"]'
      )
      .first();
    await continueButton.click();

    // Verify the items animate into the visual box (if implemented)
    const visualBox = page.locator(
      '[data-testid="visual-box"], .box-animation, .certainty-box'
    );
    if (await visualBox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.waitForTimeout(2000); // Wait for animation
    }

    // console.error('✅ Box of Certainty completed');
  });

  test('Act 1, Scene 4: The Key of Trust - Trusted Person', async () => {
    // Wait for the trusted person prompt
    const trustedPersonPrompt = page
      .locator(
        '[data-testid="key-of-trust"], input[placeholder*="trusted"], input[placeholder*="person"], .trusted-person-input'
      )
      .first();
    await expect(trustedPersonPrompt).toBeVisible({ timeout: 10000 });

    // Enter trusted person's name
    const trustedPersonName = 'Martina';
    await trustedPersonPrompt.fill(trustedPersonName);

    // Verify the key updates with the name
    const keyVisualization = page.locator(
      '[data-testid="key-visual"], .key-engraving, text=/For Martina/i'
    );
    if (
      await keyVisualization.isVisible({ timeout: 3000 }).catch(() => false)
    ) {
      await expect(keyVisualization).toContainText(trustedPersonName);
    }

    await page.screenshot({
      path: 'tests/screenshots/journey-04-key-of-trust.png',
      fullPage: true,
    });

    // Continue to next step
    const continueButton = page
      .locator(
        'button:has-text("Continue"), button:has-text("Next"), [data-testid="continue-trust"]'
      )
      .first();
    await continueButton.click();

    // console.error('✅ Key of Trust completed');
  });

  test('Act 1, Scene 5: Preparing the Path - Loading & Redirect', async () => {
    // Look for the thank you message and firefly animation
    const thankYouMessage = page.locator(
      'text=/Thank you|Preparing|Loading/i, [data-testid="preparing-path"]'
    );
    await expect(thankYouMessage.first()).toBeVisible({ timeout: 5000 });

    // Look for firefly trail animation (if implemented)
    const fireflyAnimation = page.locator(
      '[data-testid="firefly-animation"], .firefly-trail, .loading-animation'
    );
    if (
      await fireflyAnimation.isVisible({ timeout: 3000 }).catch(() => false)
    ) {
      await page.screenshot({
        path: 'tests/screenshots/journey-05-firefly-trail.png',
        fullPage: true,
      });
    }

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard|\/home|\//, { timeout: 15000 });

    // Verify onboarding completion in metadata (advanced - requires API access)
    const isOnboardingComplete = await page.evaluate(async () => {
      // Check if Clerk is available and user has onboarding metadata
      if ((window as any).Clerk) {
        const user = await (window as any).Clerk.user;
        return user?.publicMetadata?.onboardingCompleted === true;
      }
      return false;
    });

    if (isOnboardingComplete) {
      // console.error('✅ Onboarding metadata confirmed in Clerk');
    }

    // console.error('✅ Path prepared, redirected to dashboard');
  });

  test('Act 2, Scene 1: First Dashboard Interaction - 5-Minute Challenge', async () => {
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/\/dashboard|\/home|\/$/, { timeout: 10000 });

    // Look for the dashboard elements
    const dashboardContainer = page.locator(
      '[data-testid="dashboard"], .dashboard-container, .life-inventory'
    );
    await expect(dashboardContainer).toBeVisible();

    // Look for the 5-minute challenge section
    const challengeSection = page.locator(
      '[data-testid="micro-task"], text=/5-minute|challenge|task/i, .micro-task-suggestion'
    );
    await expect(challengeSection.first()).toBeVisible();

    // Verify the first challenge is about laying the foundation stone
    const firstChallenge = page.locator(
      'text=/foundation stone|Základný Kameň|first document/i'
    );
    await expect(firstChallenge.first()).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/journey-06-dashboard-challenge.png',
      fullPage: true,
    });

    // Click on the challenge
    const challengeButton = page
      .locator(
        'button:has-text("Start"), button:has-text("Begin"), [data-testid="start-challenge"]'
      )
      .first();
    if (await challengeButton.isVisible()) {
      await challengeButton.click();

      // Verify navigation to vault/documents
      await page.waitForURL(/\/vault|\/documents|\/papers/, { timeout: 10000 });
    }

    // console.error('✅ First dashboard challenge accepted');
  });

  test('Act 2, Scene 2: Document Upload - First Mosaic Stone', async () => {
    // Create a test file if it doesn't exist
    const testFilePath = path.join(
      process.cwd(),
      'tests/test-files/sample-invoice.pdf'
    );
    if (!fs.existsSync(path.dirname(testFilePath))) {
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
    }
    if (!fs.existsSync(testFilePath)) {
      // Create a simple text file as a placeholder
      fs.writeFileSync(testFilePath, 'Sample Invoice PDF Content');
    }

    // Look for upload button
    const uploadButton = page
      .locator(
        'button:has-text("Upload"), button:has-text("Add Document"), [data-testid="upload-document"]'
      )
      .first();
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();

    // Handle file upload
    const fileInput = page
      .locator('input[type="file"], [data-testid="file-input"]')
      .first();
    await fileInput.setInputFiles(testFilePath);

    // Wait for analysis message
    const analysisMessage = page.locator(
      'text=/Analyzing|Processing|Scanning/i, [data-testid="analysis-status"]'
    );
    await expect(analysisMessage.first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: 'tests/screenshots/journey-07-document-analysis.png',
      fullPage: true,
    });

    // Wait for analysis results (may need longer timeout or mocking)
    await page.waitForTimeout(3000);

    // Look for category suggestion
    const categoryField = page
      .locator(
        '[data-testid="document-category"], select[name="category"], input[name="category"]'
      )
      .first();
    if (await categoryField.isVisible()) {
      // Verify AI suggested a category
      const categoryValue = await categoryField.inputValue();
      expect(categoryValue).toBeTruthy();
    }

    // Confirm and save document
    const saveButton = page
      .locator(
        'button:has-text("Save"), button:has-text("Confirm"), [data-testid="save-document"]'
      )
      .first();
    await saveButton.click();

    // Verify document appears in list
    await page.waitForTimeout(2000);
    const documentList = page.locator(
      '[data-testid="document-list"], .document-row, table tbody tr'
    );
    const documentCount = await documentList.count();
    expect(documentCount).toBeGreaterThan(0);

    // Look for success notification - "First stone in your family's mosaic"
    const successNotification = page.locator(
      'text=/mosaic|first stone|document saved/i, [data-testid="success-notification"]'
    );
    if (
      await successNotification.isVisible({ timeout: 3000 }).catch(() => false)
    ) {
      await page.screenshot({
        path: 'tests/screenshots/journey-08-first-mosaic-stone.png',
        fullPage: true,
      });
    }

    // console.error('✅ First document uploaded - mosaic stone placed');
  });

  test('Act 2, Scene 3: Path of Peace - Milestone Unlocked', async () => {
    // Navigate back to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify the foundation stone milestone is now active/unlocked
    const foundationMilestone = page.locator(
      '[data-testid="milestone-foundation"], .milestone-active, text=/foundation.*complete/i'
    );
    await expect(foundationMilestone.first()).toBeVisible();

    // Verify the next challenge is available
    const nextChallenge = page.locator(
      'text=/Circle of Trust|Trusted Circle|Add Guardian/i, [data-testid="next-challenge"]'
    );
    await expect(nextChallenge.first()).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/journey-09-milestone-unlocked.png',
      fullPage: true,
    });

    // console.error('✅ Foundation milestone unlocked, next challenge available');
  });

  test('Act 2, Scene 4: Adding a Guardian - Circle of Trust', async () => {
    // Navigate to guardians/family shield section
    const guardiansLink = page
      .locator(
        'a[href*="guardian"], a[href*="family"], a:has-text("Guardians"), [data-testid="guardians-nav"]'
      )
      .first();

    if (await guardiansLink.isVisible()) {
      await guardiansLink.click();
    } else {
      await page.goto('/family-shield');
    }

    await page.waitForLoadState('networkidle');

    // Click Add Guardian button
    const addGuardianButton = page
      .locator(
        'button:has-text("Add Guardian"), button:has-text("Add Trusted Person"), [data-testid="add-guardian"]'
      )
      .first();
    await expect(addGuardianButton).toBeVisible();
    await addGuardianButton.click();

    // Fill guardian form
    const guardianForm = {
      name: 'John Smith',
      email: 'john.smith@example.com',
      relationship: 'Brother',
      phone: '+421 900 123 456',
    };

    // Fill form fields
    const nameInput = page
      .locator('input[name="name"], [data-testid="guardian-name"]')
      .first();
    await nameInput.fill(guardianForm.name);

    const emailInput = page
      .locator(
        'input[name="email"], input[type="email"], [data-testid="guardian-email"]'
      )
      .first();
    await emailInput.fill(guardianForm.email);

    const relationshipInput = page
      .locator(
        'input[name="relationship"], select[name="relationship"], [data-testid="guardian-relationship"]'
      )
      .first();
    if (await relationshipInput.isVisible()) {
      // Check if it's a select element by trying to get the tagName
      const tagName = await relationshipInput.evaluate(el =>
        el.tagName.toLowerCase()
      );
      if (tagName === 'select') {
        await relationshipInput.selectOption(guardianForm.relationship);
      } else {
        await relationshipInput.fill(guardianForm.relationship);
      }
    }

    const phoneInput = page
      .locator(
        'input[name="phone"], input[type="tel"], [data-testid="guardian-phone"]'
      )
      .first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(guardianForm.phone);
    }

    await page.screenshot({
      path: 'tests/screenshots/journey-10-add-guardian-form.png',
      fullPage: true,
    });

    // Save guardian
    const saveGuardianButton = page
      .locator(
        'button:has-text("Save"), button:has-text("Add"), button[type="submit"], [data-testid="save-guardian"]'
      )
      .first();
    await saveGuardianButton.click();

    // Verify guardian appears in list
    await page.waitForTimeout(2000);
    const guardiansList = page.locator(
      '[data-testid="guardians-list"], .guardian-card, .person-card'
    );
    const guardianItem = guardiansList.locator(`text="${guardianForm.name}"`);
    await expect(guardianItem).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/journey-11-guardian-added.png',
      fullPage: true,
    });

    // console.error('✅ Guardian added to Circle of Trust');
  });

  test('Act 3: Journey Complete - Sign Out', async () => {
    // Look for Clerk UserButton
    const userButton = page
      .locator(
        '.cl-userButton-trigger, [data-clerk-id="clerk-user-button"], [data-testid="user-menu"]'
      )
      .first();
    await expect(userButton).toBeVisible();

    // Click user button to open menu
    await userButton.click();

    // Wait for dropdown menu
    await page.waitForTimeout(500);

    // Click Sign Out
    const signOutButton = page
      .locator(
        'button:has-text("Sign out"), button:has-text("Log out"), [data-testid="sign-out"]'
      )
      .first();
    await expect(signOutButton).toBeVisible();
    await signOutButton.click();

    // Wait for redirect to sign-in page
    await page.waitForURL(/\/sign-in|\/login|^\/$/, { timeout: 10000 });

    // Verify we're back at the authentication page
    const authForm = page
      .locator('.cl-component, [data-testid="auth-form"], form[action*="sign"]')
      .first();
    await expect(authForm).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/journey-12-signed-out.png',
      fullPage: true,
    });

    // console.error('✅ User successfully signed out');
    // console.error('🎉 Guardian Journey Complete! User:', testUser.email);
  });
});

// Additional test for returning user experience
test.describe('🔄 Returning Guardian Experience', () => {
  test('Returning user sees personalized dashboard', async ({ page }) => {
    // This test would verify that a returning user
    // sees their progress and personalized content

    await page.goto('/');
    await waitForClerk(page);

    // Sign in with existing test user credentials
    // (This would need actual test credentials)

    // Verify personalized elements:
    // - Completed milestones
    // - Next suggested tasks
    // - Document count
    // - Guardian count

    // console.error('✅ Returning user experience verified');
  });
});

// Performance and reliability checks
test.describe('🏃 Performance Metrics', () => {
  test('Critical user actions complete within acceptable time', async ({
    page,
  }) => {
    const metrics: Array<{ action: string; time: number }> = [];

    // Measure page load time
    await page.goto('/');
    const loadTime = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return navigation.loadEventEnd - navigation.fetchStart;
    });

    metrics.push({ action: 'Page Load', time: loadTime });

    // Log performance metrics
    // console.table(metrics);

    // Assert performance thresholds
    expect(loadTime).toBeLessThan(3000); // Page should load within 3 seconds
  });
});
