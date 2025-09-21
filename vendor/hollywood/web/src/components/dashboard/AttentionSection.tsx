
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { useTranslation } from 'react-i18next';

interface AttentionItem {
  actionText: string;
  description: string;
  icon: IconName;
  id: string;
  onAction: () => void;
  title: string;
  type: 'expiration' | 'guardian' | 'security' | 'sofia_suggestion' | 'task';
  urgency: 'high' | 'low' | 'medium';
}

interface AttentionSectionProps {
  className?: string;
}

export const AttentionSection: React.FC<AttentionSectionProps> = ({
  className,
}) => {
  const { t } = useTranslation('ui/attention-section');

  // Mock data - in real implementation, this would come from API/hooks
  const attentionItems: AttentionItem[] = [
    {
      id: '1',
      type: 'expiration',
      title: t('items.passportExpiring.title', { days: 28 }),
      description: t('items.passportExpiring.description'),
      icon: 'calendar',
      actionText: t('items.passportExpiring.actionText'),
      onAction: () => {
        // Show passport details
      },
      urgency: 'medium',
    },
    {
      id: '2',
      type: 'guardian',
      title: t('items.guardianPending.title', { name: 'Jane Smith' }),
      description: t('items.guardianPending.description'),
      icon: 'user-plus',
      actionText: t('items.guardianPending.actionText'),
      onAction: () => {
        // Send reminder to guardian
      },
      urgency: 'low',
    },
    {
      id: '3',
      type: 'sofia_suggestion',
      title: t('items.sofiaSuggestion.title', { count: 2 }),
      description: t('items.sofiaSuggestion.description', { bundle: 'Home Mortgage' }),
      icon: 'sparkles',
      actionText: t('items.sofiaSuggestion.actionText'),
      onAction: () => {
        // Show Sofia suggestion
      },
      urgency: 'low',
    },
  ];

  // If no items need attention, don't render the section
  if (attentionItems.length === 0) {
    return null;
  }

  const getUrgencyStyles = (urgency: AttentionItem['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getIconColor = (urgency: AttentionItem['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <FadeIn duration={0.5} delay={0.3}>
      <section className={className}>
        <div className='mb-6'>
          <div className='flex items-center gap-3 mb-2'>
            <Icon name='alert-circle' className='w-6 h-6 text-primary' />
            <h2 className='text-2xl font-bold font-heading text-card-foreground'>
              Current Challenges
            </h2>
          </div>
          <p className='text-muted-foreground'>
            Situations requiring your protective attention
          </p>
        </div>

        <div className='space-y-4'>
          {attentionItems.map((item, index) => (
            <FadeIn key={item.id} duration={0.4} delay={0.1 * index}>
              <Card
                className={`p-4 border-l-4 ${getUrgencyStyles(item.urgency)}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-start gap-4 flex-1'>
                    <div
                      className={`p-2 rounded-lg bg-background ${getIconColor(item.urgency)}`}
                    >
                      <Icon name={item.icon} className='w-5 h-5' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-card-foreground mb-1'>
                        {item.title}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={item.onAction}
                    className='ml-4 shrink-0'
                  >
                    {item.actionText}
                  </Button>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>
    </FadeIn>
  );
};
