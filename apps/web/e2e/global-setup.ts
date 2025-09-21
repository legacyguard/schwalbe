import { request } from '@playwright/test';

export default async function globalSetup() {
  // Set up any global test data or configurations
  console.log('🚀 Starting Playwright tests for LegacyGuard Design Consistency');

  // Verify the development server is running
  try {
    const response = await request.newContext().then(ctx =>
      ctx.get('http://localhost:5173')
    );

    if (response.ok()) {
      console.log('✅ Development server is running');
    } else {
      console.warn('⚠️ Development server responded with:', response.status());
    }
  } catch (error) {
    console.warn('⚠️ Could not connect to development server:', error);
  }

  // Set up test environment variables
  process.env.PLAYWRIGHT_TEST = 'true';
  process.env.NODE_ENV = 'test';

  console.log('📋 Test configuration:');
  console.log('  - Base URL: http://localhost:5173');
  console.log('  - Test mode: enabled');
  console.log('  - Environment: test');
}