export default async function globalTeardown() {
  console.log('🧹 Cleaning up after Playwright tests');

  // Clean up any test data or temporary files
  // Reset any global state if needed

  console.log('✅ Test cleanup completed');
  console.log('📊 Test results available in: test-results/');
  console.log('🎯 LegacyGuard Design Consistency tests completed');
}