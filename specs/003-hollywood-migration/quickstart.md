# Quickstart: Hollywood Migration Validation

## Primary E2E Flows to Validate Migration Success

### **Flow 1: Development Environment Setup**

**Objective**: Verify that migrated infrastructure enables productive development

#### Steps

1. **Fresh Repository Clone**

   ```bash
   git clone <schwalbe-repo>
   cd schwalbe
   npm ci
   ```

2. **Development Server Start**

   ```bash
   npm run dev
   ```

   - ✅ All packages build without TypeScript errors
   - ✅ Development server starts on expected port
   - ✅ Hot reload works for component changes

3. **Package Development Workflow**

```bash
# Test UI package development
npm run storybook -w packages/ui

# Test shared package building
npm run build -w packages/shared
npm run test -w packages/shared

# Test logic package validation
npm run typecheck -w packages/logic
npm run test -w packages/logic
```

- ✅ Storybook loads and displays components
- ✅ Package builds complete successfully
- ✅ Tests pass with good coverage

### **Flow 2: Component Library Integration**

**Objective**: Verify UI components work in application context

#### Component Integration Steps

1. **Create Test Application**

```bash
npm run dev -w apps/web-next
```

1. **Component Import and Usage**

   ```tsx
   // Test in app component
   import { Button, Card, Input } from '@schwalbe/ui';
   
   function TestPage() {
     return (
       <Card>
         <Input placeholder="Test input" />
         <Button variant="primary">Test Button</Button>
       </Card>
     );
   }
   ```

   - ✅ Components import without errors
   - ✅ Components render with correct styling
   - ✅ Interactive components respond to user input

2. **Theme and Styling Validation**

   ```tsx
   import { useTheme, ThemeProvider } from '@schwalbe/ui';
   ```

   - ✅ Theme provider works correctly
   - ✅ Dark/light mode switching functional
   - ✅ Tailwind classes applied properly

### **Flow 3: Internationalization System**

**Objective**: Verify i18n system supports multi-language content

#### Internationalization Steps

1. **Language Initialization**

   ```tsx
   import { I18nProvider, useTranslation } from '@schwalbe/shared';
   
   function App() {
     return (
       <I18nProvider language="cs" country="CZ">
         <TestContent />
       </I18nProvider>
     );
   }
   ```

2. **Translation Usage**

   ```tsx
   function TestContent() {
     const { t } = useTranslation();
     
     return (
       <div>
         <h1>{t('welcome.title')}</h1>
         <p>{t('welcome.description')}</p>
       </div>
     );
   }
   ```

   - ✅ Translations load for EN/CS/SK/DE/UK languages
   - ✅ Language switching works dynamically
   - ✅ Legal terminology displays correctly

3. **Jurisdiction-Aware Content**

   ```tsx
   const { t, locale } = useTranslation();
   const legalText = t(`legal.will.requirements.${locale.country}`);
   ```

   - ✅ Country-specific legal content loads
   - ✅ Jurisdiction detection works automatically

### **Flow 4: Security & Encryption**

**Objective**: Verify client-side encryption patterns work correctly

#### Security & Encryption Steps

1. **Encryption Service Integration**

   ```tsx
   import { useEncryption } from '@schwalbe/shared';
   
   function SecureForm() {
     const { encrypt, decrypt } = useEncryption();
     
     const handleSecureSubmit = async (data) => {
       const encrypted = await encrypt(JSON.stringify(data));
       // Send encrypted data to server
     };
   }
   ```

2. **Key Management**

   ```typescript
   // Test key derivation and storage
   const userKey = await deriveUserKey(password, salt);
   const docKey = await generateDocumentKey();
   const encryptedDocKey = await encryptDocumentKey(docKey, userKey);
   ```

   - ✅ Encryption/decryption round-trip works
   - ✅ Key derivation produces consistent results
   - ✅ Secure storage patterns functional

