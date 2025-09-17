
// Family Protection Page - Main interface for Phase 3A Family Shield System
// Comprehensive family emergency protection management with Sofia personality integration

import { usePageTitle } from '@/hooks/usePageTitle';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FamilyProtectionDashboard } from '@/components/emergency/FamilyProtectionDashboard';
import { useTranslation } from 'react-i18next';

export default function FamilyProtectionPage() {
  const { t } = useTranslation('common/page-titles');
  usePageTitle(t('familyProtection'));

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-background'>
        {/* Main Content */}
        <main className='max-w-7xl mx-auto px-6 lg:px-8 py-8'>
          <FamilyProtectionDashboard />
        </main>
      </div>
    </DashboardLayout>
  );
}
