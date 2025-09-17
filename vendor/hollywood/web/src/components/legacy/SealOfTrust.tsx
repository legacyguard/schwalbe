
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon-library';
import { useLocalization } from '@/contexts/LocalizationContext';

interface SealOfTrustProps {
  className?: string;
  createdAt?: string;
  documentId?: string;
  variant?: 'compact' | 'detailed' | 'pdf';
}

export const SealOfTrust: React.FC<SealOfTrustProps> = ({
  variant = 'detailed',
  documentId,
  createdAt,
  className = '',
}) => {
  const { jurisdiction } = useLocalization();

  // Generate document hash if not provided
  const finalDocumentId = documentId || generateDocumentHash();
  const finalCreatedAt = createdAt || new Date().toISOString().split('T')[0];

  // Jurisdiction-specific legal compliance text
  const getComplianceText = () => {
    switch (jurisdiction) {
      case 'Slovakia':
        return 'This document template complies with Slovak Civil Code (Act No. 40/2014 Coll.) as of';
      case 'Czech Republic':
        return 'This document template complies with Czech Civil Code (Act No. 89/2012 Coll.) as of';
      default:
        return 'This document template follows international best practices for will creation as of';
    }
  };

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}
      >
        <div className='w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center'>
          <Icon
            name="shield-check"
            className='w-2.5 h-2.5 text-primary'
          />
        </div>
        <span>LegacyGuard Certified</span>
      </div>
    );
  }

  if (variant === 'pdf') {
    return (
      <div
        className={`border-t border-gray-300 pt-4 mt-8 text-xs text-gray-600 ${className}`}
      >
        <div className='flex items-start gap-3'>
          <div className='w-8 h-8 border-2 border-primary rounded-full flex items-center justify-center flex-shrink-0'>
            <Icon
              name="shield-check"
              className='w-4 h-4 text-primary'
            />
          </div>
          <div className='flex-1'>
            <div className='font-semibold mb-1'>
              LegacyGuard Legal Certification
            </div>
            <p className='mb-2'>
              {getComplianceText()} {finalCreatedAt}.
            </p>
            <div className='flex items-center gap-4 text-xs'>
              <div>
                <span className='font-medium'>Document ID:</span>{' '}
                {finalDocumentId}
              </div>
              <div>
                <span className='font-medium'>Generated:</span> {finalCreatedAt}
              </div>
              <div>
                <span className='font-medium'>Version:</span> 2.0
              </div>
            </div>
            <div className='mt-2 p-2 bg-blue-50 rounded text-blue-800 text-xs'>
              <strong>Verification:</strong> This document was generated using
              LegacyGuard's intelligent legal template system. While legally
              compliant, we recommend having it reviewed by a qualified attorney
              for your specific circumstances.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default 'detailed' variant
  return (
    <div
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}
    >
      <div className='flex items-start gap-3'>
        {/* LegacyGuard Shield Logo */}
        <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0'>
          <Icon name="shield-check" className='w-5 h-5 text-primary' />
        </div>

        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <h4 className='font-semibold text-blue-900 dark:text-blue-200'>
              LegacyGuard Legal Certification
            </h4>
            <Badge className='bg-primary/10 text-primary border-primary/20 text-xs'>
              Certified
            </Badge>
          </div>

          <p className='text-sm text-blue-800 dark:text-blue-300 mb-3'>
            {getComplianceText()} {finalCreatedAt}. This template has been
            reviewed by legal experts and follows current legislation
            requirements.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400'>
            <div className='flex items-center gap-2'>
              <Icon name="calendar" className='w-3 h-3' />
              <span>
                <strong>Generated:</strong> {finalCreatedAt}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Icon name="hash" className='w-3 h-3' />
              <span>
                <strong>Doc ID:</strong> {finalDocumentId.slice(0, 12)}...
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Icon name="map-pin" className='w-3 h-3' />
              <span>
                <strong>Jurisdiction:</strong> {jurisdiction}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Icon name="award" className='w-3 h-3' />
              <span>
                <strong>Template Version:</strong> 2.0
              </span>
            </div>
          </div>

          <div className='mt-3 pt-3 border-t border-blue-200 dark:border-blue-800'>
            <div className='flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400'>
              <Icon name="info" className='w-3 h-3' />
              <span>
                <strong>Legal Notice:</strong> While this template complies with
                current law, we recommend consulting a qualified attorney for
                personalized legal advice.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Generate a simple document hash for uniqueness
function generateDocumentHash(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return `LG-${timestamp.slice(-6)}-${random.slice(0, 6)}`.toUpperCase();
}
