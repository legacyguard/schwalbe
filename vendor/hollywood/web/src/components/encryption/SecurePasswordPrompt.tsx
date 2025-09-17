
/**
 * Secure Password Prompt Component
 * Handles secure key unlocking and first-time setup
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Key, Lock, Shield, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecureEncryption } from '@/hooks/useSecureEncryption';
import { SofiaFirefly } from '@/components/animations/SofiaFirefly';
import { useTranslation } from 'react-i18next';

interface SecurePasswordPromptProps {
  isSetup?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const SecurePasswordPrompt: React.FC<SecurePasswordPromptProps> = ({
  isSetup = false,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation('ui/secure-password-prompt');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    // isLoading, // Not used
    error,
    createKeys,
    unlockKeys,
    needsSetup,
  } = useSecureEncryption();

  const [setupMode, setSetupMode] = useState(isSetup);

  // Check if setup is needed
  useEffect(() => {
    const checkSetup = async () => {
      const needs = await needsSetup();
      setSetupMode(needs);
    };

    if (!isSetup) {
      checkSetup();
    }
  }, [isSetup, needsSetup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) return;

    if (setupMode && password !== confirmPassword) {
      return;
    }

    setIsSubmitting(true);

    try {
      let success = false;

      if (setupMode) {
        success = await createKeys(password);
      } else {
        success = await unlockKeys(password);

        if (!success) {
          setAttempts(prev => prev + 1);
        }
      }

      if (success) {
        onSuccess?.();
        setPassword('');
        setConfirmPassword('');
        setAttempts(0);
      }
    } catch (error) {
      console.error('Password prompt error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength =
    password.length >= 8
      ? password.length >= 12 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
        ? 'strong'
        : password.length >= 10 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password)
          ? 'medium'
          : 'weak'
      : 'too-short';

  const isPasswordValid = setupMode
    ? password.length >= 8 && password === confirmPassword
    : password.length > 0;

  const maxAttempts = 5;
  const isLocked = attempts >= maxAttempts;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className='w-full max-w-md'
      >
        <Card className='relative overflow-hidden border-2 border-primary/20'>
          {/* Sofia Firefly Animation */}
          <div className='absolute top-4 right-4 w-8 h-8'>
            <SofiaFirefly />
          </div>

          <CardHeader className='text-center pb-4'>
            <div className='mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
              <motion.div
                animate={{ rotate: setupMode ? 0 : [0, 10, -10, 0] }}
                transition={{
                  duration: 0.5,
                  repeat: setupMode ? 0 : Infinity,
                  repeatDelay: 3,
                }}
              >
                {setupMode ? (
                  <Key className='w-8 h-8 text-primary' />
                ) : (
                  <Lock className='w-8 h-8 text-primary' />
                )}
              </motion.div>
            </div>

            <CardTitle className='text-2xl'>
              {setupMode ? t('setup.title') : t('unlock.title')}
            </CardTitle>

            <CardDescription>
              {setupMode
                ? t('setup.description')
                : t('unlock.description')}
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLocked && (
              <Alert variant='destructive'>
                <AlertDescription>
                  {t('alerts.tooManyAttempts')}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='password'>
                  {setupMode ? t('form.labels.masterPassword') : t('form.labels.password')}
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isSubmitting || isLocked}
                    placeholder={
                      setupMode
                        ? t('form.placeholders.createStrongPassword')
                        : t('form.placeholders.enterPassword')
                    }
                    className='pr-10'
                    autoComplete={
                      setupMode ? 'new-password' : 'current-password'
                    }
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-full px-3'
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className='w-4 h-4' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password strength indicator for setup */}
              {setupMode && password.length > 0 && (
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>{t('form.labels.passwordStrength')}</span>
                    <span
                      className={`capitalize ${
                        passwordStrength === 'strong'
                          ? 'text-green-600'
                          : passwordStrength === 'medium'
                            ? 'text-yellow-600'
                            : passwordStrength === 'weak'
                              ? 'text-orange-600'
                              : 'text-red-600'
                      }`}
                    >
                      {passwordStrength === 'too-short'
                        ? t('passwordStrength.tooShort')
                        : t(`passwordStrength.${passwordStrength}`)}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <motion.div
                      className={`h-2 rounded-full ${
                        passwordStrength === 'strong'
                          ? 'bg-green-500'
                          : passwordStrength === 'medium'
                            ? 'bg-yellow-500'
                            : passwordStrength === 'weak'
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          passwordStrength === 'strong'
                            ? '100%'
                            : passwordStrength === 'medium'
                              ? '75%'
                              : passwordStrength === 'weak'
                                ? '50%'
                                : '25%',
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Confirm password for setup */}
              {setupMode && (
                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>{t('form.labels.confirmPassword')}</Label>
                  <Input
                    id='confirmPassword'
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting || isLocked}
                    placeholder={t('form.placeholders.confirmPassword')}
                    autoComplete='new-password'
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className='text-sm text-red-600'>
                      {t('validation.passwordsDontMatch')}
                    </p>
                  )}
                </div>
              )}

              {/* Failed attempts indicator */}
              {attempts > 0 && !setupMode && (
                <div className='text-sm text-orange-600'>
                  {t('validation.failedAttempts', { current: attempts, max: maxAttempts })}
                </div>
              )}

              <div className='flex gap-3 pt-2'>
                {onCancel && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className='flex-1'
                  >
                    {t('buttons.cancel')}
                  </Button>
                )}

                <Button
                  type='submit'
                  disabled={!isPasswordValid || isSubmitting || isLocked}
                  className='flex-1'
                >
                  <AnimatePresence mode='wait'>
                    {isSubmitting ? (
                      <motion.div
                        key='loading'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='flex items-center gap-2'
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className='w-4 h-4 border-2 border-current border-t-transparent rounded-full'
                        />
                        {setupMode ? t('buttons.creating') : t('buttons.unlocking')}
                      </motion.div>
                    ) : (
                      <motion.div
                        key='ready'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='flex items-center gap-2'
                      >
                        {setupMode ? (
                          <>
                            <Shield className='w-4 h-4' />
                            {t('buttons.createVault')}
                          </>
                        ) : (
                          <>
                            <Unlock className='w-4 h-4' />
                            {t('buttons.unlockVault')}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </form>

            {setupMode && (
              <div className='mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                <div className='flex items-start gap-2'>
                  <Shield className='w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0' />
                  <div className='text-sm text-blue-800'>
                    <p className='font-medium mb-1'>{t('alerts.securityNotice')}</p>
                    <p>
                      {t('alerts.securityDescription')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
