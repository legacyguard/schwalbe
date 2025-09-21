// Will Validation Service - Pure Business Logic
// Extracted from UI components to follow Clean Architecture principles

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface WillFormData {
  form: 'simple' | 'holographic' | 'complex'
  testator: {
    fullName: string
    age: number
    address: string
    email?: string
  }
  beneficiaries: Array<{
    id: string
    name: string
    relationship: string
    share: number
    contingent?: boolean
  }>
  executors: Array<{
    id: string
    name: string
    email: string
    phone: string
    relationship: string
  }>
  witnesses?: Array<{
    id: string
    name: string
    email: string
    phone: string
  }>
  guardians?: Array<{
    id: string
    name: string
    relationship: string
    children: string[]
  }>
  assets?: Array<{
    id: string
    type: string
    description: string
    value?: number
    beneficiary: string
  }>
  specialInstructions?: string
}

export type WizardStepKey = 'testator' | 'beneficiaries' | 'executors' | 'witnesses' | 'guardians' | 'assets' | 'review'

/**
 * Will Validation Service
 * Contains all business rules for will validation extracted from UI components
 */
export class WillValidationService {

  /**
   * Validate step transition - checks if user can move from current to next step
   */
  validateStepTransition(
    currentStep: WizardStepKey,
    nextStep: WizardStepKey,
    formData: WillFormData
  ): ValidationResult {

    const stepValidations: Record<WizardStepKey, () => ValidationResult> = {
      testator: () => this.validateTestatorStep(formData),
      beneficiaries: () => this.validateBeneficiariesStep(formData),
      executors: () => this.validateExecutorsStep(formData),
      witnesses: () => this.validateWitnessesStep(formData),
      guardians: () => this.validateGuardiansStep(formData),
      assets: () => this.validateAssetsStep(formData),
      review: () => this.validateReviewStep(formData)
    }

    // Validate current step before allowing transition
    const currentStepValidation = stepValidations[currentStep]()
    if (!currentStepValidation.isValid) {
      return {
        isValid: false,
        errors: [`Cannot proceed from ${currentStep} step:`, ...currentStepValidation.errors]
      }
    }

    return { isValid: true, errors: [] }
  }

  /**
   * Validate complete will form
   */
  validateCompleteWill(formData: WillFormData): ValidationResult {
    const results = [
      this.validateTestatorStep(formData),
      this.validateBeneficiariesStep(formData),
      this.validateExecutorsStep(formData),
      this.validateWitnessesStep(formData),
      this.validateGuardiansStep(formData),
      this.validateAssetsStep(formData)
    ]

    const allErrors = results.flatMap(r => r.errors)
    const allWarnings = results.flatMap(r => r.warnings || [])

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  }

