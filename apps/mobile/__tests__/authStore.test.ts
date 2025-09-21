import { useAuthStore } from '@/stores/authStore'

describe('authStore behavior', () => {
  test('initializes and signOut resets state', async () => {
    const store = useAuthStore.getState()
    // initialize should set isLoading false eventually; our mocked supabase returns no session
    await store.initialize()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()

    // set some fake session state
    useAuthStore.setState({ isAuthenticated: true, user: { id: 'u1' } as any })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    // signOut should clear state
    await store.signOut()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
  })
})