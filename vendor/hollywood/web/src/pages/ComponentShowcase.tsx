
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard, MetricsGrid } from '@/components/enhanced/MetricCard';
import {
  ActivityFeed,
  useMockActivities,
} from '@/components/enhanced/ActivityFeed';
import {
  createActionsColumn,
  createSelectColumn,
  createSortableHeader,
  DataTable,
} from '@/components/enhanced/DataTable';
import {
  LinearProgress,
  ProgressGroup,
  RadialProgress,
} from '@/components/enhanced/RadialProgress';
import {
  ProfileCard,
  type ProfileData,
  ProfileGrid,
} from '@/components/enhanced/ProfileCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FadeIn } from '@/components/motion/FadeIn';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';

// Mock data for DataTable
interface DocumentData {
  category: string;
  id: string;
  name: string;
  size: string;
  status: 'pending' | 'processed' | 'processing';
  uploadedAt: string;
}

// Mock documents will be translated in component
const createMockDocuments = (t: any): DocumentData[] => [
  {
    id: '1',
    name: t('mockData.documents.birthCertificate'),
    category: t('mockData.categories.personal'),
    size: '2.4 MB',
    uploadedAt: '2024-01-15',
    status: 'processed',
  },
  {
    id: '2',
    name: t('mockData.documents.insurancePolicy'),
    category: t('mockData.categories.financial'),
    size: '1.8 MB',
    uploadedAt: '2024-01-14',
    status: 'processed',
  },
  {
    id: '3',
    name: t('mockData.documents.willDraft'),
    category: t('mockData.categories.legal'),
    size: '345 KB',
    uploadedAt: '2024-01-13',
    status: 'processing',
  },
  {
    id: '4',
    name: t('mockData.documents.propertyDeed'),
    category: t('mockData.categories.property'),
    size: '5.2 MB',
    uploadedAt: '2024-01-12',
    status: 'processed',
  },
  {
    id: '5',
    name: t('mockData.documents.medicalRecords'),
    category: t('mockData.categories.health'),
    size: '3.1 MB',
    uploadedAt: '2024-01-11',
    status: 'pending',
  },
];

// Mock profiles will be translated in component
const createMockProfiles = (t: any): ProfileData[] => [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 234 567 8900',
    relationship: t('mockData.relationships.spouse'),
    roles: [t('mockData.roles.executor'), t('mockData.roles.beneficiary')],
    status: 'active',
    completionPercentage: 100,
    dateOfBirth: '1985-03-15',
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 234 567 8901',
    relationship: t('mockData.relationships.brother'),
    roles: [t('mockData.roles.guardian')],
    status: 'pending',
    completionPercentage: 75,
  },
  {
    id: '3',
    name: 'Mary Johnson',
    email: 'mary.j@example.com',
    relationship: t('mockData.relationships.mother'),
    roles: [t('mockData.roles.beneficiary')],
    status: 'active',
    completionPercentage: 90,
  },
];

