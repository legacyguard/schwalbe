
import React, { useEffect, useState } from 'react';
import { useEncryption } from '@/hooks/encryption/useEncryption';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

export function PasswordPrompt() {
  const { t } = useTranslation('ui/password-prompt');
  const {
    passwordPromptVisible,
    hidePasswordPrompt,
    unlockKeys,
    isLoading,
    needsMigration,
    migrateKeys,
  } = useEncryption();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!passwordPromptVisible) {
      // Reset state when dialog closes
      setPassword('');
      setShowPassword(false);
      setError('');
      setAttempts(0);
    }
  }, [passwordPromptVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError(t('validation.pleaseEnterPassword'));
      return;
    }

    const success = needsMigration
      ? await migrateKeys(password)
      : await unlockKeys(password);

    if (success) {
      hidePasswordPrompt();
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        setError(
          t('validation.tooManyAttempts')
        );
      } else {
        setError(t('validation.incorrectPassword'));
      }
    }
  };

  const handleCancel = () => {
    hidePasswordPrompt();
  };

  return (
    <Dialog
      open={passwordPromptVisible}
      onOpenChange={(open: boolean) => !open && hidePasswordPrompt()}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <Lock className='h-5 w-5 text-primary' />
            <DialogTitle>
              {needsMigration ? t('migrate.title') : t('unlock.title')}
            </DialogTitle>
          </div>
          <DialogDescription>
            {needsMigration
              ? t('migrate.description')
              : t('unlock.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='password'>{t('form.labels.encryptionPassword')}</Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('form.placeholders.enterPassword')}
                disabled={isLoading}
                autoFocus
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded'
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4 text-gray-500' />
                ) : (
                  <Eye className='h-4 w-4 text-gray-500' />
                )}
              </button>
            </div>
          </div>

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {needsMigration && (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {t('alerts.migrationNotice')}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t('buttons.cancel')}
            </Button>
            <Button type='submit' disabled={isLoading || !password}>
              {isLoading
                ? t('buttons.unlocking')
                : needsMigration
                  ? t('buttons.migrateAndUnlock')
                  : t('buttons.unlock')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
