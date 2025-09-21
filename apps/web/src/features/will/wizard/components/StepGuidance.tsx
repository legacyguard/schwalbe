import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWizard, type WizardStepKey } from '../state/WizardContext'

import { Button } from '@/components/ui/button'

interface StepGuide {
  title: string
  description: string
  tips: string[]
  commonErrors: string[]
}

const stepGuides: Record<WizardStepKey, StepGuide> = {
  start: {
    title: 'Getting Started',
    description: 'Choose your jurisdiction, language, and will format to begin creating your will.',
    tips: [
      'Select the jurisdiction where you plan to execute the will',
      'Choose "Typed" for computer-generated wills or "Holographic" for handwritten wills',
      'Consider local legal requirements for your jurisdiction'
    ],
    commonErrors: [
      'Forgetting to select all required options before proceeding'
    ]
  },
  testator: {
    title: 'Your Information',
    description: 'Provide your personal details as the person creating the will (testator).',
    tips: [
      'Use your full legal name exactly as it appears on official documents',
      'Provide your complete current address',
      'Ensure you meet the minimum age requirement for your jurisdiction and will type'
    ],
    commonErrors: [
      'Using nicknames instead of legal names',
      'Incomplete addresses',
      'Not meeting age requirements (18+ for typed wills, 15+ for holographic in most jurisdictions)'
    ]
  },
  beneficiaries: {
    title: 'Beneficiaries',
    description: 'Specify who will inherit from your estate.',
    tips: [
      'Use full legal names for all beneficiaries',
      'Specify relationships clearly (spouse, child, friend, etc.)',
      'Consider adding contingent beneficiaries in case primary beneficiaries cannot inherit',
      'You must have at least one beneficiary'
    ],
    commonErrors: [
      'Not specifying any beneficiaries',
      'Using unclear or ambiguous names',
      'Forgetting to specify relationships'
    ]
  },
  executor: {
    title: 'Executor',
    description: 'Name someone to manage your estate and carry out your wishes.',
    tips: [
      'Choose someone trustworthy and capable of handling financial and legal matters',
      'Consider naming an alternate executor',
      'The executor should be willing to serve in this role',
      'While optional, having an executor simplifies estate administration'
    ],
    commonErrors: [
      'Not considering the executor\'s willingness or ability to serve'
    ]
  },
  witnesses: {
    title: 'Witnesses and Signatures',
    description: 'For typed wills, you need witnesses to validate your signature.',
    tips: [
      'Typed wills typically require 2 or more witnesses',
      'Witnesses should not be beneficiaries (creates conflict of interest)',
      'Witnesses must be present when you sign the will',
      'Holographic wills generally don\'t require witnesses'
    ],
    commonErrors: [
      'Having beneficiaries serve as witnesses',
      'Not having enough witnesses for typed wills',
      'Forgetting to confirm signature requirements'
    ]
  },
  review: {
    title: 'Review',
    description: 'Review all information before finalizing your will.',
    tips: [
      'Carefully check all names and addresses for accuracy',
      'Verify all beneficiaries and their relationships',
      'Ensure witness requirements are met',
      'Consider legal review before execution'
    ],
    commonErrors: [
      'Not thoroughly reviewing all details',
      'Proceeding with validation errors'
    ]
  }
}

export function StepGuidance() {
  const { t } = useTranslation('will/wizard')
  const { currentStep } = useWizard()
  const [isExpanded, setIsExpanded] = useState(false)

  const guide = stepGuides[currentStep]

  return (
    <div className="bg-blue-900/30 border border-blue-700 rounded-lg overflow-hidden">
      <div className="p-3 bg-blue-900/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-blue-300 hover:text-blue-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-400">💡</span>
            <span className="font-medium">{guide.title} - Step Guidance</span>
          </div>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <p className="text-blue-200 text-sm">{guide.description}</p>

          <div>
            <h4 className="text-blue-300 font-medium text-sm mb-2">💡 Tips for Success:</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              {guide.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {guide.commonErrors.length > 0 && (
            <div>
              <h4 className="text-orange-300 font-medium text-sm mb-2">⚠️ Common Mistakes to Avoid:</h4>
              <ul className="text-orange-200 text-sm space-y-1">
                {guide.commonErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}