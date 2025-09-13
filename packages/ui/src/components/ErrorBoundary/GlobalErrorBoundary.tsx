
import React from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Button, H2, Paragraph, XStack, YStack } from 'tamagui';
import { AlertCircle, RefreshCw } from '@tamagui/lucide-icons';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

// Default fallback component with LegacyGuard styling
const DefaultErrorFallback: React.FC<FallbackProps> = ({
  resetErrorBoundary,
}) => {
  const handleRefresh = () => {
    // Try to reset the error boundary first
    resetErrorBoundary?.();

    // If we're in a web environment, reload the page
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <YStack
      flex={1}
      justifyContent='center'
      alignItems='center'
      padding='$6'
      backgroundColor='$background'
      gap='$4'
    >
      {/* Error Icon */}
      <XStack
        width='$8'
        height='$8'
        borderRadius={40}
        backgroundColor='$red1'
        justifyContent='center'
        alignItems='center'
        marginBottom='$2'
      >
        <AlertCircle size='$2' color='$red9' />
      </XStack>

      {/* Error Title */}
      <H2
        textAlign='center'
        color='$gray12'
        fontFamily='$heading'
        fontWeight='600'
        marginBottom='$2'
      >
        Unexpected Error
      </H2>

      {/* Error Message */}
      <Paragraph
        textAlign='center'
        color='$gray11'
        fontSize='$4'
        lineHeight='$2'
        maxWidth={400}
        marginBottom='$4'
      >
        We apologize, an unexpected error has occurred. Our team has been
        notified. Please try refreshing the page.
      </Paragraph>

      {/* Refresh Button */}
      <Button
        onPress={handleRefresh}
        backgroundColor='$blue9'
        color='white'
        borderRadius='$4'
        paddingHorizontal='$6'
        paddingVertical='$3'
        fontSize='$4'
        fontWeight='500'
        pressStyle={{
          backgroundColor: '$blue10',
          scale: 0.98,
        }}
        hoverStyle={{
          backgroundColor: '$blue10',
        }}
        iconAfter={<RefreshCw size='$1' />}
      >
        Refresh Page
      </Button>

      {/* Subtle decoration for premium feel */}
      <YStack
        position='absolute'
        top='$10'
        right='$10'
        opacity={0.05}
        pointerEvents='none'
      >
        <XStack gap='$2'>
          {Array.from({ length: 3 }, (_, i) => (
            <YStack
              key={i}
              width='$1'
              height='$1'
              borderRadius={20}
              backgroundColor='$gray8'
            />
          ))}
        </XStack>
      </YStack>
    </YStack>
  );
};

// Error logging function
const logError = (error: Error, errorInfo: React.ErrorInfo) => {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('GlobalErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
  }

  // In production, send to your observability pipeline
  // Example: Supabase logs + DB error table; critical alerts via Resend
  try {
    if (process.env.NODE_ENV === 'production') {
      // Replace with your actual error reporting service integration
      // Example: monitoringService.trackError(error, { extra: errorInfo });
      console.error('Error logged to monitoring service:', error);
    }
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
};

export const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({
  children,
  fallback: CustomFallback,
  onError,
  onReset,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log the error
    logError(error, errorInfo);

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  };

  const handleReset = () => {
    // Call custom reset handler if provided
    onReset?.();
  };

  return (
    <ErrorBoundary
      FallbackComponent={CustomFallback || DefaultErrorFallback}
      onError={handleError}
      onReset={handleReset}
      resetKeys={[]} // Add keys here if you want to reset on specific prop changes
    >
      {children}
    </ErrorBoundary>
  );
};

export type { FallbackProps, GlobalErrorBoundaryProps };
