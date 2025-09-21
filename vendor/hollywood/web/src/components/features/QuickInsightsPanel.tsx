
/**
 * Quick Insights Panel Component
 * Shows immediate value after document upload with family impact messaging
 */

import { useEffect, useState } from 'react';
import {
  ChevronRight,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  formatInsightValue,
  generateQuickInsights,
  type QuickInsight,
} from '@/lib/quick-insights';
import type { Document } from '@/integrations/supabase/types';
import type { WillData } from '@/types/will';

interface QuickInsightsPanelProps {
  className?: string;
  documents: Document[];
  emergencyContactsCount?: number;
  familyMembersCount?: number;
  isFirstDocument?: boolean;
  onActionClick?: (action: QuickInsight['action_suggestion']) => void;
  willData?: WillData;
}

export function QuickInsightsPanel({
  documents,
  willData,
  familyMembersCount = 0,
  emergencyContactsCount = 0,
  isFirstDocument = false,
  onActionClick,
  className,
}: QuickInsightsPanelProps) {
  const [insights, setInsights] = useState<QuickInsight[]>([]);
  const [celebrationShown, setCelebrationShown] = useState(false);

  useEffect(() => {
    const newInsights = generateQuickInsights({
      documents,
      willData,
      familyMembersCount,
      emergencyContactsCount,
      isFirstDocument,
    });
    setInsights(newInsights);

    // Show celebration for first document
    if (isFirstDocument && !celebrationShown) {
      setCelebrationShown(true);
    }
  }, [
    documents,
    willData,
    familyMembersCount,
    emergencyContactsCount,
    isFirstDocument,
    celebrationShown,
  ]);

  const getInsightIcon = (type: QuickInsight['type']) => {
    switch (type) {
      case 'family_impact':
        return Users;
      case 'time_saved':
        return Clock;
      case 'protection_level':
        return Shield;
      case 'next_action':
        return ChevronRight;
      case 'risk_mitigation':
        return TrendingUp;
      default:
        return Sparkles;
    }
  };

  const getInsightColor = (impact: QuickInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case 'medium':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'low':
        return 'border-gray-200 bg-gray-50 text-gray-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  if (insights.length === 0) {
    return null;
  }

  const primaryInsights = insights.filter(i => i.impact === 'high').slice(0, 2);
  const secondaryInsights = insights
    .filter(i => i.impact === 'medium' || i.impact === 'low')
    .slice(0, 3);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Celebration for first document */}
      {isFirstDocument && celebrationShown && (
        <Card className='border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 animate-pulse'>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center'>
                <Sparkles className='h-6 w-6 text-emerald-600 animate-pulse' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-emerald-800'>
                  Congratulations!
                </h3>
                <p className='text-emerald-700'>
                  You've taken the first step in protecting your family's
                  future.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Insights */}
      <div className='grid gap-4 md:grid-cols-2'>
        {primaryInsights.map(insight => {
          const IconComponent = getInsightIcon(insight.type);

          return (
            <Card
              key={insight.id}
              className='hover:shadow-md transition-shadow'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start gap-3'>
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      getInsightColor(insight.impact)
                    )}
                  >
                    <IconComponent className='h-5 w-5' />
                  </div>
                  <div className='flex-1'>
                    <CardTitle className='text-base font-semibold'>
                      {insight.title}
                    </CardTitle>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {insight.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='pt-0'>
                <div className='space-y-3'>
                  {/* Value Display */}
                  <div className='flex items-center justify-between'>
                    <span className='text-2xl font-bold text-primary'>
                      {formatInsightValue(insight)}
                    </span>
                    <Badge
                      variant="outline"
                      className={getInsightColor(insight.impact)}
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>

                  {/* Emotional Message */}
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {insight.emotional_message}
                  </p>

                  {/* Action Button */}
                  {insight.action_suggestion && (
                    <Button
                      size='sm'
                      variant={
                        insight.action_suggestion.urgent ? 'default' : 'outline'
                      }
                      onClick={() =>
                        onActionClick?.(insight.action_suggestion!)
                      }
                      className='w-full mt-2'
                    >
                      {insight.action_suggestion.text}
                      <ChevronRight className='h-3 w-3 ml-1' />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Insights */}
      {secondaryInsights.length > 0 && (
        <div className='space-y-3'>
          <h4 className='text-sm font-medium text-muted-foreground'>
            Additional Insights
          </h4>
          <div className='grid gap-3'>
            {secondaryInsights.map(insight => {
              const IconComponent = getInsightIcon(insight.type);

              return (
                <Card key={insight.id} className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={cn(
                        'p-1.5 rounded',
                        getInsightColor(insight.impact)
                      )}
                    >
                      <IconComponent className='h-4 w-4' />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <h5 className='font-medium text-sm'>{insight.title}</h5>
                      <p className='text-xs text-muted-foreground truncate'>
                        {insight.emotional_message}
                      </p>
                    </div>

                    <div className='text-right'>
                      <div className='font-semibold text-sm'>
                        {formatInsightValue(insight)}
                      </div>
                      {insight.action_suggestion && (
                        <Button
                          size='sm'
                          variant="ghost"
                          onClick={() =>
                            onActionClick?.(insight.action_suggestion!)
                          }
                          className='h-auto p-1 text-xs'
                        >
                          {insight.action_suggestion.text}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
        <CardContent className='p-4'>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <div className='text-lg font-bold text-blue-800'>
                {documents.length}
              </div>
              <div className='text-xs text-blue-600'>Documents Secured</div>
            </div>
            <div>
              <div className='text-lg font-bold text-blue-800'>
                {familyMembersCount + emergencyContactsCount}
              </div>
              <div className='text-xs text-blue-600'>People Protected</div>
            </div>
            <div>
              <div className='text-lg font-bold text-blue-800'>
                {insights.filter(i => i.impact === 'high').length}
              </div>
              <div className='text-xs text-blue-600'>Key Benefits</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
