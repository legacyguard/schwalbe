
import _React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Crown,
  Heart,
  Share2,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { FamilyMemberDashboard } from '@/components/family/FamilyMemberDashboard';
import { SharedFamilyCalendar } from '@/components/family/SharedFamilyCalendar';
import { FamilyDocumentSharing } from '@/components/family/FamilyDocumentSharing';
import { FamilyViralGrowth } from '@/components/family/FamilyViralGrowth';
import { FamilyPlanUpgrade } from '@/components/family/FamilyPlanUpgrade';
import {
  FAMILY_PLANS,
  type FamilyMember,
  type FamilyProtectionStatus,
} from '@/types/family';
import { familyService } from '@/services/familyService';

export default function Family() {
  const { user } = useUser();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [protectionStatus, setProtectionStatus] =
    useState<FamilyProtectionStatus | null>(null);
  const [currentPlan, setCurrentPlan] = useState<'family' | 'free' | 'premium'>(
    'free'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [documentsCount, setDocumentsCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadFamilyData();
    }
  }, [user]);

  const loadFamilyData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [members, protection, stats] = await Promise.all([
        familyService.getFamilyMembers(user.id),
        familyService.getFamilyProtectionStatus(user.id),
        familyService.getFamilyStats(user.id),
      ]);

      setFamilyMembers(members.map(member => ({
        ...member,
        lastActiveAt: member.lastActiveAt || undefined
      })));
      setProtectionStatus(protection);
      setDocumentsCount(stats.totalDocuments);

      // Determine current plan based on member count and features
      if (members.length > FAMILY_PLANS.free.maxMembers) {
        setCurrentPlan('family');
      }
    } catch (error) {
      console.error('Failed to load family data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isNearMemberLimit = () => {
    const plan = FAMILY_PLANS[currentPlan];
    if (plan.maxMembers === -1) return false; // Unlimited
    return familyMembers.length >= plan.maxMembers - 1;
  };

  const needsPlanUpgrade = () => {
    const plan = FAMILY_PLANS[currentPlan];
    return plan.maxMembers !== -1 && familyMembers.length >= plan.maxMembers;
  };

  const handleInviteFamily = () => {
    // Navigate to members tab where invite functionality is available
    setActiveTab('members');
  };

  const handlePlanUpgrade = (newPlan: 'family' | 'free' | 'premium') => {
    setCurrentPlan(newPlan);
    // In real app, this would handle payment processing
    // console.log(`Upgrading to ${newPlan} plan`);
  };

  if (isLoading) {
    return (
      <div className='container mx-auto p-6 space-y-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className='p-6'>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                  <div className='h-8 bg-gray-200 rounded w-1/2'></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Users className='h-8 w-8 text-blue-600' />
            Family Circle
          </h1>
          <p className='text-muted-foreground mt-1'>
            Collaborate, protect, and plan together as a family
          </p>
        </div>

        {/* Plan Badge */}
        <div className='flex items-center gap-3'>
          <Badge
            className={`gap-2 ${currentPlan === 'premium' ? 'bg-purple-100 text-purple-800' : currentPlan === 'family' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
          >
            {currentPlan === 'premium' && <Crown className='h-3 w-3' />}
            {FAMILY_PLANS[currentPlan].type.toUpperCase()} PLAN
          </Badge>
          {currentPlan !== 'premium' && (
            <FamilyPlanUpgrade
              currentPlan={currentPlan}
              currentMemberCount={familyMembers.length}
              onPlanSelect={handlePlanUpgrade}
              trigger={
                <Button variant='outline' size='sm' className='gap-2'>
                  <Sparkles className='h-4 w-4' />
                  Upgrade Plan
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Plan Limits Warning */}
      {(isNearMemberLimit() || needsPlanUpgrade()) && (
        <Alert
          className={
            needsPlanUpgrade()
              ? 'border-red-200 bg-red-50'
              : 'border-yellow-200 bg-yellow-50'
          }
        >
          <AlertTriangle
            className={`h-4 w-4 ${needsPlanUpgrade() ? 'text-red-600' : 'text-yellow-600'}`}
          />
          <AlertDescription className='flex items-center justify-between'>
            <span>
              {needsPlanUpgrade()
                ? `You've reached your ${FAMILY_PLANS[currentPlan].type} plan limit of ${FAMILY_PLANS[currentPlan].maxMembers} family members.`
                : `You're near your plan limit (${familyMembers.length}/${FAMILY_PLANS[currentPlan].maxMembers} members used).`}
            </span>
            <FamilyPlanUpgrade
              currentPlan={currentPlan}
              currentMemberCount={familyMembers.length}
              onPlanSelect={handlePlanUpgrade}
              trigger={
                <Button variant='outline' size='sm' className='gap-2 ml-4'>
                  <Crown className='h-4 w-4' />
                  Upgrade Plan
                  <ArrowRight className='h-4 w-4' />
                </Button>
              }
            />
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State for First-Time Users */}
      {familyMembers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center py-12'
        >
          <Card className='max-w-2xl mx-auto'>
            <CardContent className='p-12'>
              <div className='mb-6'>
                <div className='relative'>
                  <Heart className='h-16 w-16 text-pink-500 mx-auto mb-4' />
                  <Users className='h-8 w-8 text-blue-500 absolute -bottom-1 -right-1' />
                </div>
              </div>

              <h2 className='text-2xl font-bold mb-4'>
                Welcome to Your Family Circle! 🏡
              </h2>

              <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
                Start building your family's protection network by inviting your
                loved ones. Together, you can share important documents,
                coordinate schedules, and ensure everyone is prepared for life's
                moments.
              </p>

              <div className='grid gap-4 md:grid-cols-3 mb-8'>
                <div className='text-center p-4'>
                  <UserPlus className='h-8 w-8 text-green-500 mx-auto mb-2' />
                  <h3 className='font-semibold mb-1'>Invite Family</h3>
                  <p className='text-sm text-muted-foreground'>
                    Add your spouse, children, and trusted contacts
                  </p>
                </div>
                <div className='text-center p-4'>
                  <Share2 className='h-8 w-8 text-blue-500 mx-auto mb-2' />
                  <h3 className='font-semibold mb-1'>Share Documents</h3>
                  <p className='text-sm text-muted-foreground'>
                    Securely share wills, insurance, and important files
                  </p>
                </div>
                <div className='text-center p-4'>
                  <Shield className='h-8 w-8 text-purple-500 mx-auto mb-2' />
                  <h3 className='font-semibold mb-1'>Emergency Ready</h3>
                  <p className='text-sm text-muted-foreground'>
                    Set up emergency access for peace of mind
                  </p>
                </div>
              </div>

              <Button
                size='lg'
                className='gap-2'
                onClick={() => setActiveTab('members')}
              >
                <UserPlus className='h-5 w-5' />
                Invite Your First Family Member
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content - Only show if family members exist */}
      {familyMembers.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview' className='gap-2'>
              <Shield className='h-4 w-4' />
              Overview
            </TabsTrigger>
            <TabsTrigger value='members' className='gap-2'>
              <Users className='h-4 w-4' />
              Members
            </TabsTrigger>
            <TabsTrigger value='calendar' className='gap-2'>
              <Calendar className='h-4 w-4' />
              Calendar
            </TabsTrigger>
            <TabsTrigger value='sharing' className='gap-2'>
              <Share2 className='h-4 w-4' />
              Document Sharing
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
            {/* Viral Growth Component */}
            {user && (
              <FamilyViralGrowth
                userId={user.id}
                currentMembers={familyMembers}
                protectionLevel={protectionStatus?.protectionLevel || 0}
                documentsCount={documentsCount}
                onInviteFamily={handleInviteFamily}
              />
            )}

            {/* Protection Overview */}
            {protectionStatus && (
              <div className='grid gap-6 md:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Shield className='h-5 w-5 text-green-600' />
                      Family Protection Status
                    </CardTitle>
                    <CardDescription>
                      Your family's overall protection level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-3xl font-bold'>
                          {protectionStatus.protectionLevel}%
                        </span>
                        <Badge
                          className={
                            protectionStatus.protectionLevel >= 80
                              ? 'bg-green-100 text-green-800'
                              : protectionStatus.protectionLevel >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {protectionStatus.protectionLevel >= 80
                            ? 'Excellent'
                            : protectionStatus.protectionLevel >= 60
                              ? 'Good'
                              : 'Needs Work'}
                        </Badge>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span>Active Members</span>
                          <span>
                            {protectionStatus.activeMembers}/
                            {protectionStatus.totalMembers}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span>Shared Documents</span>
                          <span>{protectionStatus.documentsShared}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span>Emergency Contacts</span>
                          <span className='flex items-center gap-1'>
                            {protectionStatus.emergencyContactsSet ? (
                              <CheckCircle className='h-4 w-4 text-green-500' />
                            ) : (
                              <AlertTriangle className='h-4 w-4 text-yellow-500' />
                            )}
                            {protectionStatus.emergencyContactsSet
                              ? 'Ready'
                              : 'Setup needed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Next Steps</CardTitle>
                    <CardDescription>
                      Recommendations to improve your family's protection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {protectionStatus.recommendations.map(
                        (recommendation, index) => (
                          <div
                            key={index}
                            className='flex items-start gap-2 text-sm'
                          >
                            <div className='h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0'></div>
                            <span>{recommendation}</span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for managing your family circle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                  <Button
                    variant='outline'
                    className='h-auto p-4 flex-col gap-2'
                    onClick={() => setActiveTab('members')}
                  >
                    <UserPlus className='h-6 w-6 text-green-600' />
                    <span>Invite Member</span>
                  </Button>
                  <Button
                    variant='outline'
                    className='h-auto p-4 flex-col gap-2'
                    onClick={() => setActiveTab('sharing')}
                  >
                    <Share2 className='h-6 w-6 text-blue-600' />
                    <span>Share Documents</span>
                  </Button>
                  <Button
                    variant='outline'
                    className='h-auto p-4 flex-col gap-2'
                    onClick={() => setActiveTab('calendar')}
                  >
                    <Calendar className='h-6 w-6 text-purple-600' />
                    <span>Add Event</span>
                  </Button>
                  <Button
                    variant='outline'
                    className='h-auto p-4 flex-col gap-2'
                  >
                    <Shield className='h-6 w-6 text-red-600' />
                    <span>Emergency Setup</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='members'>
            {user && <FamilyMemberDashboard userId={user.id} />}
          </TabsContent>

          <TabsContent value='calendar'>
            {user && (
              <SharedFamilyCalendar
                userId={user.id}
                familyMembers={familyMembers}
              />
            )}
          </TabsContent>

          <TabsContent value='sharing'>
            {user && (
              <FamilyDocumentSharing
                userId={user.id}
                familyMembers={familyMembers}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
