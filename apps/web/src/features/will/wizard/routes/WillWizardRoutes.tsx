import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { WizardProvider } from '../state/WizardContext'
import { StepStart } from '../steps/StepStart'
import { StepTestator } from '../steps/StepTestator'
import { StepBeneficiaries } from '../steps/StepBeneficiaries'
import { StepExecutor } from '../steps/StepExecutor'
import { StepWitnesses } from '../steps/StepWitnesses'
import { StepReview } from '../steps/StepReview'
import { WizardLayout } from '../components/WizardLayout'
import { WizardErrorBoundary } from '../components/ErrorBoundary'

export function WillWizardRoutes() {
  return (
    <WizardErrorBoundary>
      <WizardProvider>
        <WizardLayout>
          <Routes>
            <Route path="start" element={<StepStart />} />
            <Route path="testator" element={<StepTestator />} />
            <Route path="beneficiaries" element={<StepBeneficiaries />} />
            <Route path="executor" element={<StepExecutor />} />
            <Route path="witnesses" element={<StepWitnesses />} />
            <Route path="review" element={<StepReview />} />
            <Route path="*" element={<Navigate to="start" replace />} />
          </Routes>
        </WizardLayout>
      </WizardProvider>
    </WizardErrorBoundary>
  )
}