'use client';

import { useState } from 'react';
import { useEncryption } from '@/hooks/useEncryption';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Key,
  Lock,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Password strength analysis result
 */
interface PasswordStrength {
  feedback: string[];
  score: number;
  warning?: string;
}

/**
 * Analyzes password strength and provides feedback
 * @param password - The password to analyze
 * @returns Password strength analysis with score and feedback
 */
function getPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
    feedback.push('Use at least 12 characters for better security');
  } else {
    feedback.push('Password must be at least 8 characters');
  }

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  // Check for common patterns
  if (/^[a-zA-Z]+$/.test(password)) {
    score = Math.max(1, score - 1);
    feedback.push('Avoid using only letters');
  }

  if (/^[0-9]+$/.test(password)) {
    score = 0;
    feedback.push('Never use only numbers');
  }

  // Normalize score to 0-4 scale
  score = Math.min(4, Math.floor((score / 6) * 4));

  return { score, feedback };
}

/**
 * Encryption setup component with multi-step wizard
 * Guides users through setting up end-to-end encryption for their documents
 */
export function EncryptionSetup() {
  const { initializeKeys, isLoading } = useEncryption();
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const handleNext = () => {
    if (step === 1) {
      if (!agreed) {
        setError('Please acknowledge the security information');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (passwordStrength.score < 2) {
        setError('Please choose a stronger password');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const success = await initializeKeys(password);
    if (success) {
      setStep(4); // Success step
    } else {
      setError('Failed to initialize encryption. Please try again.');
    }
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
        return 'bg-red-500';
      case 1:
        return 'bg-orange-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  if (step === 4) {
    return (
      <Card className='max-w-2xl mx-auto'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center'>
            <CheckCircle className='h-6 w-6 text-green-600' />
          </div>
          <CardTitle>Encryption Setup Complete!</CardTitle>
          <CardDescription>
            Your documents are now protected with end-to-end encryption
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert>
            <Shield className='h-4 w-4' />
            <AlertDescription>
              <strong>Important:</strong> Remember your encryption password. It
              cannot be recovered if lost. Consider using a password manager to
              store it securely.
            </AlertDescription>
          </Alert>
          <div className='text-center'>
            <Button onClick={() => window.location.reload()}>
              Continue to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='max-w-2xl mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2 mb-2'>
          <Shield className='h-6 w-6 text-primary' />
          <CardTitle>Set Up Document Encryption</CardTitle>
        </div>
        <CardDescription>
          Protect your sensitive documents with end-to-end encryption
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-muted-foreground'>
              Step {step} of 3
            </span>
          </div>
          <Progress value={(step / 3) * 100} />
        </div>

        {step === 1 && (
          <div className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='font-semibold text-lg'>Before We Begin</h3>

              <div className='space-y-3'>
                <div className='flex gap-3'>
                  <Lock className='h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='font-medium'>
                      Your encryption password is never sent to our servers
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      We use client-side encryption to ensure only you can
                      access your documents
                    </p>
                  </div>
                </div>

                <div className='flex gap-3'>
                  <Key className='h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='font-medium'>
                      This password cannot be recovered
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      If you forget your password, you will lose access to your
                      encrypted documents
                    </p>
                  </div>
                </div>

                <div className='flex gap-3'>
                  <Shield className='h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='font-medium'>Military-grade encryption</p>
                    <p className='text-sm text-muted-foreground'>
                      We use NaCl (Networking and Cryptography library) for
                      secure encryption
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className='h-4 w-4' />
                <AlertDescription>
                  <strong>Tip:</strong> Use a password manager to generate and
                  store a strong, unique password for your encryption.
                </AlertDescription>
              </Alert>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='acknowledge'
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className='rounded border-gray-300'
                />
                <Label htmlFor='acknowledge' className='text-sm'>
                  I understand that my encryption password cannot be recovered
                  if lost
                </Label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='font-semibold text-lg'>
                Create Your Encryption Password
              </h3>

              <div className='space-y-2'>
                <Label htmlFor='password'>Encryption Password</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder='Enter a strong password'
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

              {password && (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      Password Strength
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        passwordStrength.score >= 3
                          ? 'text-green-600'
                          : passwordStrength.score >= 2
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      )}
                    >
                      {getStrengthLabel(passwordStrength.score)}
                    </span>
                  </div>
                  <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                    <div
                      className={cn(
                        'h-full transition-all duration-300',
                        getStrengthColor(passwordStrength.score)
                      )}
                      style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className='text-sm text-muted-foreground space-y-1'>
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className='flex items-center gap-1'>
                          <span className='text-xs'>•</span> {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <Alert>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Choose a password you\'ll remember. It should be different
                  from your login password.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='font-semibold text-lg'>Confirm Your Password</h3>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>
                  Confirm Encryption Password
                </Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder='Re-enter your password'
                    autoFocus
                    className='pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded'
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4 text-gray-500' />
                    ) : (
                      <Eye className='h-4 w-4 text-gray-500' />
                    )}
                  </button>
                </div>
              </div>

              {confirmPassword && password !== confirmPassword && (
                <p className='text-sm text-red-600'>Passwords do not match</p>
              )}

              {confirmPassword && password === confirmPassword && (
                <div className='flex items-center gap-2 text-green-600'>
                  <CheckCircle className='h-4 w-4' />
                  <span className='text-sm'>Passwords match</span>
                </div>
              )}
            </div>
          </form>
        )}

        {error && (
          <Alert variant='destructive' className='mt-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className='flex justify-between'>
        {step > 1 && (
          <Button variant='outline' onClick={handleBack} disabled={isLoading}>
            Back
          </Button>
        )}
        <div className={cn(step === 1 && 'ml-auto')}>
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={isLoading || (step === 1 && !agreed)}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || password !== confirmPassword || !password}
            >
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
