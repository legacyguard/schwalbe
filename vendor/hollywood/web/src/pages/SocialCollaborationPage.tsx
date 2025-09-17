
/**
 * Social Collaboration Page
 * Phase 8: Social Collaboration & Family Features
 *
 * Main hub for family collaboration, document sharing, and social features
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Bell,
  Heart,
  MessageCircle,
  Settings,
  Share2,
  Shield,
  Users,
} from 'lucide-react';
import FamilyManagement from '@/components/social/FamilyManagement';
import DocumentSharing from '@/components/social/DocumentSharing';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function SocialCollaborationPage() {
  const { t } = useTranslation('ui/social-collaboration-page');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real implementation, this would come from services
  const stats = {
    familyMembers: 4,
    sharedDocuments: 12,
    pendingInvites: 2,
    recentActivity: 8,
  };

  return (
    <DashboardLayout>
      <div className='container mx-auto p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {t('header.title')}
            </h1>
            <p className='text-muted-foreground'>
              {t('header.description')}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline'>
              <Bell className='h-4 w-4 mr-2' />
              {t('buttons.notifications')}
              {stats.recentActivity > 0 && (
                <Badge variant='destructive' className='ml-2'>
                  {stats.recentActivity}
                </Badge>
              )}
            </Button>
            <Button variant='outline'>
              <Settings className='h-4 w-4 mr-2' />
              {t('buttons.settings')}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='overview'>{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value='family'>{t('tabs.family')}</TabsTrigger>
            <TabsTrigger value='sharing'>{t('tabs.sharing')}</TabsTrigger>
            <TabsTrigger value='emergency'>{t('tabs.emergency')}</TabsTrigger>
            <TabsTrigger value='activity'>{t('tabs.activity')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    {t('overview.stats.familyMembers.title')}
                  </CardTitle>
                  <Users className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {stats.familyMembers}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {t('overview.stats.familyMembers.pendingInvites', { count: stats.pendingInvites })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    {t('overview.stats.sharedDocuments.title')}
                  </CardTitle>
                  <Share2 className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {stats.sharedDocuments}
                  </div>
                  <p className='text-xs text-muted-foreground'>{t('overview.stats.sharedDocuments.activeShares')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    {t('overview.stats.emergencyAccess.title')}
                  </CardTitle>
                  <Shield className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-green-600'>
                    {t('overview.stats.emergencyAccess.status')}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {t('overview.stats.emergencyAccess.emergencyContacts', { count: 3 })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    {t('overview.stats.recentActivity.title')}
                  </CardTitle>
                  <Activity className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {stats.recentActivity}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {t('overview.stats.recentActivity.timeframe')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='h-5 w-5' />
                    {t('overview.quickActions.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('overview.quickActions.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Button variant='outline' className='w-full justify-start'>
                    <Users className='h-4 w-4 mr-2' />
                    {t('overview.quickActions.inviteNewMember')}
                  </Button>
                  <Button variant='outline' className='w-full justify-start'>
                    <Share2 className='h-4 w-4 mr-2' />
                    {t('overview.quickActions.shareDocuments')}
                  </Button>
                  <Button variant='outline' className='w-full justify-start'>
                    <Shield className='h-4 w-4 mr-2' />
                    {t('overview.quickActions.updateEmergencyContacts')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Heart className='h-5 w-5' />
                    {t('overview.familyInsights.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('overview.familyInsights.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>
                        {t('overview.familyInsights.allMembersActive.title')}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {t('overview.familyInsights.allMembersActive.description')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>
                        {t('overview.familyInsights.newDocumentsShared.title', { count: 5 })}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {t('overview.familyInsights.newDocumentsShared.description')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 p-3 bg-yellow-50 rounded-lg'>
                    <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium'>
                        {t('overview.familyInsights.emergencyProtocolUpdated.title')}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {t('overview.familyInsights.emergencyProtocolUpdated.description')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Preview */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  {t('overview.recentActivityPreview.title')}
                </CardTitle>
                <CardDescription>
                  {t('overview.recentActivityPreview.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {[
                    {
                      action: t('activityTypes.sharedDocument'),
                      user: t('mockData.users.sarahJohnson'),
                      target: t('mockData.documents.insurancePolicy2024'),
                      time: t('mockData.timeframes.hoursAgo', { count: 2 }),
                      icon: Share2,
                    },
                    {
                      action: t('activityTypes.joinedFamily'),
                      user: t('mockData.users.michaelJohnson'),
                      target: t('mockData.documents.theJohnsonFamily'),
                      time: t('mockData.timeframes.daysAgo', { count: 1 }),
                      icon: Users,
                    },
                    {
                      action: t('activityTypes.commentedOn'),
                      user: t('mockData.users.emmaJohnson'),
                      target: t('mockData.documents.willAndTestament'),
                      time: t('mockData.timeframes.multipleDaysAgo', { count: 2 }),
                      icon: MessageCircle,
                    },
                    {
                      action: t('activityTypes.updatedEmergencyContact'),
                      user: t('mockData.users.davidJohnson'),
                      target: t('mockData.documents.emergencyProtocol'),
                      time: t('mockData.timeframes.multipleDaysAgo', { count: 3 }),
                      icon: Shield,
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-3 pb-3 border-b last:border-0'
                    >
                      <div className='p-2 bg-muted rounded-full'>
                        <activity.icon className='h-3 w-3' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm'>
                          <span className='font-medium'>{activity.user}</span>{' '}
                          {activity.action}{' '}
                          <span className='font-medium'>{activity.target}</span>
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='mt-4'>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => setActiveTab('activity')}
                  >
                    {t('buttons.viewAllActivity')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Family Management Tab */}
          <TabsContent value='family'>
            <FamilyManagement />
          </TabsContent>

          {/* Document Sharing Tab */}
          <TabsContent value='sharing'>
            <DocumentSharing />
          </TabsContent>

          {/* Emergency Access Tab */}
          <TabsContent value='emergency'>
            <EmergencyAccessTab />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value='activity'>
            <ActivityFeedTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Sub-components for different tabs

function EmergencyAccessTab() {
  const { t } = useTranslation('ui/social-collaboration-page');

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            {t('emergency.title')}
          </CardTitle>
          <CardDescription>
            {t('emergency.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('emergency.contacts.title')}</h3>

              {[
                {
                  name: t('mockData.users.sarahJohnson'),
                  relationship: t('emergency.contacts.relationships.spouse'),
                  phone: '+1 (555) 123-4567',
                  email: 'sarah@example.com',
                  priority: 1,
                  verified: true,
                },
                {
                  name: t('mockData.users.drEmilyRoberts'),
                  relationship: t('emergency.contacts.relationships.familyDoctor'),
                  phone: '+1 (555) 987-6543',
                  email: 'emily@medicalpractice.com',
                  priority: 2,
                  verified: true,
                },
                {
                  name: t('mockData.users.jamesWilson'),
                  relationship: t('emergency.contacts.relationships.attorney'),
                  phone: '+1 (555) 456-7890',
                  email: 'james@lawfirm.com',
                  priority: 3,
                  verified: false,
                },
              ].map((contact, index) => (
                <Card key={index}>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <h4 className='font-medium'>{contact.name}</h4>
                          <Badge variant='outline' className='text-xs'>
                            {t('emergency.contacts.priority', { number: contact.priority })}
                          </Badge>
                          {contact.verified && (
                            <Badge
                              variant='default'
                              className='text-xs bg-green-100 text-green-800'
                            >
                              {t('emergency.contacts.verified')}
                            </Badge>
                          )}
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {contact.relationship}
                        </p>
                        <div className='flex items-center gap-4 mt-1'>
                          <span className='text-xs text-muted-foreground'>
                            {contact.phone}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {contact.email}
                          </span>
                        </div>
                      </div>
                      <Button variant='ghost' size='sm'>
                        <Settings className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant='outline' className='w-full'>
                <Users className='h-4 w-4 mr-2' />
                {t('buttons.addEmergencyContact')}
              </Button>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>{t('emergency.protocols.title')}</h3>

              <Card>
                <CardContent className='p-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        {t('emergency.protocols.inactivityTrigger')}
                      </span>
                      <Badge variant='outline'>{t('emergency.protocols.values.thirtyDays')}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        {t('emergency.protocols.verificationRequired')}
                      </span>
                      <Badge variant='default'>{t('emergency.protocols.values.yes')}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>{t('emergency.protocols.accessLevel')}</span>
                      <Badge variant='outline'>{t('emergency.protocols.values.standard')}</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>{t('emergency.protocols.timeDelay')}</span>
                      <Badge variant='outline'>{t('emergency.protocols.values.seventyTwoHours')}</Badge>
                    </div>
                  </div>

                  <div className='mt-4 pt-3 border-t'>
                    <p className='text-xs text-muted-foreground'>
                      {t('emergency.protocols.lastTested', { status: t('emergency.protocols.never') })}
                    </p>
                    <div className='flex gap-2 mt-2'>
                      <Button variant='outline' size='sm'>
                        {t('buttons.editProtocol')}
                      </Button>
                      <Button variant='outline' size='sm'>
                        {t('buttons.testProtocol')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>
                    {t('emergency.accessibleDocuments.title')}
                  </CardTitle>
                  <CardDescription className='text-sm'>
                    {t('emergency.accessibleDocuments.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {[
                      t('emergency.accessibleDocuments.categories.legalDocuments', { count: 5 }),
                      t('emergency.accessibleDocuments.categories.financialRecords', { count: 8 }),
                      t('emergency.accessibleDocuments.categories.medicalInformation', { count: 3 }),
                      t('emergency.accessibleDocuments.categories.insurancePolicies', { count: 4 }),
                      t('emergency.accessibleDocuments.categories.emergencyInstructions', { count: 2 }),
                    ].map((category, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between py-2 border-b last:border-0'
                      >
                        <span className='text-sm'>{category}</span>
                        <Badge variant='outline' className='text-xs'>
                          {t('emergency.accessibleDocuments.included')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityFeedTab() {
  const { t } = useTranslation('ui/social-collaboration-page');

  const activities = [
    {
      id: 1,
      type: 'document_shared',
      user: t('mockData.users.sarahJohnson'),
      action: t('activityTypes.shared'),
      target: t('mockData.documents.medicalRecords2024'),
      targetType: 'document',
      timestamp: '2024-01-15T14:30:00Z',
      metadata: { recipients: 2, permissions: ['view', 'download'] },
    },
    {
      id: 2,
      type: 'member_joined',
      user: t('mockData.users.michaelJohnson'),
      action: t('activityTypes.joined'),
      target: t('mockData.documents.theJohnsonFamily'),
      targetType: 'family',
      timestamp: '2024-01-14T09:15:00Z',
      metadata: { role: t('activityFeed.types.member') },
    },
    {
      id: 3,
      type: 'emergency_updated',
      user: t('mockData.users.davidJohnson'),
      action: t('activityTypes.updated'),
      target: t('mockData.documents.emergencyProtocol'),
      targetType: 'protocol',
      timestamp: '2024-01-13T16:45:00Z',
      metadata: { changes: ['contact_added', 'delay_updated'] },
    },
    {
      id: 4,
      type: 'document_accessed',
      user: t('mockData.users.emmaJohnson'),
      action: t('activityTypes.accessed'),
      target: t('mockData.documents.willAndTestament'),
      targetType: 'document',
      timestamp: '2024-01-12T11:20:00Z',
      metadata: { access_type: t('activityFeed.types.view') },
    },
    {
      id: 5,
      type: 'member_invited',
      user: t('mockData.users.sarahJohnson'),
      action: t('activityTypes.invited'),
      target: 'alex@example.com',
      targetType: 'invitation',
      timestamp: '2024-01-11T13:00:00Z',
      metadata: { role: t('activityFeed.types.guardian'), relationship: t('activityFeed.types.friend') },
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_shared':
        return <Share2 className='h-4 w-4' />;
      case 'member_joined':
        return <Users className='h-4 w-4' />;
      case 'emergency_updated':
        return <Shield className='h-4 w-4' />;
      case 'document_accessed':
        return <Activity className='h-4 w-4' />;
      case 'member_invited':
        return <Users className='h-4 w-4' />;
      default:
        return <Activity className='h-4 w-4' />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'document_shared':
        return 'bg-blue-100 text-blue-600';
      case 'member_joined':
        return 'bg-green-100 text-green-600';
      case 'emergency_updated':
        return 'bg-orange-100 text-orange-600';
      case 'document_accessed':
        return 'bg-purple-100 text-purple-600';
      case 'member_invited':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5' />
            {t('activityFeed.title')}
          </CardTitle>
          <CardDescription>
            {t('activityFeed.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {activities.map(activity => (
              <div
                key={activity.id}
                className='flex items-start gap-4 pb-4 border-b last:border-0'
              >
                <div
                  className={cn(
                    'p-2 rounded-full',
                    getActivityColor(activity.type)
                  )}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className='flex-1 space-y-1'>
                  <p className='text-sm'>
                    <span className='font-medium'>{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className='font-medium'>{activity.target}</span>
                  </p>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    {activity.metadata && (
                      <>
                        <span>•</span>
                        <span>
                          {activity.type === 'document_shared' &&
                            t('activityFeed.metadata.sharedWith', { count: activity.metadata.recipients })}
                          {activity.type === 'member_joined' &&
                            t('activityFeed.metadata.role', { role: activity.metadata.role })}
                          {activity.type === 'emergency_updated' &&
                            t('activityFeed.metadata.changesMade', { count: activity.metadata.changes?.length })}
                          {activity.type === 'document_accessed' &&
                            t('activityFeed.metadata.accessType', { type: activity.metadata.access_type })}
                          {activity.type === 'member_invited' &&
                            t('activityFeed.metadata.relationshipRole', { relationship: activity.metadata.relationship, role: activity.metadata.role })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button variant='ghost' size='sm'>
                  <Settings className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>

          <div className='mt-6 pt-4 border-t'>
            <Button variant='outline' className='w-full'>
              {t('buttons.loadMoreActivity')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
