
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardContent } from '@/components/DashboardContent';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t } = useTranslation('common/page-titles');
  usePageTitle(t('dashboard'));

  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
};

export default Index;
