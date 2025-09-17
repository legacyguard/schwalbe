
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './lib/i18n/config'; // Initialize i18n
import { pwaService } from './lib/pwa/pwaService';
import { offlineStorageService } from './lib/pwa/offlineStorage';
import { pushNotificationService } from './lib/pwa/pushNotifications';

// Initialize monitoring systems
import { initSentry } from './lib/monitoring/sentry';
import { initAnalytics, initWebVitals } from './lib/monitoring/analytics';
import { rumMonitor, setRUMUserId } from './lib/monitoring/rum';
import { applySecurityHeaders, setupCSPReporting } from './lib/security/csp';
import { bundleAnalyzer } from './lib/monitoring/bundle-analyzer';
import { initializeOfflineFirst } from './lib/pwa/offline-first';

// Initialize monitoring systems
function initializeMonitoring() {
  // Initialize error reporting
  if (import.meta.env.VITE_SENTRY_DSN) {
    initSentry();
    // console.log('✅ Sentry error reporting initialized');
  }

  // Initialize analytics and performance monitoring
  if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
    initAnalytics();
    initWebVitals();
    // console.log('✅ Analytics and Web Vitals initialized');
  }
}

// Initialize PWA services
async function initializePWA() {
  try {
    // Initialize services in parallel
    await Promise.all([
      pwaService.initialize(),
      offlineStorageService.initialize(),
      pushNotificationService.initialize(),
    ]);

    // console.log('✅ PWA services initialized successfully');
  } catch (error) {
    console.error('❌ PWA initialization failed:', error);
  }
}

// Initialize monitoring systems first
initializeMonitoring();

// Initialize PWA services
initializePWA();

// Apply security headers and CSP
applySecurityHeaders();
setupCSPReporting();

// Initialize RUM monitoring
rumMonitor.setUserId('anonymous'); // Will be updated when user signs in

// Initialize offline-first capabilities
initializeOfflineFirst();

// Initialize bundle analysis
if (import.meta.env.PROD) {
  bundleAnalyzer.getBundleSizeReport(); // Start monitoring
}

createRoot(document.getElementById('root')!).render(<App />);
