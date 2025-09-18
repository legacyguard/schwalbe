import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Minimal namespaces aligned with web-next
// - navigation: tab titles and common nav items
// - auth: login/biometric labels and errors
// - common: generic labels (error, cancel, etc.)

const resources = {
  en: {
    navigation: {
      home: 'Home',
      documents: 'Documents',
      protection: 'Protection',
      profile: 'Profile',
    },
    auth: {
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      subtitle: 'Secure access to your family protection',
      biometricSupport: 'Secure authentication with biometric support',
      biometricTitle: 'Biometric Sign In',
      biometricPrompt: 'Sign in to LegacyGuard',
      biometricSubtitle: 'Use your {{method}} to securely access your account',
      faceId: 'Face ID',
      fingerprint: 'Fingerprint',
      biometric: 'Biometric',
      use: 'Use',
      usePassword: 'Use password instead',
      authenticating: 'Authenticating...',
      errors: {
        missingCredentials: 'Please enter both email and password',
        invalidCredentials: 'Invalid email or password',
        loginFailed: 'Login failed. Please try again.',
        biometricUnavailable: 'Biometric authentication is not available on this device',
        biometricFailed: 'Biometric authentication failed',
        authFailedTitle: 'Authentication Failed',
        authFailed: 'Please try again or use your password',
      }
    },
    common: {
      error: 'Error',
      cancel: 'Cancel',
    },
  },
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'navigation', 'auth'],
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  })

export default i18n
