/**
 * Email Import Button Component
 * Entry point for Gmail document import feature
 */

import { useState } from 'react';
import { Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EmailImportWizard } from '@/components/email-import/EmailImportWizard';
import type { BulkImportResult } from '@/types/gmail';

interface EmailImportButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  onComplete?: (result: BulkImportResult) => void;
  className?: string;
}

export function EmailImportButton({
  variant = 'default',
  size = 'default',
  onComplete,
  className,
}: EmailImportButtonProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleComplete = (result: BulkImportResult) => {
    setIsWizardOpen(false);
    onComplete?.(result);

    // Show success notification or navigate to documents
    console.log('Import completed:', result);
  };

  const handleClose = () => {
    setIsWizardOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsWizardOpen(true)}
        className={className}
      >
        <Mail className='h-4 w-4 mr-2' />
        Importovať z Gmailu
      </Button>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className='max-w-5xl p-0 bg-transparent border-0'>
          <EmailImportWizard
            onComplete={handleComplete}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick import variant for dashboards
export function QuickEmailImportCard() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <>
      <div className='border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors cursor-pointer'
           onClick={() => setIsWizardOpen(true)}>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
            <Download className='h-6 w-6 text-blue-600' />
          </div>

          <div className='flex-1'>
            <h3 className='font-semibold text-gray-900'>
              Import dokumentov z Gmailu
            </h3>
            <p className='text-sm text-gray-600 mt-1'>
              Automaticky nájdite a importujte dôležité dokumenty z vašich emailov
            </p>

            <div className='flex items-center gap-4 mt-3 text-xs text-gray-500'>
              <span className='flex items-center gap-1'>
                <Mail className='h-3 w-3' />
                Bezpečné pripojenie
              </span>
              <span>• AI kategorizácia</span>
              <span>• Detekcia duplikátov</span>
            </div>
          </div>

          <Button size='sm' className='bg-blue-600 hover:bg-blue-700'>
            Spustiť import
          </Button>
        </div>
      </div>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className='max-w-5xl p-0 bg-transparent border-0'>
          <EmailImportWizard
            onComplete={() => setIsWizardOpen(false)}
            onClose={() => setIsWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}