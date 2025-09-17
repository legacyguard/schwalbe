
/**
 * BackupRestore Component - User interface for data backup and restore
 * Provides export/import functionality with visual feedback
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { backupService } from '@/services/backupService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function BackupRestore() {
  const { t } = useTranslation('ui/backup-restore');
  const { userId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupSize, setBackupSize] = useState<string>('');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<null | string>(null);
  const [encryptBackup, setEncryptBackup] = useState(true);
  const [exportPassword, setExportPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Load last backup date from localStorage
    if (userId) {
      const lastBackup = localStorage.getItem(`lastBackup_${userId}`);
      if (lastBackup) {
        setLastBackupDate(new Date(lastBackup).toLocaleDateString());
      }

      // Estimate backup size
      backupService.estimateBackupSize(userId).then(size => {
        setBackupSize(size);
      });
    }
  }, [userId]);

  const handleExport = async () => {
    if (!userId) {
      toast.error(t('errors.loginRequired'));
      return;
    }

    if (encryptBackup && !exportPassword) {
      toast.error(t('errors.passwordRequired'));
      return;
    }

    if (encryptBackup && exportPassword.length < 8) {
      toast.error(t('errors.passwordTooShort'));
      return;
    }

    setIsExporting(true);
    try {
      await backupService.exportData(
        userId,
        encryptBackup ? exportPassword : undefined
      );

      // Save last backup date
      const now = new Date().toISOString();
      localStorage.setItem(`lastBackup_${userId}`, now);
      setLastBackupDate(new Date(now).toLocaleDateString());
    } catch (_error) {
      console.error('Export error:', error);
      toast.error(t('errors.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      toast.error(t('errors.invalidFileType'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('errors.fileTooLarge'));
      return;
    }

    setSelectedFile(file);

    // Check if file is encrypted by reading first part
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.encrypted) {
          setShowImportPassword(true);
          toast.info(t('messages.encrypted'));
        } else {
          // Directly import if not encrypted
          handleImport(file);
        }
      } catch (_error) {
        toast.error(t('errors.invalidFormat'));
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async (file?: File, password?: string) => {
    if (!userId) {
      toast.error(t('errors.importLoginRequired'));
      return;
    }

    const fileToImport = file || selectedFile;
    if (!fileToImport) return;

    setIsImporting(true);
    try {
      await backupService.importData(
        fileToImport,
        userId,
        password || importPassword || undefined
      );
    } catch (_error) {
      console.error('Import error:', error);
      toast.error(t('errors.importFailed'));
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
      setImportPassword('');
      setShowImportPassword(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = async () => {
    if (!userId) return;

    try {
      await backupService.clearAllData(userId);
      setShowClearDialog(false);

      // Clear last backup date
      localStorage.removeItem(`lastBackup_${userId}`);
      setLastBackupDate(null);

      // Reload page after clearing
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (_error) {
      console.error('Clear data error:', error);
      toast.error(t('errors.clearDataFailed'));
    }
  };

  return (
    <FadeIn duration={0.5} delay={0.2}>
      <Card className='p-8 bg-card border-card-border'>
        <div className='space-y-6'>
          {/* Header */}
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='text-2xl font-bold flex items-center gap-3'>
                <Icon name='database' className='w-7 h-7 text-primary' />
                {t('title')}
              </h2>
              <p className='text-muted-foreground mt-2'>
                {t('description')}
              </p>
            </div>
            {lastBackupDate && (
              <div className='text-sm text-muted-foreground text-right'>
                <p>{t('lastBackup')}</p>
                <p className='font-medium'>{lastBackupDate}</p>
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className='space-y-4 p-6 bg-muted/20 rounded-lg border border-muted/30'>
            <div className='flex items-start gap-4'>
              <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0'>
                <Icon name='download' className='w-6 h-6 text-primary' />
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold mb-2'>{t('export.title')}</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  {t('export.description')}
                </p>
                {backupSize && (
                  <p className='text-xs text-muted-foreground mb-4'>
                    {t('export.estimatedSize', { size: backupSize })}
                  </p>
                )}

                {/* Encryption Options */}
                <div className='space-y-4 mb-4 p-4 bg-muted/10 rounded-lg border border-muted/20'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='encrypt-backup'
                      checked={encryptBackup}
                      onCheckedChange={checked =>
                        setEncryptBackup(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor='encrypt-backup'
                      className='text-sm font-medium'
                    >
                      {t('export.encryptOption')}
                    </Label>
                  </div>

                  {encryptBackup && (
                    <div className='space-y-2'>
                      <Label htmlFor='export-password' className='text-sm'>
                        {t('export.passwordLabel')}
                      </Label>
                      <div className='relative'>
                        <Input
                          id='export-password'
                          type={showExportPassword ? 'text' : 'password'}
                          value={exportPassword}
                          onChange={e => setExportPassword(e.target.value)}
                          placeholder={t('export.passwordPlaceholder')}
                          className='pr-10'
                        />
                        <button
                          type='button'
                          onClick={() =>
                            setShowExportPassword(!showExportPassword)
                          }
                          className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                        >
                          <Icon
                            name={showExportPassword ? 'eye-off' : 'eye'}
                            className='w-4 h-4'
                          />
                        </button>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {t('export.passwordWarning')}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleExport}
                  disabled={isExporting || isImporting}
                  className='bg-primary hover:bg-primary-hover'
                >
                  {isExporting ? (
                    <>
                      <Icon
                        name='upload'
                        className='w-4 h-4 mr-2 animate-pulse'
                      />
                      {t('export.preparing')}
                    </>
                  ) : (
                    <>
                      <Icon name='download' className='w-4 h-4 mr-2' />
                      {t('export.button')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className='space-y-4 p-6 bg-muted/20 rounded-lg border border-muted/30'>
            <div className='flex items-start gap-4'>
              <div className='w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0'>
                <Icon name='upload' className='w-6 h-6 text-blue-600' />
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold mb-2'>{t('import.title')}</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  {t('import.description')}
                </p>
                {/* Password input for encrypted backups */}
                {showImportPassword && (
                  <div className='space-y-4 mb-4 p-4 bg-muted/10 rounded-lg border border-muted/20'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='import-password'
                        className='text-sm font-medium'
                      >
                        {t('import.passwordRequired')}
                      </Label>
                      <div className='relative'>
                        <Input
                          id='import-password'
                          type='password'
                          value={importPassword}
                          onChange={e => setImportPassword(e.target.value)}
                          placeholder={t('import.passwordPlaceholder')}
                          className='pr-10'
                          onKeyDown={e => {
                            if (e.key === 'Enter' && importPassword) {
                              handleImport(undefined, importPassword);
                            }
                          }}
                        />
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          onClick={() =>
                            handleImport(undefined, importPassword)
                          }
                          disabled={!importPassword || isImporting}
                        >
                          <Icon name='unlock' className='w-4 h-4 mr-2' />
                          {t('import.decryptButton')}
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            setShowImportPassword(false);
                            setImportPassword('');
                            setSelectedFile(null);
                          }}
                        >
                          {t('import.cancel')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className='flex items-center gap-3'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.json'
                    onChange={handleFileSelect}
                    disabled={isExporting || isImporting}
                    className='hidden'
                    id='backup-file-input'
                  />
                  <label htmlFor='backup-file-input'>
                    <Button
                      asChild
                      variant='outline'
                      disabled={isExporting || isImporting}
                    >
                      <span>
                        {isImporting ? (
                          <>
                            <Icon
                              name='upload'
                              className='w-4 h-4 mr-2 animate-pulse'
                            />
                            {t('import.importing')}
                          </>
                        ) : (
                          <>
                            <Icon name='upload' className='w-4 h-4 mr-2' />
                            {t('import.button')}
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  <span className='text-xs text-muted-foreground'>
                    {t('import.maxFileSize')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className='bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4'>
            <div className='flex gap-3'>
              <Icon
                name='info'
                className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5'
              />
              <div className='text-sm space-y-2'>
                <p className='font-medium text-blue-900 dark:text-blue-100'>
                  {t('info.title')}
                </p>
                <ul className='space-y-1 text-blue-800 dark:text-blue-200'>
                  {(t('info.points', { returnObjects: true }) as string[]).map((point: string, index: number) => (
                    <li key={index} className='flex items-start gap-2'>
                      <span className='text-blue-600 mt-1'>•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className='border-t border-card-border pt-6'>
            <h3 className='text-lg font-semibold mb-4 text-status-error'>
              {t('dangerZone.title')}
            </h3>
            <div className='p-4 border-2 border-status-error/20 rounded-lg bg-status-error/5'>
              <div className='flex items-start gap-4'>
                <Icon
                  name='triangle-exclamation'
                  className='w-6 h-6 text-status-error flex-shrink-0 mt-1'
                />
                <div className='flex-1'>
                  <h4 className='font-medium mb-2'>{t('dangerZone.clearTitle')}</h4>
                  <p className='text-sm text-muted-foreground mb-4'>
                    {t('dangerZone.clearDescription')}
                  </p>
                  <Button
                    variant='destructive'
                    onClick={() => setShowClearDialog(true)}
                    disabled={isExporting || isImporting}
                  >
                    <Icon name='trash' className='w-4 h-4 mr-2' />
                    {t('dangerZone.clearButton')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Data Confirmation Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className='flex items-center gap-2'>
                <Icon
                  name='triangle-exclamation'
                  className='w-5 h-5 text-status-error'
                />
                {t('dialog.confirmTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription className='space-y-3'>
                <p>
                  {t('dialog.confirmDescription')}
                </p>
                <ul className='list-disc list-inside space-y-1 text-sm'>
                  {(t('dialog.confirmItems', { returnObjects: true }) as string[]).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p className='font-medium text-status-error'>
                  {t('dialog.confirmWarning')}
                </p>
                <p>{t('dialog.confirmBackupReminder')}</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('dialog.cancelButton')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearData}
                className='bg-status-error hover:bg-status-error/90'
              >
                {t('dialog.confirmButton')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </FadeIn>
  );
}
