
/**
 * Analytics Page
 * Phase 6: AI Intelligence & Document Analysis
 *
 * Main page for document insights and analytics dashboard
 */

import { DashboardLayout } from '@/components/DashboardLayout';
import InsightsDashboard from '@/components/analytics/InsightsDashboard';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className='container mx-auto p-6'>
        <InsightsDashboard />
      </div>
    </DashboardLayout>
  );
}
