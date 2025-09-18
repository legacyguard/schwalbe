/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_ENABLE_ASSISTANT?: string
  readonly VITE_ENABLE_ONBOARDING?: string
  readonly VITE_ENABLE_HOLLYWOOD_LANDING?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
