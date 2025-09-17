
import React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { Badge } from '@/components/ui/badge';
import { useFocusMode } from '@/contexts/FocusModeContext';

interface FocusModeWrapperProps {
  children: React.ReactNode;
  currentStepIndex?: number;
  currentStepTitle?: string;
  onExitWizard?: () => void;
  totalSteps?: number;
}

export const FocusModeWrapper: React.FC<FocusModeWrapperProps> = ({
  children,
  currentStepTitle,
  currentStepIndex,
  totalSteps,
  onExitWizard,
}) => {
  const { isFocusMode, exitFocusMode } = useFocusMode();

  if (!isFocusMode) {
    return <>{children}</>;
  }

  return (
    <div className='fixed inset-0 z-50 bg-background'>
      {/* Focus Mode Header */}
      <div className='h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-14 items-center justify-between px-6'>
          {/* Left side - Step info */}
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Icon
                name="document-text"
                className='w-5 h-5 text-primary'
              />
              <span className='font-semibold text-lg'>Will Creation</span>
            </div>

            {currentStepTitle && (
              <div className='hidden sm:flex items-center gap-3'>
                <div className='w-px h-6 bg-border' />
                <Badge variant='secondary' className='font-medium'>
                  Step {currentStepIndex ? currentStepIndex + 1 : 1} of{' '}
                  {totalSteps || 8}
                </Badge>
                <span className='text-sm text-muted-foreground'>
                  {currentStepTitle}
                </span>
              </div>
            )}
          </div>

          {/* Right side - Exit button */}
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={exitFocusMode}
              className='text-muted-foreground hover:text-foreground'
            >
              <Icon name="minimize-2" className='w-4 h-4 mr-2' />
              Exit Focus Mode
            </Button>

            {onExitWizard && (
              <>
                <div className='w-px h-6 bg-border mx-2' />
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onExitWizard}
                  className='text-muted-foreground hover:text-foreground'
                >
                  <Icon name="x" className='w-4 h-4 mr-2' />
                  Close Wizard
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className='h-[calc(100vh-3.5rem)] overflow-hidden'>{children}</div>
    </div>
  );
};
