export const env = {
  // Supabase
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ?? '',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',

  // Stripe
  VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',

  // Application
  VITE_API_URL: import.meta.env.VITE_API_URL ?? '',

  // Sofia AI Assistant
  VITE_SOFIA_AI_BASE_URL: import.meta.env.VITE_SOFIA_AI_BASE_URL ?? '',
  VITE_SOFIA_AI_API_KEY: import.meta.env.VITE_SOFIA_AI_API_KEY ?? '',

  // Google Analytics
  VITE_GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID ?? '',

  // Feature Flags
  VITE_ENABLE_HOLLYWOOD_LANDING: import.meta.env.VITE_ENABLE_HOLLYWOOD_LANDING ?? '0',
  VITE_ENABLE_DASHBOARD_V2: import.meta.env.VITE_ENABLE_DASHBOARD_V2 ?? '1',
  VITE_ENABLE_ASSISTANT: import.meta.env.VITE_ENABLE_ASSISTANT ?? '1',
  VITE_ENABLE_ONBOARDING: import.meta.env.VITE_ENABLE_ONBOARDING ?? '1'
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Feature flags as booleans
export const features = {
  landing: env.VITE_ENABLE_HOLLYWOOD_LANDING === '1',
  dashboardV2: env.VITE_ENABLE_DASHBOARD_V2 === '1',
  assistant: env.VITE_ENABLE_ASSISTANT === '1',
  onboarding: env.VITE_ENABLE_ONBOARDING === '1'
};

// Configuration object
export const config = {
  supabase: {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY
  },
  stripe: {
    publishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY
  },
  api: {
    baseUrl: env.VITE_API_URL
  },
  sofia: {
    baseUrl: env.VITE_SOFIA_AI_BASE_URL,
    apiKey: env.VITE_SOFIA_AI_API_KEY
  },
  analytics: {
    gaTrackingId: env.VITE_GA_TRACKING_ID
  },
  locale: 'en-US'
};

// Environment validation
export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !env[key as keyof typeof env]);

  return {
    isValid: missing.length === 0,
    missing
  };
}
