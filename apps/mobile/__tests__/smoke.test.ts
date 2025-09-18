describe('mobile basic', () => {
  test('auth store exports', async () => {
    const mod = await import('../src/stores/authStore');
    expect(typeof (mod as any).useAuthStore).toBe('function');
  });

  test('supabase client is created', async () => {
    const mod = await import('../src/lib/supabase');
    expect((mod as any).supabase).toBeTruthy();
  });
});
