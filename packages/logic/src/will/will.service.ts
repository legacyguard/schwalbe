// Will Service - Pure Business Logic for Will Operations
// Extracted from UI components to follow Clean Architecture principles

import { WillFormData, willValidationService } from './validation.service'

export interface WillDraft {
  id: string
  user_id: string
  session_id: string
  form_data: WillFormData
  step: string
  created_at: string
  updated_at: string
  is_complete: boolean
}

export interface SaveWillDraftCommand {
  sessionId: string
  userId: string
  formData: WillFormData
  currentStep: string
}

export interface WillGenerationResult {
  success: boolean
  willId?: string
  documentUrl?: string
  errors?: string[]
}

/**
 * Will Service - Domain Service for Will Operations
 * Contains business logic for will management
 */
export class WillService {

  /**
   * Validate and prepare will data for saving
   */
  prepareDraftForSave(command: SaveWillDraftCommand): {
    isValid: boolean
    draftData?: Partial<WillDraft>
    errors?: string[]
  } {
    const { sessionId, userId, formData, currentStep } = command

    // Validate required fields
    if (!sessionId || !userId) {
      return {
        isValid: false,
        errors: ['Session ID and User ID are required']
      }
    }

    // Basic form data validation
    const validation = willValidationService.validateStepTransition(
      currentStep as any,
      currentStep as any,
      formData
    )

    // Prepare the draft data
    const draftData: Partial<WillDraft> = {
      user_id: userId,
      session_id: sessionId,
      form_data: this.sanitizeFormData(formData),
      step: currentStep,
      updated_at: new Date().toISOString(),
      is_complete: this.isWillComplete(formData)
    }

    return {
      isValid: true,
      draftData,
      errors: validation.errors.length > 0 ? validation.errors : undefined
    }
  }

  /**
   * Check if will is complete and ready for generation
   */
  isWillComplete(formData: WillFormData): boolean {
    const validation = willValidationService.validateCompleteWill(formData)
    return validation.isValid
  }

