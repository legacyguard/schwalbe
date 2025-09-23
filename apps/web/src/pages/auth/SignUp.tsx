import React, { useCallback, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@schwalbe/shared';
import { logger } from '@schwalbe/shared/lib/logger';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string>('')
  const [info, setInfo] = useState<string>('')

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    const ok = await signUp(email, password, { name })
    if (ok) {
      setInfo('Account created. Please check your email to verify your address.')
      // Redirect to sign-in to keep flow explicit after email verification
      navigate('/auth/signin', { replace: true })
    } else {
      setError('Sign up failed. Please try again.')
    }
  }, [email, password, name, signUp, navigate])

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
      if (!data?.url) {
        setInfo('OAuth initiated. If nothing happens, check your provider configuration.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('OAuth sign-up failed', { metadata: { provider, error: message } });
      setError('Social sign-up failed. Please try again or contact support.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-900/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" aria-label="Sign up form">
            <div>
              <label htmlFor="name" className="block text-sm mb-1">Full name (optional)</label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
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
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={!!error}
              />
            </div>
            {error && (
              <div role="alert" className="text-sm text-red-300">{error}</div>
            )}
            {info && (
              <div role="status" className="text-sm text-emerald-300">{info}</div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Creating…' : 'Create account'}
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

          <div className="mt-6 text-sm text-slate-300">
            Already have an account?{' '}
            <Link to="/auth/signin" className="underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
