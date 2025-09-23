import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CriticalErrorBoundary } from '@/components/error';
import { validateEnvironment, isProduction, checkRuntimeEnvironment } from '@/lib/env';
import { initSentry, setupReactRouterIntegration } from '@/lib/sentry';
import '@/i18n';
import { isLandingEnabled } from '@/config/flags';
import LandingPage from '@/components/landing/LightLandingPage';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import { OnboardingWrapper } from '@/components/onboarding/OnboardingWrapper';
import Dashboard from '@/pages/Dashboard';
import Onboarding from '@/pages/onboarding/Onboarding';
import NotFound from '@/pages/NotFound';
import './styles.css';

const DocumentRoutes = React.lazy(() => import('@/features/documents/routes/DocumentRoutes'));

// Initialize error monitoring and environment checks
initSentry();
setupReactRouterIntegration();

const rootEl = document.getElementById('root');

// Validate environment variables
checkRuntimeEnvironment();

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
                      {isLandingEnabled() && <Route path="/landing" element={<LandingPage />} />}

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
                            <LandingPage />
                          ) : (
                            <ProtectedRoute>
                              <Navigate to="/dashboard" replace />
                            </ProtectedRoute>
                          )
                        }
                      />

                      <Route path="*" element={<NotFound />} />
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
