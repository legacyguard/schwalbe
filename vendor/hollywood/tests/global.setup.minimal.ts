/**
 * Minimal global setup for smoke tests
 * This setup is used when we want to run basic tests without authentication
 */

async function globalSetup() {
  // console.error('🚀 Starting minimal smoke tests...');
  // console.error('📍 Base URL:', process.env.BASE_URL || 'http://127.0.0.1:8080');

  // Basic environment checks
  if (process.env.CI) {
    // console.error('🏭 Running in CI environment');
  } else {
    // console.error('💻 Running in local environment');
  }

  // Return nothing or a teardown function
  return async () => {
    // console.error('✅ Smoke tests completed');
  };
}

export default globalSetup;