export default function ComponentShowcase() {
  const { t } = useTranslation('ui/component-showcase');
  const activities = useMockActivities();
  const mockDocuments = createMockDocuments(t);
  const mockProfiles = createMockProfiles(t);

  // Define columns for DataTable
  const columns: ColumnDef<DocumentData>[] = [
    createSelectColumn<DocumentData>(),
    {
      accessorKey: 'name',
      header: createSortableHeader(t('dataTable.headers.documentName')),
    },
    {
      accessorKey: 'category',
      header: createSortableHeader(t('dataTable.headers.category')),
      cell: ({ row }) => (
        <span className='px-2 py-1 bg-primary/10 text-primary rounded-md text-xs'>
          {row.getValue('category')}
        </span>
      ),
    },
    {
      accessorKey: 'size',
      header: t('dataTable.headers.size'),
    },
    {
      accessorKey: 'uploadedAt',
      header: createSortableHeader(t('dataTable.headers.uploaded')),
    },
    {
      accessorKey: 'status',
      header: t('dataTable.headers.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const colors = {
          processed: 'bg-green-100 text-green-800',
          processing: 'bg-yellow-100 text-yellow-800',
          pending: 'bg-gray-100 text-gray-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded-md text-xs ${colors[status as keyof typeof colors]}`}
          >
            {t(`dataTable.status.${status}`)}
          </span>
        );
      },
    },
    createActionsColumn<DocumentData>([
      {
        label: t('dataTable.actions.view'),
        onClick: row => toast.info(t('dataTable.toast.viewing', { name: row.name })),
      },
      {
        label: t('dataTable.actions.download'),
        onClick: row => toast.success(t('dataTable.toast.downloading', { name: row.name })),
      },
      {
        label: t('dataTable.actions.delete'),
        onClick: row => toast.error(t('dataTable.toast.deleted', { name: row.name })),
      },
    ]),
  ];

  const metrics = [
    {
      title: t('metrics.data.totalDocuments'),
      value: '156',
      change: 12,
      trend: 'up' as const,
      icon: 'file-text' as const,
      color: 'primary' as const,
    },
    {
      title: t('metrics.data.familyMembers'),
      value: '12',
      change: 8,
      trend: 'up' as const,
      icon: 'users' as const,
      color: 'success' as const,
    },
    {
      title: t('metrics.data.completionRate'),
      value: '87%',
      change: 5,
      trend: 'up' as const,
      icon: 'trending-up' as const,
      color: 'warning' as const,
    },
    {
      title: t('metrics.data.daysActive'),
      value: '234',
      icon: 'calendar' as const,
      color: 'info' as const,
    },
  ];

  const progressItems = [
    { label: t('progress.labels.documents'), value: 85, color: 'primary' as const },
    { label: t('progress.labels.familySetup'), value: 92, color: 'success' as const },
    { label: t('progress.labels.willProgress'), value: 67, color: 'warning' as const },
    { label: t('progress.labels.security'), value: 100, color: 'info' as const },
  ];

  const baseProfile: ProfileData = mockProfiles[0] ?? {
    id: 'sample-1',
    name: 'Sample User',
  };

  const detailedProfile: ProfileData = {
    ...baseProfile,
    metadata: {
      [t('profiles.metadata.lastLogin')]: t('profiles.data.hoursAgo'),
      [t('profiles.metadata.documents')]: t('profiles.data.documentsCount'),
      [t('profiles.metadata.tasks')]: t('profiles.data.pendingTasks'),
    },
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-background'>
        <header className='bg-card border-b border-card-border'>
          <div className='max-w-7xl mx-auto px-6 lg:px-8 py-8'>
            <FadeIn duration={0.5} delay={0.2}>
              <h1 className='text-3xl lg:text-4xl font-bold font-heading text-card-foreground mb-3'>
                {t('header.title')}
              </h1>
            </FadeIn>
            <FadeIn duration={0.5} delay={0.4}>
              <p className='text-lg leading-relaxed max-w-2xl text-muted-foreground'>
                {t('header.description')}
              </p>
            </FadeIn>
          </div>
        </header>

        <main className='max-w-7xl mx-auto px-6 lg:px-8 py-12'>
          <Tabs defaultValue='metrics' className='space-y-8'>
            <TabsList className='grid w-full grid-cols-5'>
              <TabsTrigger value='metrics'>{t('tabs.metrics')}</TabsTrigger>
              <TabsTrigger value='activity'>{t('tabs.activity')}</TabsTrigger>
              <TabsTrigger value='datatable'>{t('tabs.datatable')}</TabsTrigger>
              <TabsTrigger value='progress'>{t('tabs.progress')}</TabsTrigger>
              <TabsTrigger value='profiles'>{t('tabs.profiles')}</TabsTrigger>
            </TabsList>

            <TabsContent value='metrics' className='space-y-8'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('metrics.card.title')}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-8'>
                  <div>
                    <h3 className='text-sm font-medium mb-4'>
                      {t('metrics.grid.title')}
                    </h3>
                    <MetricsGrid metrics={metrics} columns={4} />
                  </div>

                  <div>
                    <h3 className='text-sm font-medium mb-4'>
                      {t('metrics.individual.title')}
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <MetricCard
                        title={t('metrics.data.revenueThisMonth')}
                        value='$45,231'
                        change={23}
                        trend='up'
                        icon='trending-up'
                        color='success'
                      />
                      <MetricCard
                        title={t('metrics.data.pendingTasks')}
                        value='17'
                        change={-5}
                        trend='down'
                        icon='check-circle'
                        color='warning'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='activity' className='space-y-8'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('activity.card.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityFeed
                    activities={activities}
                    title={t('activity.recent')}
                    maxHeight='500px'
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='datatable' className='space-y-8'>
              <DataTable
                columns={columns}
                data={mockDocuments}
                title={t('dataTable.title')}
                description={t('dataTable.description')}
                onExport={() =>
                  toast.info(t('dataTable.toast.export'))
                }
              />
            </TabsContent>

            <TabsContent value='progress' className='space-y-8'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('progress.card.title')}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-8'>
                  <div>
                    <h3 className='text-sm font-medium mb-4'>
                      {t('progress.sections.radial')}
                    </h3>
                    <div className='flex flex-wrap gap-8'>
                      <RadialProgress value={75} label={t('progress.labels.overall')} size='sm' />
                      <RadialProgress
                        value={85}
                        label={t('progress.labels.documents')}
                        size='md'
                        color='success'
                      />
                      <RadialProgress
                        value={60}
                        label={t('progress.labels.family')}
                        size='lg'
                        color='warning'
                      />
                      <RadialProgress
                        value={95}
                        label={t('progress.labels.security')}
                        size='xl'
                        color='info'
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className='text-sm font-medium mb-4'>
                      {t('progress.sections.linear')}
                    </h3>
                    <div className='space-y-4'>
                      <LinearProgress value={75} label={t('progress.labels.profileCompletion')} />
                      <LinearProgress
                        value={90}
                        label={t('progress.labels.documentUpload')}
                        color='success'
                      />
                      <LinearProgress
                        value={45}
                        label={t('progress.labels.willDraft')}
                        color='warning'
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className='text-sm font-medium mb-4'>{t('progress.sections.group')}</h3>
                    <ProgressGroup items={progressItems} type='linear' />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='profiles' className='space-y-8'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('profiles.card.title')}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-8'>
                  <div>
                    <h3 className='text-sm font-medium mb-4'>{t('profiles.sections.defaultGrid')}</h3>
                    <ProfileGrid
                      profiles={mockProfiles}
                      columns={3}
                      onEdit={profile => toast.info(t('profiles.toast.edit', { name: profile.name }))}
                      onDelete={profile =>
                        toast.error(t('profiles.toast.delete', { name: profile.name }))
                      }
                      onViewDetails={profile =>
                        toast.info(t('profiles.toast.view', { name: profile.name }))
                      }
                    />
                  </div>

                  <div>
                    <h3 className='text-sm font-medium mb-4'>
                      {t('profiles.sections.compactVariant')}
                    </h3>
                    <ProfileGrid
                      profiles={mockProfiles}
                      variant={'compact'}
                      columns={2}
                    />
                  </div>

                  <div>
                    <h3 className='text-sm font-medium mb-4'>
                      {t('profiles.sections.detailedVariant')}
                    </h3>
                    <ProfileCard
                      profile={detailedProfile}
                      variant={'detailed'}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </DashboardLayout>
  );
}
