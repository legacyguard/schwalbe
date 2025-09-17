import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@schwalbe/shared/lib/logger';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        logger.error('Auth callback error', {
          action: 'auth_callback_error',
          metadata: { error: error.message },
        });
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
      }

      logger.info('Auth callback success', {
        action: 'auth_callback_success',
      });
      
      // Redirect to the next URL or dashboard
      return NextResponse.redirect(new URL(next, request.url));
    } catch (error: any) {
      logger.error('Auth callback exception', {
        action: 'auth_callback_exception',
        metadata: { error: error.message },
      });
      return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}