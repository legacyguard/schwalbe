
import React, { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  // Settings,
  AlertCircle,
  CheckCircle,
  Crown,
  FileText,
  Heart,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';
// import { FamilyTreeVisualization } from '@/components/family/FamilyTreeVisualization';
import { PersonRoleAssignment } from '@/components/family/PersonRoleAssignment';
import { FamilyInsights } from '@/components/family/FamilyInsights';
import type { WillData } from '@/types/will';
import { useTranslation } from 'react-i18next';

interface FamilyMember {
  dateOfBirth?: string;
  id: string;
  name: string;
  profileImage?: string;
  relationship: string;
  roles: {
    hasLegacyMessages?: boolean;
    heirPercentage?: number;
    isEmergencyContact?: boolean;
    isExecutor?: boolean;
    isGuardian?: boolean;
    isHeir?: boolean;
  };
  status: 'complete' | 'missing_info' | 'partial';
}

interface MyFamilyPageProps {
  onWillDataUpdate?: (updatedData: WillData) => void;
  willData?: WillData;
}

export const MyFamilyPage: React.FC<MyFamilyPageProps> = ({
  willData,
  onWillDataUpdate,
}) => {
  const { t } = useTranslation('ui/my-family-page');
  const [selectedPerson, setSelectedPerson] = useState<FamilyMember | null>(
    null
  );
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);

  // Mock family data - in real app, this would come from user's family tree
  const initialFamilyMembers: FamilyMember[] = useMemo(
    () => [
      {
        id: '1',
        name: 'Jane Doe',
        relationship: 'spouse',
        dateOfBirth: '1982-03-15',
        roles: {
          isHeir: true,
          heirPercentage: 60,
          isExecutor: true,
          hasLegacyMessages: true,
          isEmergencyContact: true,
        },
        status: 'complete',
      },
      {
        id: '2',
        name: 'John Doe Jr.',
        relationship: 'child',
        dateOfBirth: '2010-07-20',
        roles: {
          isHeir: true,
          heirPercentage: 40,
          hasLegacyMessages: true,
        },
        status: 'partial', // Missing guardian assignment
      },
      {
        id: '3',
        name: 'Robert Doe',
        relationship: 'brother',
        dateOfBirth: '1978-11-08',
        roles: {
          isGuardian: true,
          hasLegacyMessages: false,
        },
        status: 'partial', // Could be heir, emergency contact
      },
      {
        id: '4',
        name: 'Mary Johnson',
        relationship: 'mother',
        dateOfBirth: '1955-02-12',
        roles: {},
        status: 'missing_info', // No roles assigned
      },
    ],
    []
  );

  const [familyMembers, setFamilyMembers] =
    useState<FamilyMember[]>(initialFamilyMembers);

  const handlePersonClick = useCallback((person: FamilyMember) => {
    setSelectedPerson(person);
    setShowRoleAssignment(true);
  }, []);

  const handleRoleUpdate = useCallback(
    (personId: string, newRoles: FamilyMember['roles']) => {
      setFamilyMembers(prev =>
        prev.map(member =>
          member.id === personId
            ? { ...member, roles: { ...member.roles, ...newRoles } }
            : member
        )
      );

      // Update will data accordingly
      if (onWillDataUpdate && willData) {
        const updatedWillData = { ...willData };

        // Update beneficiaries if heir role changed
        if (newRoles.isHeir !== undefined) {
          const person = familyMembers.find(m => m.id === personId);
          if (person && newRoles.isHeir) {
            const existingBeneficiary = updatedWillData.beneficiaries?.find(
              b => b.name === person.name
            );
            if (!existingBeneficiary) {
              updatedWillData.beneficiaries = [
                ...(updatedWillData.beneficiaries || []),
                {
                  id: personId,
                  name: person.name,
                  relationship: (person.relationship as 'charity' | 'child' | 'friend' | 'grandchild' | 'other' | 'parent' | 'sibling' | 'spouse') || 'other',
                  percentage: newRoles.heirPercentage || 0,
                  specificGifts: [],
                  conditions: '',
                },
              ];
            }
          } else if (!newRoles.isHeir) {
            updatedWillData.beneficiaries =
              updatedWillData.beneficiaries?.filter(b => b.id !== personId) ||
              [];
          }
        }

        onWillDataUpdate(updatedWillData);
      }
    },
    [willData, onWillDataUpdate, familyMembers]
  );

  const getFamilyInsights = useCallback(() => {
    const insights = {
      totalMembers: familyMembers.length,
      heirsAssigned: familyMembers.filter(m => m.roles.isHeir).length,
      guardiansAssigned: familyMembers.filter(m => m.roles.isGuardian).length,
      executorAssigned: familyMembers.some(m => m.roles.isExecutor),
      legacyMessages: familyMembers.filter(m => m.roles.hasLegacyMessages)
        .length,
      missingRoles: familyMembers.filter(m => m.status === 'missing_info')
        .length,
      partiallyConfigured: familyMembers.filter(m => m.status === 'partial')
        .length,
    };

    const completionRate = Math.round(
      ((insights.totalMembers -
        insights.missingRoles -
        insights.partiallyConfigured) /
        insights.totalMembers) *
        100
    );

    return { ...insights, completionRate };
  }, [familyMembers]);

  const insights = getFamilyInsights();

  const renderFamilyMemberCard = (member: FamilyMember) => (
    <Card
      key={member.id}
      className={`cursor-pointer transition-all hover:shadow-lg ${
        member.status === 'complete'
          ? 'border-green-200 bg-green-50'
          : member.status === 'partial'
            ? 'border-yellow-200 bg-yellow-50'
            : 'border-red-200 bg-red-50'
      }`}
      onClick={() => handlePersonClick(member)}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between mb-3'>
          <div>
            <h3 className='font-semibold text-lg'>{member.name}</h3>
            <p className='text-sm text-gray-600 capitalize'>
              {member.relationship}
            </p>
            {member.dateOfBirth && (
              <p className='text-xs text-gray-500'>
                {t('memberCard.born', { date: member.dateOfBirth })}
              </p>
            )}
          </div>
          <div className='flex flex-col items-end space-y-1'>
            {member.status === 'complete' && (
              <CheckCircle className='h-5 w-5 text-green-600' />
            )}
            {member.status === 'partial' && (
              <AlertCircle className='h-5 w-5 text-yellow-600' />
            )}
            {member.status === 'missing_info' && (
              <AlertCircle className='h-5 w-5 text-red-600' />
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex flex-wrap gap-1'>
            {member.roles.isHeir && (
              <Badge variant='default' className='text-xs'>
                {t('memberCard.roles.heir', { percentage: member.roles.heirPercentage })}
              </Badge>
            )}
            {member.roles.isExecutor && (
              <Badge variant='secondary' className='text-xs'>
                <Crown className='h-3 w-3 mr-1' />
                {t('memberCard.roles.executor')}
              </Badge>
            )}
            {member.roles.isGuardian && (
              <Badge variant='outline' className='text-xs'>
                <Shield className='h-3 w-3 mr-1' />
                {t('memberCard.roles.guardian')}
              </Badge>
            )}
            {member.roles.hasLegacyMessages && (
              <Badge variant='outline' className='text-xs'>
                <Heart className='h-3 w-3 mr-1' />
                {t('memberCard.roles.legacy')}
              </Badge>
            )}
          </div>

          {member.status !== 'complete' && (
            <div className='text-xs text-gray-600'>
              {member.status === 'partial' && t('memberCard.status.partial')}
              {member.status === 'missing_info' && t('memberCard.status.missingInfo')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className='container mx-auto px-6 py-8 max-w-7xl'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>{t('header.title')}</h1>
            <p className='text-gray-600'>
              {t('header.subtitle')}
            </p>
          </div>
          <Button onClick={() => setShowRoleAssignment(true)}>
            <UserPlus className='h-4 w-4 mr-2' />
            {t('buttons.addFamilyMember')}
          </Button>
        </div>
      </div>

      {/* Family Insights Dashboard */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardContent className='p-4 text-center'>
            <Users className='h-8 w-8 text-blue-600 mx-auto mb-2' />
            <div className='text-2xl font-bold'>{insights.totalMembers}</div>
            <div className='text-sm text-gray-600'>{t('insights.familyMembers')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <FileText className='h-8 w-8 text-green-600 mx-auto mb-2' />
            <div className='text-2xl font-bold'>{insights.heirsAssigned}</div>
            <div className='text-sm text-gray-600'>{t('insights.heirsAssigned')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <Shield className='h-8 w-8 text-purple-600 mx-auto mb-2' />
            <div className='text-2xl font-bold'>
              {insights.guardiansAssigned}
            </div>
            <div className='text-sm text-gray-600'>{t('insights.guardiansAssigned')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <CheckCircle className='h-8 w-8 text-emerald-600 mx-auto mb-2' />
            <div className='text-2xl font-bold'>{insights.completionRate}%</div>
            <div className='text-sm text-gray-600'>{t('insights.complete')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts for missing configurations */}
      {insights.missingRoles > 0 && (
        <Alert className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {t('alerts.missingRoles', {
              count: insights.missingRoles,
              plural: insights.missingRoles > 1 ? t('alerts.missingRolesPlural') : t('alerts.missingRolesSingular')
            })}
          </AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Family Tree - Takes up 2/3 of the width */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Users className='h-5 w-5 mr-2' />
                {t('familyTree.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600 mb-4'>
                {t('familyTree.description')}
              </p>

              {/* Enhanced Family Tree with role assignment capabilities */}
              {/* <FamilyTreeVisualization
                willData={willData}
                onWillDataUpdate={onWillDataUpdate}
                onPersonClick={handlePersonClick}
                showRoleIndicators={true}
                enableDirectRoleAssignment={true}
                familyMembers={mockFamilyMembers}
              /> */}
              <div className='p-8 text-center text-muted-foreground'>
                {t('familyTree.placeholder')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Family Members List - Takes up 1/3 of the width */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>{t('familyMembersList.title')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {familyMembers.map(renderFamilyMemberCard)}
            </CardContent>
          </Card>

          {/* Family Insights */}
          <FamilyInsights insights={insights} />
        </div>
      </div>

      {/* Role Assignment Modal */}
      {showRoleAssignment && (
        <PersonRoleAssignment
          person={selectedPerson}
          onClose={() => {
            setShowRoleAssignment(false);
            setSelectedPerson(null);
          }}
          onRoleUpdate={handleRoleUpdate}
          willData={willData}
        />
      )}
    </div>
  );
};
