import { test, expect } from '@playwright/test'

// End-to-end smoke for onboarding flow: steps 1 -> 4
// Note: Requires NEXT_PUBLIC_ENABLE_ONBOARDING=true when running dev server.

test('onboarding flow: step through 1 -> 4 (en)', async ({ page }) => {
  await page.goto('/en/onboarding');

  // If feature flag is off, skip gracefully
  if ((await page.title()).includes('404') || page.url().includes('/404')) {
    test.skip(true, 'Onboarding flag disabled; skipping full flow test');
  }

  // Scene 1: Begin
  const begin = page.getByRole('button', { name: /begin/i });
  await expect(begin).toBeVisible();
  await begin.click();

  // Scene 2: Fill textarea and Continue
  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible();
  await textarea.fill("house keys, letter for my daughter, recipe");
  const cont1 = page.getByRole('button', { name: /continue/i });
  await expect(cont1).toBeVisible();
  await cont1.click();

  // Scene 3: Fill input and Continue
  const input = page.locator('input').first();
  await expect(input).toBeVisible();
  await input.fill('John');
  const cont2 = page.getByRole('button', { name: /continue/i });
  await expect(cont2).toBeVisible();
  await cont2.click();

  // Scene 4: Finish
  const finish = page.getByRole('button', { name: /finish/i });
  await expect(finish).toBeVisible();
  await finish.click();

  // Best-effort: give time for completion side-effects (analytics, storage cleanup)
  await page.waitForTimeout(200);
});
