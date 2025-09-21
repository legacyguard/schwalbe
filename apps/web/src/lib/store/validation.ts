/**
 * State Validation System
 * Provides comprehensive validation for all state slices
 */

import { logger } from '@schwalbe/shared'
import type {
  UserPreferences,
  AppStateSlice,
  WizardStateSlice,
  AssetsStateSlice,
  StateValidationRule
} from './types'

import type { WizardState } from '@/features/will/wizard/state/WizardContext'

// Validation Schemas
export const userPreferencesValidation: StateValidationRule<UserPreferences>[] = [
  {
    field: 'language',
    validator: (value) => ['en', 'cs', 'sk'].includes(value),
    message: 'Language must be one of: en, cs, sk'
  },
  {
    field: 'currency',
    validator: (value) => typeof value === 'string' && value.length === 3,
    message: 'Currency must be a 3-letter code'
  },
  {
    field: 'theme',
    validator: (value) => ['light', 'dark', 'system'].includes(value),
    message: 'Theme must be light, dark, or system'
  },
  {
    field: 'timezone',
    validator: (value) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value })
        return true
      } catch {
        return false
      }
    },
    message: 'Invalid timezone'
  },
  {
    field: 'notifications',
    validator: (value) => {
      return value &&
        typeof value.email === 'boolean' &&
        typeof value.push === 'boolean' &&
        typeof value.reminders === 'boolean' &&
        typeof value.marketing === 'boolean'
    },
    message: 'Notifications preferences must be boolean values'
  }
]

export const wizardStateValidation: StateValidationRule<WizardState>[] = [
  {
    field: 'jurisdiction',
    validator: (value) => ['CZ', 'SK'].includes(value),
    message: 'Jurisdiction must be CZ or SK'
  },
  {
    field: 'language',
    validator: (value) => ['en', 'cs', 'sk'].includes(value),
    message: 'Language must be en, cs, or sk'
  },
  {
    field: 'form',
    validator: (value) => ['typed', 'holographic'].includes(value),
    message: 'Form must be typed or holographic'
  },
  {
    field: 'testator',
    validator: (value, state) => {
      if (!value.fullName?.trim()) return 'Testator name is required'
      if (!value.address?.trim()) return 'Testator address is required'

      const minAge = state.form === 'holographic' ? 15 : 18
      if (!value.age || value.age < minAge) {
        return `Testator must be at least ${minAge} years old for ${state.form} will`
      }

      return true
    }
  },
  {
    field: 'beneficiaries',
    validator: (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return 'At least one beneficiary is required'
      }

      for (const beneficiary of value) {
        if (!beneficiary.name?.trim()) {
          return 'All beneficiaries must have a name'
        }
      }

      return true
    }
  },
  {
    field: 'witnesses',
    validator: (value, state) => {
      if (state.form === 'holographic') return true

      if (!Array.isArray(value) || value.length < 2) {
        return 'Typed wills require at least 2 witnesses'
      }

      // Check for witness-beneficiary conflicts
      const beneficiaryNames = state.beneficiaries.map(b => b.name.toLowerCase().trim())
      const conflictingWitnesses = value.filter(w =>
        beneficiaryNames.includes(w.fullName.toLowerCase().trim())
      )

      if (conflictingWitnesses.length > 0) {
        return 'Witnesses cannot be beneficiaries'
      }

      return true
    }
  }
]

// Validation Engine
export class StateValidator {
  private static instance: StateValidator

  private constructor() {}

  public static getInstance(): StateValidator {
    if (!StateValidator.instance) {
      StateValidator.instance = new StateValidator()
    }
    return StateValidator.instance
  }

