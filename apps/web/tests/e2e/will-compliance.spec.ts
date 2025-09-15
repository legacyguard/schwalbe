import { test, expect } from '@playwright/test'

// Verifies real-time compliance triggers and remediation guidance

test.describe('Will Wizard real-time compliance', () => {
  test('shows age error for typed form and clears when fixed', async ({ page }) => {
    await page.goto('/will/wizard/start')

    await page.selectOption('#jurisdiction', 'CZ')
    await page.selectOption('#language', 'en')
    await page.selectOption('#form', 'typed')
    await page.getByRole('button', { name: 'Next' }).click()

    // At testator step, fill values that violate engine rule
    await page.getByLabel('Full legal name').fill('A B')
    await page.getByLabel('Address').fill('Addr')
    await page.getByLabel('Age').fill('16')

    // Real-time banner should show the typed age error immediately
    await expect(page.getByText('Compliance: 1 error')).toBeVisible()
    await expect(page.getByText('Typed will requires testator to be 18 or older')).toBeVisible()

    // Fix the age
    await page.getByLabel('Age').fill('18')

    // Banner should clear error
    await expect(page.getByText('Compliance: No issues detected')).toBeVisible()
  })

  test('witness requirements surface in banner', async ({ page }) => {
    await page.goto('/will/wizard/start')

    await page.selectOption('#jurisdiction', 'CZ')
    await page.selectOption('#language', 'en')
    await page.selectOption('#form', 'typed')
    await page.getByRole('button', { name: 'Next' }).click()

    await page.getByLabel('Full legal name').fill('John Doe')
    await page.getByLabel('Age').fill('30')
    await page.getByLabel('Address').fill('123 Main St')
    await page.getByRole('button', { name: 'Next' }).click()

    await page.getByRole('button', { name: 'Next' }).click() // executor

    // Witnesses step without witnesses or signatures
    await expect(page.getByText('Compliance')).toBeVisible()
    await expect(page.getByText('At least 2 witnesses required')).toBeVisible()

    // Add witnesses and signatures to resolve
    await page.getByLabel('I, the testator, will sign the will').check()
    await page.getByRole('button', { name: 'Add witness' }).click()
    await page.getByLabel('Witness name').first().fill('W1')
    await page.getByRole('button', { name: 'Add witness' }).click()
    await page.getByLabel('Witness name').nth(1).fill('W2')
    await page.getByLabel('Witnesses will sign the will').check()

    await expect(page.getByText('Compliance: No issues detected')).toBeVisible()
  })
})