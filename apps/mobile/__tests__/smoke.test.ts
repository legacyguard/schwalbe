describe('mobile basic', () => {
  test('auth store exports', async () => {
    // Avoid dynamic import to prevent vm-modules requirement
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../src/stores/authStore');
    expect(typeof (mod as any).useAuthStore).toBe('function');
  });

  test('supabase client is created', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../src/lib/supabase');
    expect((mod as any).supabase).toBeTruthy();
  });
});
