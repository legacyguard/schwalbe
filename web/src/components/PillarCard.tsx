
import React from 'react';
import { Icon, type IconName } from '@/components/ui/icon-library';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PillarCardProps {
  actionButton?: {
    href?: string;
    onClick?: () => void;
    text: string;
  };
  children?: React.ReactNode;
  className?: string;
  icon: IconName;
  isActive?: boolean;
  isLocked?: boolean;
  subtitle?: string;
  title: string;
}

export function PillarCard({
  title,
  subtitle,
  icon,
  isActive = false,
  isLocked = false,
  children,
  className,
  actionButton,
}: PillarCardProps) {
  const { t } = useTranslation('ui/pillar-card');
  return (
    <div
      className={cn(
        'transition-all duration-300 hover:shadow-lg border rounded-lg p-6 relative overflow-hidden',
        isActive && 'ring-2 ring-blue-500 shadow-lg',
        isLocked && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {/* Background Gradient for Active Card */}
      {isActive && (
        <div className='absolute inset-0 bg-blue-500/5 rounded-lg' />
      )}

      {/* Lock Badge */}
      {isLocked && (
        <div className='absolute top-4 right-4 z-10'>
          <BadgeComponent variant='outline'>{t('comingSoon')}</BadgeComponent>
        </div>
      )}

      <div className='space-y-6'>
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-lg flex items-center justify-center ${
            isActive
              ? 'bg-blue-500'
              : isLocked
                ? 'bg-gray-300'
                : 'bg-blue-500/10'
          } ${isActive || isLocked ? 'opacity-100' : 'opacity-10'}`}
        >
          <Icon name={icon} className='w-8 h-8' />
        </div>

        {/* Title Section */}
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold'>{title}</h3>
          {subtitle && <p className='text-sm text-gray-600'>{subtitle}</p>}
        </div>

        {/* Content */}
        {children && <div>{children}</div>}

        {/* Action Button */}
        {actionButton && !isLocked && (
          <Button
            variant='outline'
            size='sm'
            onClick={actionButton.onClick || (() => {})}
            {...(actionButton.href && { asChild: true })}
          >
            {actionButton.text}
          </Button>
        )}
      </div>
    </div>
  );
}
