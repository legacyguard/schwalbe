# Data Model: Hollywood Migration Interfaces & Contracts

## Core Service Interfaces

### **Authentication Service**

```typescript
interface AuthService {
  getCurrentUser(): Promise<User | null>;
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  metadata: Record<string, unknown>;
}
```

### **Encryption Service**

```typescript
interface EncryptionService {
  generateKeyPair(): Promise<CryptoKeyPair>;
  encrypt(data: string, publicKey: CryptoKey): Promise<EncryptedData>;
  decrypt(encryptedData: EncryptedData, privateKey: CryptoKey): Promise<string>;
  deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>;
}

interface EncryptedData {
  ciphertext: string;
  nonce: string;
  salt?: string;
}
```

### **Document Service**

```typescript
interface DocumentService {
  uploadDocument(file: File, metadata: DocumentMetadata): Promise<Document>;
  getDocument(id: string): Promise<Document>;
  searchDocuments(query: SearchQuery): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
}

interface Document {
  id: string;
  filename: string;
  filesize: number;
  mimetype: string;
  category: DocumentCategory;
  tags: string[];
  uploadedAt: Date;
  encryptedContent?: EncryptedData;
  ocrText?: string;
  metadata: DocumentMetadata;
}
```

### **Internationalization Service**

```typescript
interface I18nService {
  initialize(language: string, country: string): Promise<void>;
  translate(key: string, params?: Record<string, unknown>): string;
  changeLanguage(language: string): Promise<void>;
  getAvailableLanguages(): Language[];
  getCurrentLocale(): Locale;
}

interface Locale {
  language: string; // 'en', 'cs', 'sk'
  country: string;  // 'US', 'CZ', 'SK'
  jurisdiction: LegalJurisdiction;
}
```

## Package Boundaries & Dependencies

### **Dependency Graph**

```mermaid
graph TD
  A[apps/web] --> B[@schwalbe/ui]
  A --> C[@schwalbe/shared]
  A --> D[@schwalbe/logic]
  
  E[apps/mobile] --> B
  E --> C
  E --> D
  
  B --> C
  D --> C
  
  C --> F[External Services]
  F --> G[Supabase]
  F --> H[Auth Provider]
  F --> I[External APIs]
```

### **Package Exports**

```typescript
// @schwalbe/ui exports
export { Button, Card, Input, Select } from './components';
export { useTheme, ThemeProvider } from './theme';
export type { ComponentProps, ThemeConfig } from './types';

// @schwalbe/shared exports  
export { createAuthService, createEncryptionService } from './services';
export { createSupabaseClient } from './supabase';
export { logger, createLogger } from './logging';
export type { User, AuthService, EncryptionService } from './types';

// @schwalbe/logic exports
export { createDocumentService, createI18nService } from './services';
export { validateWillData, generateWillPDF } from './will';
export type { Document, Will, LegalTemplate } from './types';
```

## Configuration Contracts

### **Environment Configuration**

```typescript
interface AppEnvironment {
  // Core app settings
  NODE_ENV: 'development' | 'staging' | 'production';
  APP_URL: string;
  API_URL: string;
  
  // External service configuration
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // Optional integrations (templated in .env.example)
  AUTH_PROVIDER_CONFIG?: AuthProviderConfig;
  MONITORING_CONFIG?: MonitoringConfig;
  
  // Feature flags
  FEATURE_FLAGS: FeatureFlags;
}

interface FeatureFlags {
  enableSofiaAI: boolean;
  enableProfessionalNetwork: boolean;
  enableEmergencyAccess: boolean;
}
```

### **Build Configuration**

```typescript
interface BuildConfig {
  // Vite configuration
  vite: {
    plugins: VitePlugin[];
    build: {
      target: string;
      outDir: string;
      sourcemap: boolean;
    };
    server: {
      port: number;
      host: string;
    };
  };
  
  // TypeScript configuration  
  typescript: {
    strict: true;
    composite: boolean;
    references: TypeScriptReference[];
  };
  
  // Tailwind configuration
  tailwind: {
    content: string[];
    theme: ThemeConfig;
    plugins: TailwindPlugin[];
  };
}
```

## Migration Data Contracts

### **Package Migration Manifest**

```typescript
interface MigrationManifest {
  source: {
    repository: string;
    package: string;
    version: string;
    path: string;
  };
  
  destination: {
    package: string;
    version: string;
    path: string;
  };
  
  changes: MigrationChange[];
  dependencies: PackageDependency[];
  breaking: boolean;
}

interface MigrationChange {
  type: 'copy' | 'modify' | 'create' | 'delete';
  file: string;
  description: string;
  requires_manual_review: boolean;
}
```

### **Component Mapping**

```typescript
interface ComponentMapping {
  hollywood: {
    path: string;
    exportName: string;
    dependencies: string[];
  };
  
  schwalbe: {
    package: string;
    path: string;
    exportName: string;
    importPath: string;
  };
  
  changes: {
    props?: PropChange[];
    imports?: ImportChange[];
    breaking?: boolean;
  };
}
```

## Service Integration Patterns

### **Service Factory Pattern**

```typescript
interface ServiceFactory {
  createService<T>(
    type: ServiceType,
    config: ServiceConfig
  ): Promise<T>;
}

// Usage in migration
const authService = await serviceFactory.createService<AuthService>(
  'auth',
  { provider: 'clerk', config: authConfig }
);
```

### **Dependency Injection**

```typescript
interface ServiceContainer {
  register<T>(name: string, factory: () => T): void;
  resolve<T>(name: string): T;
  singleton<T>(name: string, factory: () => T): void;
}

// Migration pattern to reduce coupling
container.register('authService', () => createAuthService(config));
container.register('encryptionService', () => createEncryptionService());
```

## Validation Schemas

### **Package Validation**

```typescript
// Zod schema for package.json validation
const PackageSchema = z.object({
  name: z.string().startsWith('@schwalbe/'),
  version: z.string(),
  dependencies: z.record(z.string()).optional(),
  peerDependencies: z.record(z.string()).optional(),
  exports: z.object({
    '.': z.string(),
    './package.json': z.literal('./package.json')
  })
});

// Component props validation
const ComponentPropsSchema = z.object({
  variant: z.enum(['default', 'destructive', 'outline', 'secondary']),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  disabled: z.boolean().default(false)
});
```

### **Migration Validation**

```typescript
const MigrationResultSchema = z.object({
  success: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  migrated: z.object({
    files: z.number(),
    components: z.number(),
    dependencies: z.number()
  }),
  validation: z.object({
    typescript: z.boolean(),
    eslint: z.boolean(),
    tests: z.boolean(),
    build: z.boolean()
  })
});
```

## Security Boundaries

### **Encryption Key Management**

```typescript
interface KeyManagement {
  // Client-side key derivation
  deriveUserKey(password: string, salt: string): Promise<CryptoKey>;
  
  // Document encryption keys
  generateDocumentKey(): Promise<CryptoKey>;
  encryptDocumentKey(docKey: CryptoKey, userKey: CryptoKey): Promise<EncryptedData>;
  
  // Key rotation and recovery
  rotateKeys(oldKey: CryptoKey, newKey: CryptoKey): Promise<void>;
  generateRecoveryKey(): Promise<RecoveryKey>;
}
```

### **Content Security Policy**

```typescript
interface CSPConfig {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'font-src': string[];
  'trusted-types'?: string[];
}

const cspConfig: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'wasm-unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'connect-src': ["'self'", 'https://*.supabase.co']
};
```

This data model provides the contracts and interfaces needed for the hollywood migration while maintaining clean boundaries and enabling future extensibility.
