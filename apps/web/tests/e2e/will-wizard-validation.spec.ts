import { test, expect } from '@playwright/test'

test.describe('Will Wizard - Validation and User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/will/wizard/start')
  })

  test('should prevent navigation without required fields', async ({ page }) => {
    // Try to click Next without filling required fields
    const nextButton = page.getByRole('button', { name: 'Next' })

    // Should be disabled initially
    await expect(nextButton).toBeDisabled()

    // Should show validation errors
    await expect(page.getByText('Required to continue:')).toBeVisible()
    await expect(page.getByText('Jurisdiction is required')).toBeVisible()
    await expect(page.getByText('Will form is required')).toBeVisible()
  })

  test('should validate testator step requirements', async ({ page }) => {
    // Complete start step
    await page.selectOption('#jurisdiction', 'CZ')
    await page.selectOption('#form', 'typed')
    await page.getByRole('button', { name: 'Next' }).click()

    // Now on testator step - try to proceed without filling fields
    const nextButton = page.getByRole('button', { name: 'Next' })
    await expect(nextButton).toBeDisabled()

    // Should show validation errors
    await expect(page.getByText('Full name is required')).toBeVisible()
    await expect(page.getByText('Address is required')).toBeVisible()
    await expect(page.getByText('Age must be at least 18 for typed will')).toBeVisible()

    // Fill partial info
    await page.getByLabel('Full legal name').fill('John Doe')
    await expect(page.getByText('Full name is required')).not.toBeVisible()
    await expect(nextButton).toBeDisabled()

    // Fill address
    await page.getByLabel('Address').fill('123 Main St')
    await expect(page.getByText('Address is required')).not.toBeVisible()
    await expect(nextButton).toBeDisabled()

    // Fill invalid age
    await page.getByLabel('Age').fill('17')
    await expect(page.getByText('Age must be at least 18 for typed will')).toBeVisible()
    await expect(nextButton).toBeDisabled()

    // Fix age
    await page.getByLabel('Age').fill('25')
    await expect(page.getByText('Age must be at least 18 for typed will')).not.toBeVisible()
    await expect(nextButton).not.toBeDisabled()
  })

  test('should validate beneficiary requirements', async ({ page }) => {
    // Navigate to beneficiaries step
    await page.selectOption('#jurisdiction', 'CZ')
    await page.selectOption('#form', 'typed')
    await page.getByRole('button', { name: 'Next' }).click()

    await page.getByLabel('Full legal name').fill('John Doe')
    await page.getByLabel('Address').fill('123 Main St')
    await page.getByLabel('Age').fill('25')
    await page.getByRole('button', { name: 'Next' }).click()

    // Should require at least one beneficiary
    const nextButton = page.getByRole('button', { name: 'Next' })
    await expect(nextButton).toBeDisabled()
    await expect(page.getByText('At least one beneficiary is required')).toBeVisible()

    // Add beneficiary
    await page.getByRole('button', { name: 'Add beneficiary' }).click()
    await page.getByLabel('Beneficiary name').fill('Jane Doe')

    // Should now be able to proceed
    await expect(page.getByText('At least one beneficiary is required')).not.toBeVisible()
    await expect(nextButton).not.toBeDisabled()
  })

  test('should validate witness requirements and conflicts', async ({ page }) => {
    // Navigate to witnesses step
    await page.selectOption('#jurisdiction', 'CZ')
    await page.selectOption('#form', 'typed')
    await page.getByRole('button', { name: 'Next' }).click()

    await page.getByLabel('Full legal name').fill('John Doe')
    await page.getByLabel('Address').fill('123 Main St')
    await page.getByLabel('Age').fill('25')
    await page.getByRole('button', { name: 'Next' }).click()

    await page.getByRole('button', { name: 'Add beneficiary' }).click()
    await page.getByLabel('Beneficiary name').fill('Jane Doe')
    await page.getByRole('button', { name: 'Next' }).click()

    // Skip executor
    await page.getByRole('button', { name: 'Next' }).click()

    // Now on witnesses step
    const nextButton = page.getByRole('button', { name: 'Next' })
    await expect(nextButton).toBeDisabled()

    // Should require signatures for typed will
    await expect(page.getByText('Testator signature confirmation is required')).toBeVisible()
    await expect(page.getByText('Witness signatures confirmation is required')).toBeVisible()
    await expect(page.getByText('At least 2 witnesses are required for typed will')).toBeVisible()

    // Add signature confirmations
    await page.getByLabel('I, the testator, will sign the will').check()
    await page.getByLabel('Witnesses will sign the will').check()

    // Add first witness
    await page.getByRole('button', { name: 'Add witness' }).click()
    await page.getByLabel('Witness name').first().fill('Jane Doe') // Same as beneficiary

    // Should detect conflict
    await expect(page.getByText('Witnesses cannot be beneficiaries')).toBeVisible()
    await expect(nextButton).toBeDisabled()

    // Fix by changing witness name
    await page.getByLabel('Witness name').first().fill('Bob Smith')
    await expect(page.getByText('Witnesses cannot be beneficiaries')).not.toBeVisible()

    // Still need second witness
    await expect(page.getByText('At least 2 witnesses are required for typed will')).toBeVisible()
    await expect(nextButton).toBeDisabled()

    // Add second witness
    await page.getByRole('button', { name: 'Add witness' }).click()
    await page.getByLabel('Witness name').nth(1).fill('Alice Johnson')

    // Should now be valid
    await expect(page.getByText('At least 2 witnesses are required for typed will')).not.toBeVisible()
    await expect(nextButton).not.toBeDisabled()
  })

  test('should show step guidance and allow expanding/collapsing', async ({ page }) => {
    // Step guidance should be visible
    await expect(page.getByText('Getting Started - Step Guidance')).toBeVisible()

    // Should be collapsible
    const guidanceButton = page.getByRole('button', { name: /Getting Started - Step Guidance/ })
    await guidanceButton.click()

    // Should show expanded content
    await expect(page.getByText('Choose your jurisdiction, language, and will format')).toBeVisible()
    await expect(page.getByText('Tips for Success:')).toBeVisible()
    await expect(page.getByText('Common Mistakes to Avoid:')).toBeVisible()

    // Should be able to collapse
    await guidanceButton.click()
    await expect(page.getByText('Choose your jurisdiction, language, and will format')).not.toBeVisible()
  })

  test('should persist progress in localStorage for unauthenticated users', async ({ page }) => {
    // Fill some data
    await page.selectOption('#jurisdiction', 'SK')
    await page.selectOption('#form', 'holographic')
    await page.getByRole('button', { name: 'Next' }).click()

    await page.getByLabel('Full legal name').fill('Test User')
    await page.getByLabel('Address').fill('Test Address')
    await page.getByLabel('Age').fill('20')

    // Refresh page
    await page.reload()

    // Should maintain state
    await expect(page.getByLabel('Full legal name')).toHaveValue('Test User')
    await expect(page.getByLabel('Address')).toHaveValue('Test Address')
    await expect(page.getByLabel('Age')).toHaveValue('20')
  })

  test('should handle holographic will validation differently', async ({ page }) => {
    // Select holographic will
    await page.selectOption('#jurisdiction', 'CZ')
    await page.selectOption('#form', 'holographic')
    await page.getByRole('button', { name: 'Next' }).click()

    // Age requirement should be 15 for holographic
    await page.getByLabel('Full legal name').fill('Young Person')
    await page.getByLabel('Address').fill('Young Address')
    await page.getByLabel('Age').fill('16')

    const nextButton = page.getByRole('button', { name: 'Next' })
    await expect(nextButton).not.toBeDisabled()

    // Navigate to witnesses step via beneficiaries and executor
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Add beneficiary' }).click()
    await page.getByLabel('Beneficiary name').fill('Beneficiary')
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()

    // For holographic will, should not require witnesses or witness signatures
    await page.getByLabel('I, the testator, will sign the will').check()

    // Should be able to proceed without witnesses for holographic will
    const witnessNextButton = page.getByRole('button', { name: 'Next' })
    await expect(witnessNextButton).not.toBeDisabled()
  })
})