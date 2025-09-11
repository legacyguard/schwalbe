import React, { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnon = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

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
    <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
      <h3>Authentication</h3>
      <p style={{ fontSize: 12, color: '#555' }}>Connect your account to enable Family Shield.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSignIn}>Sign in with Google</button>
        <button onClick={handleSignOut}>Sign out</button>
      </div>
    </div>
  );
};

export default AuthPanel;