  private validateTestatorStep(formData: WillFormData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const { testator, form } = formData

    // Required fields
    if (!testator.fullName?.trim()) {
      errors.push('Full name is required')
    } else if (testator.fullName.length < 2) {
      errors.push('Full name must be at least 2 characters')
    } else if (testator.fullName.length > 100) {
      errors.push('Full name must be less than 100 characters')
    }

    if (!testator.address?.trim()) {
      errors.push('Address is required')
    } else if (testator.address.length > 500) {
      errors.push('Address must be less than 500 characters')
    }

    // Age validation based on will type
    const minAge = form === 'holographic' ? 15 : 18
    if (!testator.age) {
      errors.push('Age is required')
    } else if (testator.age < minAge) {
      errors.push(`Age must be at least ${minAge} for ${form} will`)
    } else if (testator.age > 150) {
      errors.push('Please enter a valid age')
    }

    // Email validation (optional)
    if (testator.email && !this.isValidEmail(testator.email)) {
      errors.push('Please enter a valid email address')
    }

    // Warnings
    if (testator.age && testator.age < 21) {
      warnings.push('Consider consulting with a legal advisor for wills created at a young age')
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateBeneficiariesStep(formData: WillFormData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const { beneficiaries } = formData

    if (!beneficiaries || beneficiaries.length === 0) {
      errors.push('At least one beneficiary is required')
      return { isValid: false, errors }
    }

    // Validate each beneficiary
    beneficiaries.forEach((beneficiary, index) => {
      const prefix = `Beneficiary ${index + 1}:`

      if (!beneficiary.name?.trim()) {
        errors.push(`${prefix} Name is required`)
      }

      if (!beneficiary.relationship?.trim()) {
        errors.push(`${prefix} Relationship is required`)
      }

      if (beneficiary.share === undefined || beneficiary.share < 0 || beneficiary.share > 100) {
        errors.push(`${prefix} Share must be between 0 and 100 percent`)
      }
    })

    // Check total shares
    const totalShares = beneficiaries.reduce((sum, b) => sum + (b.share || 0), 0)
    if (Math.abs(totalShares - 100) > 0.01) {
      errors.push(`Total beneficiary shares must equal 100% (currently ${totalShares.toFixed(1)}%)`)
    }

    // Check for duplicate names
    const names = beneficiaries.map(b => b.name?.toLowerCase().trim()).filter(Boolean)
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
    if (duplicates.length > 0) {
      warnings.push('Some beneficiaries have similar names - please verify this is intentional')
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateExecutorsStep(formData: WillFormData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const { executors } = formData

    if (!executors || executors.length === 0) {
      errors.push('At least one executor is required')
      return { isValid: false, errors }
    }

    if (executors.length > 3) {
      warnings.push('Having more than 3 executors can complicate estate administration')
    }

    // Validate each executor
    executors.forEach((executor, index) => {
      const prefix = `Executor ${index + 1}:`

      if (!executor.name?.trim()) {
        errors.push(`${prefix} Name is required`)
      }

      if (!executor.email?.trim()) {
        errors.push(`${prefix} Email is required`)
      } else if (!this.isValidEmail(executor.email)) {
        errors.push(`${prefix} Please enter a valid email address`)
      }

      if (!executor.phone?.trim()) {
        errors.push(`${prefix} Phone number is required`)
      } else if (!this.isValidPhone(executor.phone)) {
        errors.push(`${prefix} Please enter a valid phone number`)
      }

      if (!executor.relationship?.trim()) {
        errors.push(`${prefix} Relationship is required`)
      }
    })

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateWitnessesStep(formData: WillFormData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const { witnesses, form } = formData

    // Holographic wills don't require witnesses
    if (form === 'holographic') {
      return { isValid: true, errors: [], warnings }
    }

    if (!witnesses || witnesses.length < 2) {
      errors.push('At least 2 witnesses are required for this type of will')
      return { isValid: false, errors }
    }

    if (witnesses.length > 3) {
      warnings.push('While more than 2 witnesses is allowed, it may complicate the signing process')
    }

    // Validate each witness
    witnesses.forEach((witness, index) => {
      const prefix = `Witness ${index + 1}:`

      if (!witness.name?.trim()) {
        errors.push(`${prefix} Name is required`)
      }

      if (!witness.email?.trim()) {
        errors.push(`${prefix} Email is required`)
      } else if (!this.isValidEmail(witness.email)) {
        errors.push(`${prefix} Please enter a valid email address`)
      }

      if (!witness.phone?.trim()) {
        errors.push(`${prefix} Phone number is required`)
      } else if (!this.isValidPhone(witness.phone)) {
        errors.push(`${prefix} Please enter a valid phone number`)
      }
    })

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateGuardiansStep(formData: WillFormData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const { guardians } = formData

    // Guardians are optional if no minor children
    if (!guardians || guardians.length === 0) {
      return { isValid: true, errors: [], warnings }
    }

    // Validate each guardian
    guardians.forEach((guardian, index) => {
      const prefix = `Guardian ${index + 1}:`

      if (!guardian.name?.trim()) {
        errors.push(`${prefix} Name is required`)
      }

      if (!guardian.relationship?.trim()) {
        errors.push(`${prefix} Relationship is required`)
      }

      if (!guardian.children || guardian.children.length === 0) {
        errors.push(`${prefix} At least one child must be assigned`)
      }
    })

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateAssetsStep(formData: WillFormData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const { assets } = formData

    // Assets are optional for simple wills
    if (!assets || assets.length === 0) {
      return { isValid: true, errors: [], warnings }
    }

    // Validate each asset
    assets.forEach((asset, index) => {
      const prefix = `Asset ${index + 1}:`

      if (!asset.type?.trim()) {
        errors.push(`${prefix} Type is required`)
      }

      if (!asset.description?.trim()) {
        errors.push(`${prefix} Description is required`)
      }

      if (!asset.beneficiary?.trim()) {
        errors.push(`${prefix} Beneficiary is required`)
      }

      if (asset.value !== undefined && asset.value < 0) {
        errors.push(`${prefix} Value cannot be negative`)
      }
    })

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateReviewStep(formData: WillFormData): ValidationResult {
    // Review step just validates the entire will
    return this.validateCompleteWill(formData)
  }

  // Utility validation methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 320
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }

  /**
   * Get next allowed steps based on current progress
   */
  getNextAllowedSteps(currentStep: WizardStepKey, formData: WillFormData): WizardStepKey[] {
    const stepOrder: WizardStepKey[] = ['testator', 'beneficiaries', 'executors', 'witnesses', 'guardians', 'assets', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)

    if (currentIndex === -1) return []

    const allowedSteps: WizardStepKey[] = []

    // Can always go back to previous steps
    for (let i = 0; i < currentIndex; i++) {
      const step = stepOrder[i]
      if (step) {
        allowedSteps.push(step)
      }
    }

    // Can go forward if current step is valid
    const nextStep = stepOrder[currentIndex + 1]
    if (nextStep) {
      const currentValidation = this.validateStepTransition(currentStep, nextStep, formData)
      if (currentValidation.isValid && currentIndex < stepOrder.length - 1) {
        allowedSteps.push(nextStep)
      }
    }

    return allowedSteps
  }

  /**
   * Calculate will completion percentage
   */
  getCompletionPercentage(formData: WillFormData): number {
    const stepValidations = [
      this.validateTestatorStep(formData),
      this.validateBeneficiariesStep(formData),
      this.validateExecutorsStep(formData),
      this.validateWitnessesStep(formData),
      this.validateGuardiansStep(formData),
      this.validateAssetsStep(formData)
    ]

    const completedSteps = stepValidations.filter(v => v.isValid).length
    return Math.round((completedSteps / stepValidations.length) * 100)
  }
}

// Export singleton instance
export const willValidationService = new WillValidationService()