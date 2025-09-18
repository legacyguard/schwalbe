import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm --workspace=@schwalbe/web-next run dev',
    port: 3001,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_ENABLE_DASHBOARD_V2: '1',
      NEXT_PUBLIC_ENABLE_ASSISTANT: '1',
      NEXT_PUBLIC_E2E: '1',
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-public-placeholder',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3001',
      PORT: '3001'
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
