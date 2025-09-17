'use client';

import { useEffect, useState } from 'react';
import { useEncryption } from '@/hooks/useEncryption';
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

/**
 * Password prompt dialog for unlocking encryption keys
 * Handles both regular unlock and migration scenarios
 */
export function PasswordPrompt() {
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
      setError('Please enter your password');
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
          'Too many failed attempts. Check your password or contact support.'
        );
      } else {
        setError('Incorrect password. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    hidePasswordPrompt();
  };

  return (
    <Dialog
      open={passwordPromptVisible}
      onOpenChange={open => !open && hidePasswordPrompt()}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <Lock className='h-5 w-5 text-primary' />
            <DialogTitle>
              {needsMigration ? 'Migrate Encryption Keys' : 'Unlock Encryption'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {needsMigration
              ? 'Your encryption keys need to be migrated to our new secure system. Enter your password to continue.'
              : 'Enter your encryption password to access your protected documents.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='password'>Encryption Password</Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Enter your password'
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
                <strong>Important:</strong> This is a one-time migration to
                improve security. Your data will remain encrypted and secure
                throughout the process.
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
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading || !password}>
              {isLoading
                ? 'Unlocking...'
                : needsMigration
                  ? 'Migrate & Unlock'
                  : 'Unlock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
