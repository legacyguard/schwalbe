import React, { useCallback, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@schwalbe/shared'
import { logger } from '@schwalbe/shared/lib/logger'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    } catch (err: any) {
      logger.error('OAuth sign-in failed', { metadata: { provider, error: err?.message || String(err) } })
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
    } catch (err: any) {
      logger.error('Password reset email failed', { metadata: { error: err?.message || String(err) } })
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
              />
            </div>
            {error && (
              <div role="alert" className="text-sm text-red-300">{error}</div>
            )}
            {info && (
              <div role="status" className="text-sm text-emerald-300">{info}</div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
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
              />
              <Button onClick={sendReset} variant="secondary">Send reset</Button>
            </div>
            {resetSent && (
              <div className="mt-2 text-xs text-slate-300">Check your inbox for the reset link.</div>
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@schwalbe/shared';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await signIn(email, password);
      if (success) {
        navigate('/assets');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-300">
            Secure access to your family protection system
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-white bg-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-white bg-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-slate-300">Don't have an account? </span>
            <Link
              to="/auth/signup"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}