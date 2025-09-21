'use client';

import { WillWizardTester } from '@/components/legacy/WillWizardTester';
import { LocalizationProvider } from '@/contexts/LocalizationContext';

export default function WillWizardTestPage() {
  return (
    <LocalizationProvider>
      <div className="min-h-screen">
        <WillWizardTester />
      </div>
    </LocalizationProvider>
  );
}
