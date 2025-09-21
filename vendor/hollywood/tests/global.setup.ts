import { clerkSetup } from '@clerk/testing/playwright';

/**
 * Global setup for Playwright tests with Clerk authentication
 * This runs once before all tests to obtain a Testing Token
 */

async function globalSetup() {
  // console.error('🔐 Setting up Clerk testing environment...');

  // Ensure environment variables are set
  if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    // console.error('❌ Missing Clerk environment variables!');
    // console.error('Please set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY');
    process.exit(1);
  }

  try {
    // This obtains a Testing Token when your test suite starts
    await clerkSetup();
    // console.error('✅ Clerk testing token obtained successfully');
  } catch (error) {
    // console.error('❌ Failed to setup Clerk testing:', error);
    throw error;
  }
}

export default globalSetup;
