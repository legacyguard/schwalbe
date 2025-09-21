import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useWizard } from '../state/WizardContext';
import { useFocusManagement, useAnnouncer } from '@/hooks/useAccessibility';
import { useCombinedValidation, validationRules } from '@/hooks/useValidation';
import { FormField } from '@/components/ui/AccessibleForm';
import { Button, SubmitButton } from '@/components/ui/Button';
import { ErrorMessage, FormError } from '@/components/ui/ErrorMessage';

interface StepStartData {
  jurisdiction: 'CZ' | 'SK';
  language: 'en' | 'cs' | 'sk';
  form: 'typed' | 'holographic';
}

export function StepStartRefactored() {
  const { state, setState, goNext } = useWizard();
  const { t } = useTranslation('will/wizard');
  const { setFocus } = useFocusManagement();
  const { announce } = useAnnouncer();
  const firstFieldRef = useRef<HTMLSelectElement>(null);

  // Initialize validation with rules
  const {
    data,
    errors,
    isValid,
    setValue,
    handleSubmit
  } = useCombinedValidation<StepStartData>(
    {
      jurisdiction: state.jurisdiction,
      language: state.language,
      form: state.form
    },
    {
      jurisdiction: [validationRules.required('Please select a jurisdiction')],
      language: [validationRules.required('Please select a language')],
      form: [validationRules.required('Please select a will type')]
    }
  );

  // Set focus to first field when component mounts
  useEffect(() => {
    if (firstFieldRef.current) {
      setFocus(firstFieldRef.current);
    }
  }, [setFocus]);

  // Sync form data with wizard state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      jurisdiction: data.jurisdiction,
      language: data.language,
      form: data.form
    }));
  }, [data, setState]);

  const jurisdictionOptions = [
    { value: 'CZ', label: t('options.jurisdictions.CZ') },
    { value: 'SK', label: t('options.jurisdictions.SK') }
  ];

  const languageOptions = [
    { value: 'en', label: t('options.languages.en') },
    { value: 'cs', label: t('options.languages.cs') },
    { value: 'sk', label: t('options.languages.sk') }
  ];

  const formOptions = [
    { value: 'typed', label: t('options.forms.typed') },
    { value: 'holographic', label: t('options.forms.holographic') }
  ];

  const onSubmit = async (formData: StepStartData) => {
    announce('Moving to next step', 'polite');
    goNext();
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="sr-only">
        <h2 id="wizard-start-heading">Will Creation - Basic Information</h2>
        <p id="start-description">
          Please provide the basic information for your will creation. All fields are required.
        </p>
      </div>

      {/* Info Section */}
      <div
        className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4"
        role="region"
        aria-labelledby="start-hint-heading"
      >
        <h3 id="start-hint-heading" className="text-blue-300 font-medium text-sm mb-2">
          Getting Started
        </h3>
        <p className="text-blue-200 text-sm">{t('hints.startInfo')}</p>
      </div>

      {/* Form */}
      <form
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        role="form"
        aria-labelledby="wizard-start-heading"
        aria-describedby="start-description"
        noValidate
      >
        {/* Form-level Errors */}
        {Object.keys(errors).length > 0 && (
          <FormError
            error={Object.values(errors).filter(Boolean)}
            title="Please complete all required fields:"
          />
        )}

        {/* Jurisdiction Field */}
        <FormField
          label={t('labels.jurisdiction')}
          help="Select the legal jurisdiction where your will should be valid"
          error={errors.jurisdiction}
          required
        >
          <select
            ref={firstFieldRef}
            value={data.jurisdiction}
            onChange={(e) => setValue('jurisdiction', e.target.value as 'CZ' | 'SK')}
            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Legal jurisdiction for your will"
          >
            {jurisdictionOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Language Field */}
        <FormField
          label={t('labels.language')}
          help="Choose the language for your will document"
          error={errors.language}
          required
        >
          <select
            value={data.language}
            onChange={(e) => setValue('language', e.target.value as 'en' | 'cs' | 'sk')}
            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Language for will document"
          >
            {languageOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Form Type Field */}
        <FormField
          label={t('labels.form')}
          help="Typed wills require witnesses, holographic wills are handwritten and require no witnesses"
          error={errors.form}
          required
        >
          <select
            value={data.form}
            onChange={(e) => setValue('form', e.target.value as 'typed' | 'holographic')}
            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Type of will to create"
          >
            {formOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Submit Button */}
        <div className="pt-4">
          <SubmitButton
            variant="primary"
            size="md"
            disabled={!isValid}
            aria-describedby={!isValid ? 'submit-help' : undefined}
          >
            {t('actions.next')}
          </SubmitButton>

          {!isValid && (
            <p id="submit-help" className="mt-2 text-sm text-red-300">
              Please complete all required fields to continue
            </p>
          )}
        </div>
      </form>
    </div>
  );
}