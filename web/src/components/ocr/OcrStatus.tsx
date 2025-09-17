
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useOcrService } from '@/services/ocr.service';
import { useEffect, useState } from 'react';

interface OcrStatusProps {
  className?: string;
  showOnlyWhenUnavailable?: boolean;
  variant?: 'alert' | 'inline';
}

export function OcrStatus({
  className,
  showOnlyWhenUnavailable = false,
  variant = 'alert',
}: OcrStatusProps) {
  const { isAvailable, statusMessage } = useOcrService();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Determine visibility based on props and availability
    if (showOnlyWhenUnavailable) {
      setIsVisible(!isAvailable);
    } else {
      setIsVisible(true);
    }
  }, [isAvailable, showOnlyWhenUnavailable]);

  if (!isVisible) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        {isAvailable ? (
          <>
            <CheckCircle2 className='h-4 w-4 text-primary' />
            <span className='text-muted-foreground'>OCR available</span>
          </>
        ) : (
          <>
            <Info className='h-4 w-4 text-accent' />
            <span className='text-muted-foreground'>Manual entry mode</span>
          </>
        )}
      </div>
    );
  }

  // Alert variant
  if (!isAvailable) {
    return (
      <Alert className={className}>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>OCR Service Status</AlertTitle>
        <AlertDescription>{statusMessage}</AlertDescription>
      </Alert>
    );
  }

  return null;
}

// OCR availability badge for document upload forms
export function OcrBadge({ className }: { className?: string }) {
  const { isAvailable } = useOcrService();

  if (!isAvailable) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 ${className}`}
      >
        <Info className='h-3 w-3' />
        Manual Entry
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 ${className}`}
    >
      <CheckCircle2 className='h-3 w-3' />
      OCR Ready
    </span>
  );
}