  /**
   * Generate legal will document from form data
   */
  async generateWillDocument(formData: WillFormData): Promise<WillGenerationResult> {
    // Validate complete will first
    const validation = willValidationService.validateCompleteWill(formData)
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      }
    }

    try {
      // This would integrate with a document generation service
      // For now, return a placeholder
      const willId = `will_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return {
        success: true,
        willId,
        documentUrl: `/api/wills/${willId}/document`
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to generate will document: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }

  /**
   * Calculate will complexity score for pricing/service recommendations
   */
  calculateComplexityScore(formData: WillFormData): {
    score: number
    factors: string[]
    recommendedService: 'diy' | 'assisted' | 'attorney'
  } {
    let score = 0
    const factors: string[] = []

    // Base complexity factors
    if (formData.beneficiaries && formData.beneficiaries.length > 3) {
      score += 2
      factors.push('Multiple beneficiaries')
    }

    if (formData.executors && formData.executors.length > 2) {
      score += 1
      factors.push('Multiple executors')
    }

    if (formData.guardians && formData.guardians.length > 0) {
      score += 2
      factors.push('Minor children guardianship')
    }

    if (formData.assets && formData.assets.length > 5) {
      score += 3
      factors.push('Complex asset distribution')
    }

    if (formData.specialInstructions && formData.specialInstructions.length > 500) {
      score += 2
      factors.push('Detailed special instructions')
    }

    // Asset value complexity
    const totalAssetValue = formData.assets?.reduce((sum, asset) => sum + (asset.value || 0), 0) || 0
    if (totalAssetValue > 100000) {
      score += 3
      factors.push('High-value estate')
    }

    // Determine recommended service
    let recommendedService: 'diy' | 'assisted' | 'attorney'
    if (score <= 3) {
      recommendedService = 'diy'
    } else if (score <= 7) {
      recommendedService = 'assisted'
    } else {
      recommendedService = 'attorney'
    }

    return { score, factors, recommendedService }
  }

  /**
   * Sanitize form data before saving
   */
  private sanitizeFormData(formData: WillFormData): WillFormData {
    return {
      ...formData,
      testator: {
        ...formData.testator,
        fullName: formData.testator.fullName?.trim(),
        address: formData.testator.address?.trim(),
        email: formData.testator.email?.trim()
      },
      beneficiaries: formData.beneficiaries?.map(b => ({
        ...b,
        name: b.name?.trim(),
        relationship: b.relationship?.trim()
      })),
      executors: formData.executors?.map(e => ({
        ...e,
        name: e.name?.trim(),
        email: e.email?.trim(),
        phone: e.phone?.trim(),
        relationship: e.relationship?.trim()
      })),
      witnesses: formData.witnesses?.map(w => ({
        ...w,
        name: w.name?.trim(),
        email: w.email?.trim(),
        phone: w.phone?.trim()
      })),
      guardians: formData.guardians?.map(g => ({
        ...g,
        name: g.name?.trim(),
        relationship: g.relationship?.trim()
      })),
      assets: formData.assets?.map(a => ({
        ...a,
        type: a.type?.trim(),
        description: a.description?.trim(),
        beneficiary: a.beneficiary?.trim()
      })),
      specialInstructions: formData.specialInstructions?.trim()
    }
  }

  /**
   * Generate step-by-step guidance for will creation
   */
  getStepGuidance(step: string, formData: WillFormData): {
    title: string
    description: string
    tips: string[]
    requirements: string[]
    estimatedTime: string
  } {
    const guidance = {
      testator: {
        title: 'Personal Information',
        description: 'Provide your basic personal information as the person creating this will.',
        tips: [
          'Use your full legal name as it appears on official documents',
          'Provide your primary residence address',
          'Double-check all information for accuracy'
        ],
        requirements: ['Full legal name', 'Current address', 'Age verification'],
        estimatedTime: '2-3 minutes'
      },
      beneficiaries: {
        title: 'Beneficiaries',
        description: 'Choose who will inherit your assets and what percentage each will receive.',
        tips: [
          'Percentages must add up to 100%',
          'Consider contingent beneficiaries',
          'Be specific about relationships',
          'Consider what happens if a beneficiary predeceases you'
        ],
        requirements: ['At least one beneficiary', 'Total shares equal 100%'],
        estimatedTime: '5-10 minutes'
      },
      executors: {
        title: 'Executors',
        description: 'Select trusted individuals who will manage your estate after your passing.',
        tips: [
          'Choose someone reliable and organized',
          'Consider appointing a backup executor',
          'Ensure they are willing to serve',
          'They should be comfortable with financial responsibilities'
        ],
        requirements: ['At least one executor', 'Valid contact information'],
        estimatedTime: '3-5 minutes'
      }
      // Add more steps as needed
    }

    return guidance[step as keyof typeof guidance] || {
      title: 'Step',
      description: 'Complete this section of your will.',
      tips: [],
      requirements: [],
      estimatedTime: '5 minutes'
    }
  }

  /**
   * Estimate total time to complete will based on complexity
   */
  estimateCompletionTime(formData: WillFormData): {
    totalMinutes: number
    breakdown: Record<string, number>
  } {
    const complexity = this.calculateComplexityScore(formData)

    const baseMinutes = {
      testator: 3,
      beneficiaries: 8,
      executors: 5,
      witnesses: 4,
      guardians: 6,
      assets: 10,
      review: 5
    }

    // Adjust based on complexity
    const multiplier = complexity.score <= 3 ? 1 : complexity.score <= 7 ? 1.5 : 2

    const adjustedBreakdown = Object.fromEntries(
      Object.entries(baseMinutes).map(([step, minutes]) => [step, Math.round(minutes * multiplier)])
    )

    const totalMinutes = Object.values(adjustedBreakdown).reduce((sum, minutes) => sum + minutes, 0)

    return {
      totalMinutes,
      breakdown: adjustedBreakdown
    }
  }
}

// Export singleton instance
export const willService = new WillService()