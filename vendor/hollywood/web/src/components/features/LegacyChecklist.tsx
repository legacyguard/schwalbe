
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon-library';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ChecklistItem {
  description: string;
  icon: string;
  isActive?: boolean;
  isCompleted?: boolean;
  key: string;
  pillar: 'forever' | 'today' | 'tomorrow';
  title: string;
}

interface LegacyChecklistProps {
  className?: string;
  onItemClick?: (item: ChecklistItem) => void;
}

const getChecklistItems = (t: (key: string) => string): ChecklistItem[] => [
  // TODAY pillar items
  {
    key: 'setup-vault',
    icon: 'shield',
    title: t('items.setup-vault.title'),
    description: t('items.setup-vault.description'),
    isCompleted: true,
    pillar: 'today',
  },
  {
    key: 'upload-documents',
    icon: 'upload',
    title: t('items.upload-documents.title'),
    description: t('items.upload-documents.description'),
    isCompleted: true,
    pillar: 'today',
  },
  {
    key: 'add-guardians',
    icon: 'users',
    title: t('items.add-guardians.title'),
    description: t('items.add-guardians.description'),
    isCompleted: false,
    isActive: true,
    pillar: 'tomorrow',
  },
  // TOMORROW pillar items
  {
    key: 'set-permissions',
    icon: 'key',
    title: t('items.set-permissions.title'),
    description: t('items.set-permissions.description'),
    isCompleted: false,
    pillar: 'tomorrow',
  },
  {
    key: 'emergency-contacts',
    icon: 'phone',
    title: t('items.emergency-contacts.title'),
    description: t('items.emergency-contacts.description'),
    isCompleted: false,
    pillar: 'tomorrow',
  },
  // FOREVER pillar items
  {
    key: 'create-legacy',
    icon: 'heart',
    title: t('items.create-legacy.title'),
    description: t('items.create-legacy.description'),
    isCompleted: false,
    pillar: 'forever',
  },
  {
    key: 'schedule-reviews',
    icon: 'calendar',
    title: t('items.schedule-reviews.title'),
    description: t('items.schedule-reviews.description'),
    isCompleted: false,
    pillar: 'forever',
  },
];

export function LegacyChecklist({
  className,
  onItemClick,
}: LegacyChecklistProps) {
  const { t } = useTranslation('ui/legacy-checklist');
  const checklistItems = getChecklistItems(t);
  const completedItems = checklistItems.filter(item => item.isCompleted).length;
  const totalItems = checklistItems.length;
  const progressPercentage = Math.round((completedItems / totalItems) * 100);

  const handleItemClick = (item: ChecklistItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'today':
        return 'text-blue-600';
      case 'tomorrow':
        return 'text-green-600';
      case 'forever':
        return 'text-purple-600';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className={cn('max-w-2xl p-6', className)}>
      {/* Header with progress */}
      <div className='flex items-center gap-4 mb-6'>
        <div className='flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary-foreground to-primary flex items-center justify-center'>
          <Icon name="sparkles" className='w-7 h-7 text-white' />
        </div>
        <div className='flex-1'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='font-semibold text-lg'>
              {t('header.title')}
            </h3>
            <span className='text-sm font-medium text-muted-foreground'>
              {completedItems}/{totalItems} completed
            </span>
          </div>
          <Progress value={progressPercentage} className='h-2' />
        </div>
      </div>

      {/* Checklist items */}
      <div className='space-y-3'>
        {checklistItems.map(item => (
          <div
            key={item.key}
            className={cn(
              'flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-accent/50',
              {
                'bg-accent/30 border-primary/30': item.isActive,
                'border-border': !item.isActive,
                'opacity-90': item.isCompleted,
              }
            )}
            onClick={() => handleItemClick(item)}
          >
            {/* Icon */}
            <div className='flex-shrink-0 w-10 h-10 rounded-lg border border-border flex items-center justify-center'>
              <Icon
                name={item.icon as any}
                className={cn('w-5 h-5', getPillarColor(item.pillar))}
              />
            </div>

            {/* Content */}
            <div className='flex-1 min-w-0'>
              <h4 className='font-medium text-sm text-foreground mb-1'>
                {item.title}
              </h4>
              <p className='text-xs text-muted-foreground line-clamp-2'>
                {item.description}
              </p>
            </div>

            {/* Status indicator */}
            <div className='flex-shrink-0'>
              {item.isCompleted ? (
                <Icon
                  name="checkCircle"
                  className='w-7 h-7 text-status-success'
                />
              ) : (
                <Icon
                  name="arrowRight"
                  className='w-7 h-7 text-muted-foreground'
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className='mt-6 pt-4 border-t border-border'>
        <p className='text-sm text-muted-foreground mb-3'>
          You're {progressPercentage}% through your journey as a Guardian of
          Memories
        </p>
        <Button
          className='w-full'
          onClick={() => {
            const nextItem = checklistItems.find(item => !item.isCompleted);
            if (nextItem && onItemClick) {
              onItemClick(nextItem);
            }
          }}
        >
          Continue Your Journey
          <Icon name="arrowRight" className='w-4 h-4 ml-2' />
        </Button>
      </div>
    </Card>
  );
}

export default LegacyChecklist;
