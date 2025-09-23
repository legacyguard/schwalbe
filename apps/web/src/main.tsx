import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CriticalErrorBoundary } from '@/components/error';
import { validateEnvironment, isProduction } from '@/lib/env';
import { isLandingEnabled } from '@/config/flags';
import LandingV2 from '@/components/landing/LandingV2';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import { OnboardingWrapper } from '@/components/onboarding/OnboardingWrapper';
import Dashboard from '@/pages/Dashboard';
import Onboarding from '@/pages/onboarding/Onboarding';
import './styles.css';

const DocumentRoutes = React.lazy(() => import('@/features/documents/routes/DocumentRoutes'));

const rootEl = document.getElementById('root');

// Validate environment variables
const envValidation = validateEnvironment();

if (rootEl) {
  if (!envValidation.isValid) {
    console.error('Missing required environment variables:', envValidation.missing);
    if (isProduction) {
      rootEl.innerHTML = `
        <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
          <h1>Application Configuration Error</h1>
          <p>Some critical configuration variables are missing. The application cannot start.</p>
          <p>Please contact support.</p>
        </div>
      `;
    } else {
      console.warn('Application is running with missing environment variables. Some features may not work.');
    }
  }

  if (envValidation.isValid || !isProduction) {
    const root = createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <HelmetProvider>
          <CriticalErrorBoundary>
            <AuthProvider>
              <BrowserRouter>
                <OnboardingWrapper>
                  <AppShell>
                    <Routes>
                      <Route path="/auth/signin" element={<SignIn />} />
                      <Route path="/auth/signup" element={<SignUp />} />
                      {isLandingEnabled() && <Route path="/landing" element={<LandingV2 />} />}

                      <Route path="/onboarding" element={<Onboarding onComplete={() => window.location.assign('/dashboard')} />} />

                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/documents/*"
                        element={
                          <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                              <DocumentRoutes />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/"
                        element={
                          isLandingEnabled() ? (
                            <LandingV2 />
                          ) : (
                            <ProtectedRoute>
                              <Navigate to="/dashboard" replace />
                            </ProtectedRoute>
                          )
                        }
                      />

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AppShell>
                </OnboardingWrapper>
              </BrowserRouter>
            </AuthProvider>
          </CriticalErrorBoundary>
        </HelmetProvider>
      </React.StrictMode>
    );
  }
}