  /**
   * Validate a single field against its rules
   */
  public validateField<T>(
    field: keyof T,
    value: any,
    state: T,
    rules: StateValidationRule<T>[]
  ): { isValid: boolean; errors: string[] } {
    const fieldRules = rules.filter(rule => rule.field === field)
    const errors: string[] = []

    for (const rule of fieldRules) {
      const result = rule.validator(value, state)

      if (result !== true) {
        const errorMessage = typeof result === 'string'
          ? result
          : rule.message || `Validation failed for ${String(field)}`
        errors.push(errorMessage)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate entire state object
   */
  public validateState<T>(
    state: T,
    rules: StateValidationRule<T>[]
  ): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {}

    // Group rules by field
    const rulesByField = new Map<keyof T, StateValidationRule<T>[]>()
    for (const rule of rules) {
      if (!rulesByField.has(rule.field)) {
        rulesByField.set(rule.field, [])
      }
      rulesByField.get(rule.field)!.push(rule)
    }

    // Validate each field
    for (const [field, fieldRules] of rulesByField) {
      const value = state[field]
      const validation = this.validateField(field, value, state, fieldRules)

      if (!validation.isValid) {
        errors[String(field)] = validation.errors
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Validate state transition
   */
  public validateTransition<T>(
    currentState: T,
    nextState: Partial<T>,
    rules: StateValidationRule<T>[]
  ): { isValid: boolean; errors: Record<string, string[]>; warnings: string[] } {
    const mergedState = { ...currentState, ...nextState }
    const validation = this.validateState(mergedState, rules)
    const warnings: string[] = []

    // Check for potentially dangerous transitions
    const changedFields = Object.keys(nextState) as (keyof T)[]

    for (const field of changedFields) {
      const oldValue = currentState[field]
      const newValue = nextState[field]

      // Warn about data loss
      if (Array.isArray(oldValue) && Array.isArray(newValue) && newValue.length < oldValue.length) {
        warnings.push(`Removing ${oldValue.length - newValue.length} items from ${String(field)}`)
      }

      // Warn about clearing important fields
      if (oldValue && !newValue && ['testator', 'beneficiaries'].includes(String(field))) {
        warnings.push(`Clearing important field: ${String(field)}`)
      }
    }

    return {
      ...validation,
      warnings
    }
  }

  /**
   * Auto-fix common validation errors
   */
  public autoFix<T>(
    state: T,
    errors: Record<string, string[]>
  ): { fixed: T; remainingErrors: Record<string, string[]> } {
    const fixed = { ...state }
    const remainingErrors: Record<string, string[]> = {}

    for (const [field, fieldErrors] of Object.entries(errors)) {
      let fieldFixed = false

      for (const error of fieldErrors) {
        // Auto-fix common issues
        if (error.includes('is required') && !fixed[field as keyof T]) {
          // Set default values for required fields
          if (field === 'language') {
            (fixed as any)[field] = 'en'
            fieldFixed = true
          } else if (field === 'currency') {
            (fixed as any)[field] = 'USD'
            fieldFixed = true
          } else if (field === 'timezone') {
            (fixed as any)[field] = Intl.DateTimeFormat().resolvedOptions().timeZone
            fieldFixed = true
          }
        }

        // Fix array fields
        if (error.includes('must be an array') && !Array.isArray(fixed[field as keyof T])) {
          (fixed as any)[field] = []
          fieldFixed = true
        }

        // Trim string fields
        if (typeof fixed[field as keyof T] === 'string') {
          const trimmed = ((fixed[field as keyof T]) as string).trim()
          if (trimmed !== fixed[field as keyof T]) {
            (fixed as any)[field] = trimmed
            fieldFixed = true
          }
        }
      }

      if (!fieldFixed) {
        remainingErrors[field] = fieldErrors
      }
    }

    return { fixed, remainingErrors }
  }

  /**
   * Log validation results
   */
  public logValidation(
    context: string,
    validation: { isValid: boolean; errors: Record<string, string[]>; warnings?: string[] }
  ): void {
    if (!validation.isValid) {
      logger.warn(`State validation failed: ${context}`, {
        action: 'state_validation_failed',
        metadata: {
          context,
          errors: validation.errors,
          errorCount: Object.keys(validation.errors).length
        }
      })
    }

    if (validation.warnings && validation.warnings.length > 0) {
      logger.info(`State validation warnings: ${context}`, {
        action: 'state_validation_warnings',
        metadata: {
          context,
          warnings: validation.warnings
        }
      })
    }

    if (validation.isValid && !validation.warnings?.length) {
      logger.debug(`State validation passed: ${context}`, {
        action: 'state_validation_passed',
        metadata: { context }
      })
    }
  }
}

// Export singleton instance
export const stateValidator = StateValidator.getInstance()

// Validation hooks for React components
export function useStateValidation<T>(
  state: T,
  rules: StateValidationRule<T>[],
  options: {
    autoFix?: boolean
    logResults?: boolean
    context?: string
  } = {}
) {
  const { autoFix = false, logResults = true, context = 'unknown' } = options

  const validation = stateValidator.validateState(state, rules)

  // Auto-fix if enabled and there are errors
  let fixedState = state
  let remainingErrors = validation.errors

  if (autoFix && !validation.isValid) {
    const fixResult = stateValidator.autoFix(state, validation.errors)
    fixedState = fixResult.fixed
    remainingErrors = fixResult.remainingErrors
  }

  // Log results if enabled
  if (logResults) {
    stateValidator.logValidation(context, {
      isValid: Object.keys(remainingErrors).length === 0,
      errors: remainingErrors
    })
  }

  return {
    isValid: Object.keys(remainingErrors).length === 0,
    errors: remainingErrors,
    fixedState: autoFix ? fixedState : state,
    hasAutoFixes: autoFix && fixedState !== state
  }
}