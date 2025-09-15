import { test, expect } from '@playwright/test'

// Minimal happy-path e2e for CZ and SK, Typed form
// Assumes dev server running at http://localhost:3000

test.describe('Will Wizard (CZ/SK) happy path', () => {
  for (const jurisdiction of ['CZ', 'SK'] as const) {
    test(`happy path for ${jurisdiction}`, async ({ page }) => {
      await page.goto('/will/wizard/start')

      // Start step
      await page.selectOption('#jurisdiction', jurisdiction)
      await page.selectOption('#language', 'en')
      await page.selectOption('#form', 'typed')
      await page.getByRole('button', { name: 'Next' }).click()

      // Testator step
      await page.getByLabel('Full legal name').fill('John Doe')
      await page.getByLabel('Age').fill('30')
      await page.getByLabel('Address').fill('123 Main St, Prague')
      await page.getByRole('button', { name: 'Next' }).click()

      // Beneficiaries
      await page.getByRole('button', { name: 'Add beneficiary' }).click()
      await page.getByLabel('Beneficiary name').fill('Jane Doe')
      await page.getByLabel('Relationship').fill('sibling')
      await page.getByRole('button', { name: 'Next' }).click()

      // Executor (optional)
      await page.getByLabel('Executor name').fill('Bob Smith')
      await page.getByRole('button', { name: 'Next' }).click()

      // Witnesses
      await page.getByText('Signatures').waitFor()
      await page.getByLabel('I, the testator, will sign the will').check()
      await page.getByLabel('Witnesses will sign the will').check()
      await page.getByRole('button', { name: 'Add witness' }).click()
      await page.getByLabel('Witness name').first().fill('Witness One')
      await page.getByRole('button', { name: 'Add witness' }).click()
      await page.getByLabel('Witness name').nth(1).fill('Witness Two')
      await page.getByRole('button', { name: 'Next' }).click()

      // Review
      await expect(page.getByText('Draft preview')).toBeVisible()
      // Ensure no blocking validation errors shown
      const errorsBlock = page.getByText('Validation errors')
      await expect(errorsBlock).toHaveCount(0)
    })
  }
})