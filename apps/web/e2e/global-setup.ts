import { request } from '@playwright/test';

export default async function globalSetup() {
  console.log('🚀 Starting Playwright E2E tests for LegacyGuard Production Readiness');

  // Verify the development server is running
  try {
    const context = await request.newContext();
    const response = await context.get('http://localhost:5173');

    if (response.ok()) {
      console.log('✅ Development server is running on http://localhost:5173');
    } else {
      console.error(`❌ Development server responded with status: ${response.status()}`);
      console.error('Please start the dev server with: npm run dev');
      process.exit(1);
    }

    await context.dispose();
  } catch (error) {
    console.error('❌ Could not connect to development server:', error);
    console.error('Please start the dev server with: npm run dev');
    process.exit(1);
  }

  // Verify environment variables are set
  console.log('🔍 Checking environment configuration...');

  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
    console.warn('Some tests may fail. Please check your .env file.');
  } else {
    console.log('✅ Environment variables are configured');
  }

  // Set up test environment variables
  process.env.PLAYWRIGHT_TEST = 'true';
  process.env.NODE_ENV = 'test';

  // Clean up any previous test data
  console.log('🧹 Preparing test environment...');

  console.log('📋 Test configuration:');
  console.log('  - Base URL: http://localhost:5173');
  console.log('  - Test mode: enabled');
  console.log('  - Environment: test');
  console.log('  - Browsers: Chromium, Firefox, WebKit');
  console.log('  - Viewports: Desktop + Mobile');

  console.log('🎯 Test suites:');
  console.log('  - Critical user flows (authentication, onboarding)');
  console.log('  - Payment integration');
  console.log('  - Document management');
  console.log('  - AI assistant functionality');
  console.log('  - Internationalization');
  console.log('  - Performance and accessibility');
  console.log('  - Error handling and monitoring');

  console.log('🏁 Ready to run tests!');
}