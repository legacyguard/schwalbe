
/**
 * Email Import Button Component
 * Floating action button to trigger email import wizard
 */

import _React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { EmailImportWizard } from '@/components/email-import/EmailImportWizard';
import { BulkImportSummary } from '@/components/email-import/BulkImportSummary';
import type { BulkImportResult } from '@/types/gmail';
import { useABTest } from '@/lib/ab-testing/ab-testing-system';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface EmailImportButtonProps {
  className?: string;
  onImportComplete?: (result: BulkImportResult) => void;
}

export function EmailImportButton({
  onImportComplete,
  className,
}: EmailImportButtonProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isVariant } = useABTest('email_import_cta_v1', user?.id);
  const { t } = useTranslation('ui/email-import');

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(
    null
  );
  const [showSummary, setShowSummary] = useState(false);

  const handleImportComplete = (result: BulkImportResult) => {
    setImportResult(result);
    setIsWizardOpen(false);
    setShowSummary(true);
    onImportComplete?.(result);
  };

  const handleViewDocuments = () => {
    setShowSummary(false);
    navigate('/vault');
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setImportResult(null);
  };

  // Don't show in control variant for A/B testing
  if (isVariant('control')) {
    return null;
  }

  // Floating button variant
  if (isVariant('variant_a')) {
    return (
      <>
        <motion.div
          className={cn('fixed bottom-6 right-6 z-50', className)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsWizardOpen(true)}
            size='lg'
            className='rounded-full h-14 w-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300'
          >
            <Mail className='h-6 w-6' />
          </Button>

          {/* Pulse animation for attention */}
          <div className='absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20' />

          {/* Tooltip */}
          <div className='absolute bottom-16 right-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity'>
            {t('tooltip.gmail')}
          </div>
        </motion.div>

        <EmailImportDialog
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onImportComplete={handleImportComplete}
        />

        <ImportSummaryDialog
          isOpen={showSummary}
          result={importResult}
          onViewDocuments={handleViewDocuments}
          onClose={handleCloseSummary}
        />
      </>
    );
  }

  // Default inline variant
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('w-full', className)}
      >
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 relative overflow-hidden'>
          {/* Background decoration */}
          <div className='absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-30' />
          <div className='absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-30' />

          <div className='relative z-10 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center'>
                <Mail className='h-6 w-6 text-white' />
              </div>

              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <h3 className='font-semibold text-gray-900'>
                    {t('title')}
                  </h3>
                  <Badge
                    variant="secondary"
                    className='text-xs bg-yellow-100 text-yellow-800'
                  >
                    <Sparkles className='h-3 w-3 mr-1' />
                    {t('badge.new')}
                  </Badge>
                </div>
                <p className='text-sm text-gray-600'>
                  {t('description')}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsWizardOpen(true)}
              className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 shadow-md hover:shadow-lg transition-all'
            >
              <Upload className='h-4 w-4 mr-2' />
              {t('button.start')}
            </Button>
          </div>
        </div>
      </motion.div>

      <EmailImportDialog
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onImportComplete={handleImportComplete}
      />

      <ImportSummaryDialog
        isOpen={showSummary}
        result={importResult}
        onViewDocuments={handleViewDocuments}
        onClose={handleCloseSummary}
      />
    </>
  );
}

// Dialog wrapper for the email import wizard
interface EmailImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (result: BulkImportResult) => void;
}

function EmailImportDialog({
  isOpen,
  onClose,
  onImportComplete,
}: EmailImportDialogProps) {
  const { t } = useTranslation('ui/email-import');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto p-0'>
        <div className='relative'>
          <Button
            variant="ghost"
            size='sm'
            onClick={onClose}
            className='absolute top-4 right-4 z-10 rounded-full'
            title={t('dialog.close')}
          >
            <X className='h-4 w-4' />
          </Button>

          <div className='p-6'>
            <EmailImportWizard
              onComplete={onImportComplete}
              onClose={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Dialog wrapper for the import summary
interface ImportSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDocuments: () => void;
  result: BulkImportResult | null;
}

function ImportSummaryDialog({
  isOpen,
  result,
  onViewDocuments,
  onClose,
}: ImportSummaryDialogProps) {
  const { t } = useTranslation('ui/email-import');

  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto p-0'>
        <div className='relative'>
          <Button
            variant="ghost"
            size='sm'
            onClick={onClose}
            className='absolute top-4 right-4 z-10 rounded-full'
            title={t('dialog.close')}
          >
            <X className='h-4 w-4' />
          </Button>

          <div className='p-6'>
            <BulkImportSummary
              result={result}
              onViewDocuments={onViewDocuments}
              onClose={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
