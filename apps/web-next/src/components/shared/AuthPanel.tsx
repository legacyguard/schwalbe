'use client';

import React from 'react';
import { createClientComponentClient } from '../lib/supabase-client';

interface AuthPanelProps {
  className?: string;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ className = '' }) => {
  const handleSignIn = async () => {
    const supabase = createClientComponentClient();
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleSignOut = async () => {
    const supabase = createClientComponentClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className={`p-4 border border-gray-200 rounded-lg bg-white ${className}`}>
      <h3 className="text-lg font-semibold mb-2">Authentication</h3>
      <p className="text-sm text-gray-600 mb-4">Connect your account to enable Family Shield.</p>
      <div className="flex gap-2">
        <button 
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign in with Google
        </button>
        <button 
          onClick={handleSignOut}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default AuthPanel;