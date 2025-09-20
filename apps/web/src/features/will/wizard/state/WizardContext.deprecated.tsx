/**
 * @deprecated This file is deprecated and will be removed in a future version.
 *
 * MIGRATION NOTICE:
 * The dual state management system (React Context + Zustand) has been consolidated
 * into a single Zustand store for better consistency and performance.
 *
 * Please migrate to using:
 * import { useWillWizardStore } from '@/lib/store/willWizardStore'
 *
 * Migration Guide:
 *
 * Old usage:
 * const { state, setState, goToStep, saveDraft } = useWizardContext()
 *
 * New usage:
 * const {
 *   formData,
 *   currentStep,
 *   updateFormData,
 *   goToStep,
 *   saveDraft
 * } = useWillWizardStore()
 *
 * Benefits of migration:
 * - Single source of truth
 * - Better performance (no duplicate state)
 * - Consistent validation
 * - Improved auto-save behavior
 * - Better error handling
 * - Type safety
 *
 * TODO: Remove this file after all components have been migrated
 */

// Re-export the old context temporarily for backward compatibility
export * from './WizardContext'

console.warn(
  'WizardContext is deprecated. Please migrate to useWillWizardStore. ' +
  'See WizardContext.deprecated.tsx for migration guide.'
)