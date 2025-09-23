import React, { useCallback, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@schwalbe/shared';
import { logger } from '@schwalbe/shared/lib/logger';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignIn() {
  const navigate = useNavigate()
  const { signIn, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>('')
  const [info, setInfo] = useState<string>('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    const ok = await signIn(email, password)
    if (ok) {
      navigate('/dashboard', { replace: true })
    } else {
      setError('Sign in failed. Please check your credentials and try again.')
    }
  }, [email, password, signIn, navigate])

  async function oauth(provider: 'google' | 'apple') {
    try {
      setError('')
      setInfo('')
      const redirectTo = window.location.origin
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: provider === 'google' ? { prompt: 'consent' } : undefined,
        },
      })
      if (error) throw error
      // Supabase will redirect; in dev without config, show message
      if (!data?.url) {
        setInfo('OAuth initiated. If nothing happens, check your provider configuration.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('OAuth sign-in failed', { metadata: { provider, error: message } });
      setError('Social sign-in failed. Please try again or contact support.')
    }
  }

  async function sendReset() {
    try {
      setError('')
      setInfo('')
      if (!resetEmail.trim()) {
        setError('Please enter your email address to reset your password.')
        return
      }
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/auth/signin`,
      })
      if (error) throw error
      setResetSent(true)
      setInfo('If an account exists for this email, a reset link has been sent.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('Password reset email failed', { metadata: { error: message } });
      setError('Failed to send reset email. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-900/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" aria-label="Sign in form">
            <div>
              <label htmlFor="email" className="block text-sm mb-1">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!error}
                data-testid="signin-email-input"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm mb-1">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={!!error}
                data-testid="signin-password-input"
              />
            </div>
            {error && (
              <div role="alert" className="text-sm text-red-300" data-testid="signin-error-message">{error}</div>
            )}
            {info && (
              <div role="status" className="text-sm text-emerald-300" data-testid="signin-info-message">{info}</div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full" data-testid="signin-submit-button">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="my-4 border-t border-slate-700" />

          <div className="space-y-2">
            <Button aria-label="Continue with Google" variant="outline" className="w-full" onClick={() => oauth('google')}>
              Continue with Google
            </Button>
            <Button aria-label="Continue with Apple" variant="outline" className="w-full" onClick={() => oauth('apple')}>
              Continue with Apple
            </Button>
          </div>

          <div className="mt-6">
            <div className="text-sm mb-2">Forgot your password?</div>
            <div className="flex gap-2">
              <Input
                aria-label="Password reset email"
                placeholder="your@email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                data-testid="reset-email-input"
              />
              <Button onClick={sendReset} variant="secondary" data-testid="reset-submit-button">Send reset</Button>
            </div>
            {resetSent && (
              <div className="mt-2 text-xs text-slate-300" data-testid="reset-info-message">Check your inbox for the reset link.</div>
            )}
          </div>

          <div className="mt-6 text-sm text-slate-300">
            Don’t have an account?{' '}
            <Link to="/auth/signup" className="underline">Create one</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
