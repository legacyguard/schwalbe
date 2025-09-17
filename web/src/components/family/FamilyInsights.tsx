
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  CheckCircle2,
  Crown,
  FileText,
  Heart,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';

interface FamilyInsightsData {
  completionRate: number;
  executorAssigned: boolean;
  guardiansAssigned: number;
  heirsAssigned: number;
  legacyMessages: number;
  missingRoles: number;
  partiallyConfigured: number;
  totalMembers: number;
}

interface FamilyInsightsProps {
  insights: FamilyInsightsData;
}

export const FamilyInsights: React.FC<FamilyInsightsProps> = ({ insights }) => {
  const getCompletionVariant = (rate: number) => {
    if (rate >= 90) return 'default';
    if (rate >= 70) return 'secondary';
    return 'destructive';
  };

  const getRecommendations = () => {
    const recommendations = [];

    if (!insights.executorAssigned) {
      recommendations.push({
        type: 'critical',
        icon: Crown,
        message:
          'No executor assigned - your estate cannot be properly managed without one',
        action: 'Assign an executor',
      });
    }

    if (insights.heirsAssigned === 0) {
      recommendations.push({
        type: 'critical',
        icon: FileText,
        message: 'No heirs assigned - specify who should inherit your assets',
        action: 'Add heirs',
      });
    }

    if (insights.guardiansAssigned === 0) {
      recommendations.push({
        type: 'warning',
        icon: Shield,
        message: 'Consider appointing guardians if you have minor children',
        action: 'Assign guardians',
      });
    }

    if (insights.legacyMessages < insights.totalMembers / 2) {
      recommendations.push({
        type: 'suggestion',
        icon: Heart,
        message: 'Create legacy messages for your loved ones',
        action: 'Add legacy messages',
      });
    }

    if (insights.missingRoles > 0) {
      recommendations.push({
        type: 'warning',
        icon: Users,
        message: `${insights.missingRoles} family members have no assigned roles`,
        action: 'Review family members',
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <TrendingUp className='h-5 w-5 mr-2' />
          Family Estate Plan Insights
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Overall Completion */}
        <div>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-medium'>Estate Plan Completion</span>
            <Badge variant={getCompletionVariant(insights.completionRate)}>
              {insights.completionRate}%
            </Badge>
          </div>
          <Progress value={insights.completionRate} className='h-2' />
          <p className='text-xs text-gray-600 mt-1'>
            {insights.completionRate >= 90
              ? 'Excellent! Your estate plan is nearly complete.'
              : insights.completionRate >= 70
                ? 'Good progress. A few more steps to complete your plan.'
                : 'Your estate plan needs attention. Several key roles remain unassigned.'}
          </p>
        </div>

        {/* Role Assignment Breakdown */}
        <div className='space-y-3'>
          <h4 className='font-medium text-sm'>Role Assignment Status</h4>

          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div className='flex justify-between'>
              <span className='flex items-center'>
                <FileText className='h-3 w-3 mr-1' />
                Heirs
              </span>
              <Badge variant='outline'>
                {insights.heirsAssigned}/{insights.totalMembers}
              </Badge>
            </div>

            <div className='flex justify-between'>
              <span className='flex items-center'>
                <Crown className='h-3 w-3 mr-1' />
                Executor
              </span>
              <Badge
                variant={insights.executorAssigned ? 'default' : 'destructive'}
              >
                {insights.executorAssigned ? 'Assigned' : 'Missing'}
              </Badge>
            </div>

            <div className='flex justify-between'>
              <span className='flex items-center'>
                <Shield className='h-3 w-3 mr-1' />
                Guardians
              </span>
              <Badge variant='outline'>{insights.guardiansAssigned}</Badge>
            </div>

            <div className='flex justify-between'>
              <span className='flex items-center'>
                <Heart className='h-3 w-3 mr-1' />
                Legacy Msgs
              </span>
              <Badge variant='outline'>{insights.legacyMessages}</Badge>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className='space-y-3'>
            <h4 className='font-medium text-sm'>Action Items</h4>

            {recommendations.map((rec, index) => (
              <Alert
                key={index}
                variant={
                  rec.type === 'critical'
                    ? 'destructive'
                    : rec.type === 'warning'
                      ? 'default'
                      : 'default'
                }
                className='py-2'
              >
                <rec.icon className='h-4 w-4' />
                <AlertDescription className='text-sm'>
                  <div className='flex justify-between items-start'>
                    <span>{rec.message}</span>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className='pt-3 border-t border-gray-200'>
          <div className='grid grid-cols-3 gap-3 text-center'>
            <div>
              <div className='text-lg font-semibold text-green-600'>
                {insights.totalMembers -
                  insights.missingRoles -
                  insights.partiallyConfigured}
              </div>
              <div className='text-xs text-gray-600'>Complete</div>
            </div>
            <div>
              <div className='text-lg font-semibold text-yellow-600'>
                {insights.partiallyConfigured}
              </div>
              <div className='text-xs text-gray-600'>Partial</div>
            </div>
            <div>
              <div className='text-lg font-semibold text-red-600'>
                {insights.missingRoles}
              </div>
              <div className='text-xs text-gray-600'>Missing</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {insights.completionRate === 100 && (
          <Alert variant='default' className='border-green-200 bg-green-50'>
            <CheckCircle2 className='h-4 w-4 text-green-600' />
            <AlertDescription className='text-green-800'>
              Congratulations! Your family estate plan is complete. All family
              members have been assigned appropriate roles.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
