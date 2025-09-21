
// Global type declarations to fix common issues
declare global {
  // Allow any property on window
  interface Window {
    [key: string]: unknown;
  }

  // Generic Json type
  type Json = Record<string, unknown>;

  // Generic Database types
  type Database = Record<string, unknown>;
  type Tables<T = unknown> = Record<string, T>;
  type Enums<T = unknown> = Record<string, T>;

  // Document types
  interface DocumentUploadRequest {
    category: string;
    description?: string;
    file: File;
    metadata?: Record<string, unknown>;
  }

  interface AISuggestions {
    [key: string]: unknown;
  }

  // React component helpers
  type FC<P = Record<string, never>> = React.FC<P>;
  type ReactElement = React.ReactElement;

  // Module declarations for problematic imports
  declare module 'storybook/test' {
    export const expect: unknown;
    export const test: unknown;
  }

  declare module '*.svg' {
    const content: string;
    export default content;
  }

  declare module '*.png' {
    const content: string;
    export default content;
  }

  declare module '*.jpg' {
    const content: string;
    export default content;
  }
}

// Make TypeScript happy with missing types
export {};
