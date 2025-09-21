
import React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { Card } from '@/components/ui/card';
import { useFocusMode } from '@/contexts/FocusModeContext';

interface FocusModeToggleProps {
  className?: string;
  variant?: 'card' | 'inline';
}

export const FocusModeToggle: React.FC<FocusModeToggleProps> = ({
  variant = 'inline',
  className = '',
}) => {
  const { isFocusMode, enterFocusMode } = useFocusMode();

  if (isFocusMode) {
    return null; // Don't show toggle when already in focus mode
  }

  const ToggleButton = () => (
    <Button
      onClick={enterFocusMode}
      variant='outline'
      className={`group transition-all duration-200 hover:bg-primary/5 hover:border-primary/20 ${className}`}
    >
      <Icon
        name='maximize-2'
        className='w-4 h-4 mr-2 group-hover:text-primary'
      />
      <span className='font-medium'>Enter Focus Mode</span>
      <Icon
        name='sparkles'
        className='w-3 h-3 ml-2 opacity-60 group-hover:opacity-100 group-hover:text-primary'
      />
    </Button>
  );

  if (variant === 'card') {
    return (
      <Card className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <h4 className='font-medium text-blue-900 dark:text-blue-100 mb-1'>
              Need to Focus?
            </h4>
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              Hide distractions and create your will in a calm, dedicated
              environment.
            </p>
          </div>
          <div className='ml-4'>
            <ToggleButton />
          </div>
        </div>
      </Card>
    );
  }

  return <ToggleButton />;
};