3. **Zero-Knowledge Data Flow**

   ```typescript
   // Simulate document upload with encryption
   const document = { title: "Test Doc", content: "Secret content" };
   const encrypted = await encrypt(JSON.stringify(document));
   const stored = await uploadDocument(encrypted);
   const retrieved = await getDocument(stored.id);
   const decrypted = JSON.parse(await decrypt(retrieved.encryptedContent));
   ```

   - ✅ End-to-end encryption maintains data privacy
   - ✅ Server never sees plaintext content

### **Flow 5: Build & Deployment Pipeline**

**Objective**: Verify production build process works correctly

#### Build & Deployment Steps

1. **Production Build**

   ```bash
   npm run build
   ```

   - ✅ All packages build without errors
   - ✅ TypeScript strict mode passes
   - ✅ Bundle optimization produces reasonable sizes

2. **Testing Pipeline**

   ```bash
   npm run test
   npm run test:e2e
   ```

   - ✅ Unit tests pass across all packages
   - ✅ E2E tests validate critical user flows
   - ✅ Coverage meets established thresholds

3. **Quality Gates**

   ```bash
   npm run lint
   npm run typecheck
   ```

   - ✅ ESLint passes with boundary rules enforced
   - ✅ TypeScript compilation succeeds
   - ✅ No security vulnerabilities detected

### **Flow 6: Package Boundaries & Dependencies**

**Objective**: Verify monorepo architecture rules are enforced

#### Package Boundaries Steps

1. **Boundary Violation Testing**

```typescript
   // This should fail ESLint
   import { SomethingInternal } from '../../../apps/web-next/src/internal';
   
   // This should be allowed
   import { Button } from '@schwalbe/ui';
   import { AuthService } from '@schwalbe/shared';
   ```

- ✅ ESLint prevents app→app dependencies
- ✅ ESLint prevents package→app dependencies
- ✅ Allowed dependencies work correctly

1. **TypeScript Project References**

   ```bash
   # Build should respect reference order
   npx tsc --build
   ```

   - ✅ Packages build in correct dependency order
   - ✅ Type checking works across package boundaries
   - ✅ Incremental builds work properly

## Performance Validation

### **Bundle Size Benchmarks**

- `@schwalbe/ui` bundle: < 100kb gzipped
- `@schwalbe/shared` bundle: < 50kb gzipped  
- `@schwalbe/logic` bundle: < 75kb gzipped
- Full app bundle: < 500kb initial load

### **Development Performance**

- Cold start (npm ci + dev): < 60 seconds
- Hot reload response time: < 500ms
- TypeScript compilation: < 10 seconds
- Test suite execution: < 30 seconds

## Security Validation Checklist

### **Encryption Verification**

- [ ] Client-side encryption never exposes plaintext to server
- [ ] Key derivation produces consistent results
- [ ] Encrypted data cannot be decrypted without user key
- [ ] Key rotation functionality works without data loss

### **Content Security Policy**

- [ ] CSP headers properly configured
- [ ] No inline scripts or styles in violation
- [ ] Trusted Types prevent XSS attacks
- [ ] External resource loading properly restricted

### **Authentication Security**

- [ ] Authentication state properly managed
- [ ] Session tokens securely stored
- [ ] Route protection prevents unauthorized access
- [ ] Logout properly clears all auth state

## Acceptance Criteria

The migration is considered successful when:

1. **All flows complete without errors**
2. **Performance meets or exceeds benchmarks**
3. **Security validation passes completely**
4. **Development experience matches hollywood productivity**
5. **No breaking changes introduced to existing schwalbe code**

## Rollback Plan

If validation fails:

1. **Preserve hollywood reference**: Keep original repository unchanged
2. **Document specific failures**: Record which flows/tests failed and why
3. **Selective rollback**: Remove problematic migrations while keeping successful ones
4. **Incremental retry**: Address failures and re-run validation flows
5. **Escalation path**: Engage original hollywood developers if needed
