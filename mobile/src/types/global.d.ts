// Global type declarations for mobile app
// NOTE: Do not declare modules for internal packages here.
// It overrides real types from packages and breaks type-checking.

// Expo module declarations
declare module 'expo-web-browser' {
  export function openBrowserAsync(
    url: string
  ): Promise<void | { type: string }>;
  export function maybeCompleteAuthSession(): { type: string };
}

// Fix for React Native types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}
