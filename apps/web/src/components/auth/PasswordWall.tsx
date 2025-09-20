import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PasswordWallProps {
  children: React.ReactNode;
  onAuthenticated?: () => void;
}

export const PasswordWall: React.FC<PasswordWallProps> = ({
  children,
  onAuthenticated
}) => {
  const { t } = useTranslation('common/buttons');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Check if already authenticated (persist across page refreshes)
  useEffect(() => {
    const isAuth = sessionStorage.getItem('landing_authenticated') === 'true';
    const authTimestamp = sessionStorage.getItem('landing_auth_timestamp');
    const currentTime = Date.now();

    // Check if authentication is still valid (24 hours)
    if (isAuth && authTimestamp && (currentTime - parseInt(authTimestamp)) < 24 * 60 * 60 * 1000) {
      setIsAuthenticated(true);
    } else {
      // Clear expired authentication
      sessionStorage.removeItem('landing_authenticated');
      sessionStorage.removeItem('landing_auth_timestamp');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Rate limiting - max 5 attempts per session
    if (attemptCount >= 5) {
      setError('Too many failed attempts. Please refresh the page to try again.');
      setIsLoading(false);
      return;
    }

    try {
      // Call server-side verification API
      const response = await fetch('/api/verify-landing-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          const timestamp = Date.now().toString();
          sessionStorage.setItem('landing_authenticated', 'true');
          sessionStorage.setItem('landing_auth_timestamp', timestamp);
          onAuthenticated?.();
        } else {
          setError('Incorrect password. Please try again.');
          setPassword('');
          setAttemptCount(prev => prev + 1);
        }
      } else {
        setError('Authentication service unavailable. Please try again later.');
        setAttemptCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed. Please try again.');
      setAttemptCount(prev => prev + 1);
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('landing_authenticated');
    sessionStorage.removeItem('landing_auth_timestamp');
    setPassword('');
    setError('');
    setAttemptCount(0);
  };

  if (isAuthenticated) {
    return (
      <div>
        {children}
        {/* Logout button - positioned absolutely */}
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 z-50 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          title="Logout"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Required</h1>
            <p className="text-slate-300">Please enter the password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter password"
                required
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Access Landing Page'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              This landing page is password protected for authorized access only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordWall;
