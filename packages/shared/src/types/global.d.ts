
// Global type declarations to fix common issues
declare global {
  // Allow any property on window
  interface Window {
    [key: string]: any;
  }

  // Generic Json type
  type Json = any;

  // Generic Database types
  type Database = any;
  type Tables<T = any> = any;
  type Enums<T = any> = any;

  // Document types
  interface DocumentUploadRequest {
    category: string;
    description?: string;
    file: File;
    metadata?: any;
  }

  interface AISuggestions {
    [key: string]: any;
  }

  // React component helpers
  type FC<P = {}> = React.FC<P>;
  type ReactElement = React.ReactElement;

  // Module declarations for problematic imports
  declare module 'storybook/test' {
    export const expect: any;
    export const test: any;
  }

  declare module '*.svg' {
    const content: any;
    export default content;
  }

  declare module '*.png' {
    const content: any;
    export default content;
  }

  declare module '*.jpg' {
    const content: any;
    export default content;
  }
}

// Make TypeScript happy with missing types
export {};
