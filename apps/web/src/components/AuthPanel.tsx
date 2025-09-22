import React, { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/lib/env';

const supabaseUrl = config.supabase.url;
const supabaseAnon = config.supabase.anonKey;

export const AuthPanel: React.FC = () => {
  const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnon), []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>
          Connect your account to enable Family Shield.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button onClick={handleSignIn} variant="outline">
            Sign in with Google
          </Button>
          <Button onClick={handleSignOut} variant="danger">
            Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthPanel;

