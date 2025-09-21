
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FadeIn } from '@/components/motion/FadeIn';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

export interface ActivityItem {
  action: string;
  color?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
  description: string;
  icon?: string;
  id: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  type: 'document' | 'family' | 'guardian' | 'security' | 'system' | 'will';
  user?: {
    avatar?: string;
    name: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  maxHeight?: string;
  onViewAll?: () => void;
  showViewAll?: boolean;
  title?: string;
}

export function ActivityFeed({
  activities,
  title,
  showViewAll = true,
  onViewAll,
  maxHeight = '400px',
  loading = false,
  emptyMessage,
  className,
}: ActivityFeedProps) {
  const { t } = useTranslation('ui/activity-feed');
  const displayTitle = title || t('title');
  const displayEmptyMessage = emptyMessage || t('empty.description');
  const getActivityIcon = (item: ActivityItem) => {
    if (item.icon) return item.icon;

    const iconMap = {
      document: 'file-text',
      family: 'users',
      guardian: 'shield',
      will: 'file-signature',
      security: 'lock',
      system: 'settings',
    };

    return iconMap[item.type] || 'activity';
  };

  const getActivityColor = (item: ActivityItem) => {
    if (item.color) return item.color;

    const colorMap = {
      document: 'info',
      family: 'success',
      guardian: 'warning',
      will: 'primary',
      security: 'danger',
      system: 'info',
    } as const;

    return colorMap[item.type] || 'primary';
  };

  const colorClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-green-500/10 text-green-600 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    danger: 'bg-red-500/10 text-red-600 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  } as const;

  return (
    <FadeIn duration={0.5}>
      <Card className={cn('h-full', className)}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <CardTitle className='text-lg font-semibold'>{displayTitle}</CardTitle>
          {showViewAll && onViewAll && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onViewAll}
              className='text-primary hover:text-primary-hover'
            >
              {t('viewAll')}
              <Icon name='arrowRight' className='ml-2 h-4 w-4' />
            </Button>
          )}
        </CardHeader>
        <CardContent className='p-0'>
          {loading ? (
            <div className='p-6 space-y-4'>
              {[1, 2, 3].map(i => (
                <div key={i} className='flex items-start space-x-3'>
                  <div className='w-10 h-10 bg-muted rounded-full animate-pulse' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-muted rounded animate-pulse w-3/4' />
                    <div className='h-3 bg-muted rounded animate-pulse w-1/2' />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className='p-6 text-center text-muted-foreground'>
              <Icon
                name='inbox'
                className='w-12 h-12 mx-auto mb-3 opacity-50'
              />
              <p>{displayEmptyMessage}</p>
            </div>
          ) : (
            <ScrollArea className='px-6' style={{ maxHeight }}>
              <div className='space-y-4 pb-4'>
                {activities.map((activity, index) => (
                  <ActivityItemComponent
                    key={activity.id}
                    item={activity}
                    icon={getActivityIcon(activity)}
                    color={getActivityColor(activity)}
                    colorClasses={colorClasses}
                    isLast={index === activities.length - 1}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}

type ColorClass = 'danger' | 'info' | 'primary' | 'success' | 'warning';

interface ActivityItemProps {
  color: ColorClass;
  colorClasses: Record<ColorClass, string>;
  icon: string;
  isLast: boolean;
  item: ActivityItem;
}

function ActivityItemComponent({
  item,
  icon,
  color,
  colorClasses,
  isLast,
}: ActivityItemProps) {
  return (
    <div
      className={cn('relative flex items-start space-x-3', !isLast && 'pb-4')}
    >
      {/* Timeline line */}
      {!isLast && (
        <div className='absolute left-5 top-10 bottom-0 w-px bg-border' />
      )}

      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center border',
          colorClasses[color]
        )}
      >
        <Icon name={icon as any} className='w-5 h-5' />
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <p className='text-sm font-medium text-card-foreground'>
              {item.action}
            </p>
            <p className='text-sm text-muted-foreground mt-0.5'>
              {item.description}
            </p>

            {/* Metadata badges */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className='flex flex-wrap gap-1 mt-2'>
                {Object.entries(item.metadata)
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <Badge key={key} variant='secondary' className='text-xs'>
                      {key}: {String(value)}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Timestamp and user */}
        <div className='flex items-center mt-2 text-xs text-muted-foreground'>
          <Icon name='clock' className='w-3 h-3 mr-1' />
          <span>
            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
          </span>
          {item.user && (
            <>
              <span className='mx-2'>•</span>
              <span>{item.user.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper hook to generate mock activities for testing
export function useMockActivities(): ActivityItem[] {
  return [
    {
      id: '1',
      type: 'document',
      action: 'Document Uploaded',
      description: 'Birth Certificate was added to your vault',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      metadata: { category: 'Personal', status: 'OCR Complete' },
    },
    {
      id: '2',
      type: 'family',
      action: 'Family Member Added',
      description: 'Jane Doe was added as a spouse',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      metadata: { role: 'Spouse', status: 'Active' },
    },
    {
      id: '3',
      type: 'guardian',
      action: 'Guardian Appointed',
      description: 'John Smith was designated as an executor',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      metadata: { permission: 'Full Access' },
    },
    {
      id: '4',
      type: 'security',
      action: 'Security Update',
      description: 'Two-factor authentication was enabled',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      color: 'success',
    },
    {
      id: '5',
      type: 'will',
      action: 'Will Progress',
      description: 'Will draft reached 75% completion',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      metadata: { progress: '75%' },
    },
  ];
}
