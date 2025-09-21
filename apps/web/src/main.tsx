import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { isLandingEnabled } from '@/config/flags';
import LandingV2 from '@/components/landing/LandingV2';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import { CriticalErrorBoundary, PageErrorBoundary, FeatureErrorBoundary } from '@/components/error/ErrorBoundary';
import { OnboardingWrapper } from '@/components/onboarding/OnboardingWrapper';
import Dashboard from '@/pages/Dashboard';
import Onboarding from '@/pages/onboarding/Onboarding';
import '@/lib/i18n';
import './styles.css';

// Lazy load route components for code splitting
const WillWizardRoutes = lazy(() => import('@/features/will/wizard/routes/WillWizardRoutes'));
const AssetsRoutes = lazy(() => import('@/features/assets/routes/AssetsRoutes'));
const RemindersRoutes = lazy(() => import('@/features/reminders/routes/RemindersRoutes'));
const DocumentRoutes = lazy(() => import('@/features/documents/routes/DocumentRoutes'));
const SubscriptionsRoutes = lazy(() => import('@/features/subscriptions/SubscriptionsRoutes'));
const AccountRoutes = lazy(() => import('@/features/account/AccountRoutes'));
const LegalRoutes = lazy(() => import('@/features/legal/routes/LegalRoutes'));
const ShareViewer = lazy(() => import('@/features/sharing/viewer/ShareViewer'));
const SupportIndex = lazy(() => import('@/features/support/SupportIndex'));
const SupportEN = lazy(() => import('@/pages/support/support.en'));
const SupportCS = lazy(() => import('@/pages/support/support.cs'));
const SupportSK = lazy(() => import('@/pages/support/support.sk'));
const EmergencyCenter = lazy(() => import('@/pages/EmergencyCenter'));

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <CriticalErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <OnboardingWrapper>
              <AppShell>
                <Routes>
            {/* Public routes */}
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            {isLandingEnabled() && (
              <Route path="/landing-v2" element={<LandingV2 />} />
            )}
            <Route path="/onboarding" element={<Onboarding onComplete={() => window.location.assign('/dashboard')} />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageErrorBoundary>
                  <Dashboard />
                </PageErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/will/wizard/*" element={
              <ProtectedRoute>
                <PageErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <WillWizardRoutes />
                  </Suspense>
                </PageErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/assets/*" element={
              <ProtectedRoute>
                <PageErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AssetsRoutes />
                  </Suspense>
                </PageErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/reminders/*" element={
              <ProtectedRoute>
                <PageErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <RemindersRoutes />
                  </Suspense>
                </PageErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/documents/*" element={
              <ProtectedRoute>
                <PageErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <DocumentRoutes />
                  </Suspense>
                </PageErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/share/:shareId" element={
              <FeatureErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <ShareViewer />
                </Suspense>
              </FeatureErrorBoundary>
            } />
            <Route path="/subscriptions/*" element={
              <ProtectedRoute>
                <PageErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SubscriptionsRoutes />
                  </Suspense>
                </PageErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/emergency" element={
              <ProtectedRoute>
                <FeatureErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <EmergencyCenter />
                  </Suspense>
                </FeatureErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/account/*" element={
              <ProtectedRoute>
                <PageErrorBoundary>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AccountRoutes />
                  </Suspense>
                </PageErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/legal/*" element={
              <FeatureErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <LegalRoutes />
                </Suspense>
              </FeatureErrorBoundary>
            } />
            <Route path="/support" element={
              <FeatureErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <SupportIndex />
                </Suspense>
              </FeatureErrorBoundary>
            } />
            <Route path="/support.en" element={
              <FeatureErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <SupportEN />
                </Suspense>
              </FeatureErrorBoundary>
            } />
            <Route path="/support.cs" element={
              <FeatureErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <SupportCS />
                </Suspense>
              </FeatureErrorBoundary>
            } />
            <Route path="/support.sk" element={
              <FeatureErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <SupportSK />
                </Suspense>
              </FeatureErrorBoundary>
            } />
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
            <Route path="*" element={<Navigate to="/assets" replace />} />
            </Routes>
          </AppShell>
          </OnboardingWrapper>
          </BrowserRouter>
        </AuthProvider>
      </CriticalErrorBoundary>
    </React.StrictMode>
  );
}
