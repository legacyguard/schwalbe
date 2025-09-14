# Will Generation Engine - Quick Start Guide

This guide provides a quick start for implementing and testing the Will Generation Engine in Schwalbe.

## Security notes

- The Supabase service role key must be used only in server-side contexts (e.g., Edge Functions); never expose it to the browser.
- Use your deployment platform's secret manager for production.
- Do not log Authorization headers.

## Security & RLS verification

- Confirm all will-related tables have RLS enabled and policies in place; write tests per 005-auth-rls-baseline.
- Ensure structured logs in Edge Functions include a correlation ID; simulate a critical error and confirm a Resend email alert; no Sentry.

## Prerequisites

- Node.js 18+ and npm (use npm ci for installs)
- Access to Hollywood codebase for migration reference
- Supabase project with database access
- Supabase Auth baseline (see 005-auth-rls-baseline)
- Basic understanding of React and TypeScript

## Installation

### 1. Database Setup

```sql
-- Run the migration scripts from data-model.md
-- Create the required tables and indexes
-- Set up RLS policies
```

### 2. Package Dependencies

```bash
# Install required packages
npm install puppeteer handlebars json-schema
npm install -D @types/puppeteer jest

# For packages/logic
cd packages/logic
npm install handlebars json-schema
```

### 3. Environment Variables

```env
# Add to your .env.local
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # server-side only (Edge Functions)
OPENAI_API_KEY=your_openai_key  # For Sofia AI integration
```

## Testing Scenarios

### 1) Will Engine Setup - configure will engine

```typescript
// Configure will generation engine
const engine = new WillGenerationEngine({
  jurisdiction: 'US-General',
  language: 'en',
  templateVersion: '1.0'
});

// Test basic configuration
console.log('Engine configured:', engine.getConfiguration());
```

### 2) Legal Template Testing - test legal templates

```typescript
// Load and validate legal template
const template = await templateService.loadTemplate('us-general-will');
console.log('Template loaded:', template.name);

// Validate template structure
const validation = await templateService.validateTemplate(template);
console.log('Template validation:', validation.isValid);
```

### 3) Clause Assembly Testing - test clause assembly

```typescript
// Test clause assembly with sample data
const testData = {
  testatorName: 'John Doe',
  beneficiaries: ['Jane Doe'],
  executor: 'Bob Smith'
};

const assembledClauses = await clauseAssembler.assemble(testData);
console.log('Assembled clauses:', assembledClauses.length);
```

### 4) Legal Validation Testing - test legal validation

```typescript
// Test legal validation with sample will data
const willData = createSampleWillData();
const validation = await legalValidator.validateWill(willData);

console.log('Validation results:', {
  isValid: validation.isValid,
  errors: validation.errors.length,
  warnings: validation.warnings.length
});
```

### 5) PDF Generation Testing - test PDF generation

```typescript
// Test PDF generation with sample content
const htmlContent = '<h1>Test Will Document</h1><p>This is a test.</p>';
const pdfBuffer = await pdfGenerator.generatePDF(htmlContent);

console.log('PDF generated, size:', pdfBuffer.length, 'bytes');
```

### 6) Jurisdiction Testing - test jurisdiction rules

```typescript
// Test jurisdiction-specific rules
const usRules = await jurisdictionService.getRules('US-General');
const euRules = await jurisdictionService.getRules('EU-General');

console.log('US Rules:', usRules.length);
console.log('EU Rules:', euRules.length);
```

### 7) Performance Testing - test will engine performance

```typescript
// Performance test for will generation
const startTime = Date.now();

for (let i = 0; i < 100; i++) {
  await engine.generateWill(createSampleWillData());
}

const endTime = Date.now();
console.log('Performance test completed in:', endTime - startTime, 'ms');
```

### 8) Security Testing - test will engine security

```typescript
// Test security features
const encryptedData = await encryptionService.encrypt(testData);
const decryptedData = await encryptionService.decrypt(encryptedData);

console.log('Encryption test passed:', JSON.stringify(testData) === JSON.stringify(decryptedData));
```

### 9) Error Handling - test error handling

```typescript
// Test error handling scenarios
try {
  await engine.generateWill({}); // Invalid data
} catch (error) {
  console.log('Error handling test passed:', error.message);
}

// Test with invalid jurisdiction
try {
  await engine.generateWill({ ...testData, jurisdiction: 'invalid' });
} catch (error) {
  console.log('Invalid jurisdiction error:', error.message);
}
```

### 10) End-to-End Test - complete will generation workflow

```typescript
// Complete end-to-end test
const workflow = new WillGenerationWorkflow();

const result = await workflow.execute({
  userId: 'test-user',
  jurisdiction: 'US-General',
  template: 'basic-will',
  data: createCompleteWillData()
});

console.log('End-to-end test result:', {
  success: result.success,
  documentId: result.documentId,
  generationTime: result.generationTime,
  validationPassed: result.validationPassed
});
```

### 2. Basic Template Structure

```typescript
// packages/logic/src/templates/us-general.ts
export const US_GENERAL_TEMPLATE = {
  sections: [
    {
      id: 'declaration',
      title: 'Declaration',
      required: true,
      content: `I, {{testator.fullName}}, of {{testator.address}}, being of sound mind and body, do hereby make, publish and declare this to be my Last Will and Testament.`
    },
    {
      id: 'revocation',
      title: 'Revocation',
      required: true,
      content: 'I hereby revoke all wills and codicils previously made by me.'
    },
    {
      id: 'beneficiaries',
      title: 'Beneficiaries',
      required: true,
      content: `I give, devise and bequeath my estate as follows:
        {{#each beneficiaries}}
        - {{percentage}}% to {{name}} ({{relationship}})
        {{/each}}`
    }
  ],
  legalRequirements: {
    witnessCount: 2,
    notarizationRequired: false,
    minimumAge: 18
  }
};
```

### 3. PDF Generation

```typescript
// packages/logic/src/pdf-generator/index.ts
import puppeteer from 'puppeteer';
import { WillData } from '../types/will';

export class PDFGenerator {
  async generatePDF(willData: WillData, htmlContent: string): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set content and styling
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
      }
    });

    await browser.close();
    return pdf;
  }
}
```

## UI Integration

### 1. Basic Will Creation Wizard

```tsx
// apps/web-next/src/components/will/WillWizard.tsx
import { useState } from 'react';
import { WillData } from '../../../packages/logic/src/types/will';

export function WillWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [willData, setWillData] = useState<Partial<WillData>>({});

  const steps = [
    { id: 1, title: 'Personal Information', component: PersonalInfoStep },
    { id: 2, title: 'Beneficiaries', component: BeneficiariesStep },
    { id: 3, title: 'Assets', component: AssetsStep },
    { id: 4, title: 'Executors', component: ExecutorsStep },
    { id: 5, title: 'Review & Generate', component: ReviewStep }
  ];

  const CurrentStepComponent = steps.find(s => s.id === currentStep)?.component;

  return (
    <div className="will-wizard">
      <div className="progress-bar">
        {steps.map(step => (
          <div
            key={step.id}
            className={`step ${currentStep >= step.id ? 'completed' : ''}`}
          >
            {step.title}
          </div>
        ))}
      </div>

      <div className="step-content">
        {CurrentStepComponent && (
          <CurrentStepComponent
            willData={willData}
            onUpdate={setWillData}
            onNext={() => setCurrentStep(prev => prev + 1)}
            onPrevious={() => setCurrentStep(prev => prev - 1)}
          />
        )}
      </div>
    </div>
  );
}
```

### 2. Personal Information Step

```tsx
// apps/web-next/src/components/will/steps/PersonalInfoStep.tsx
import { useForm } from 'react-hook-form';

interface PersonalInfoStepProps {
  willData: Partial<WillData>;
  onUpdate: (data: Partial<WillData>) => void;
  onNext: () => void;
}

export function PersonalInfoStep({ willData, onUpdate, onNext }: PersonalInfoStepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: willData.testator_data
  });

  const onSubmit = (data: any) => {
    onUpdate({
      ...willData,
      testator_data: data
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="fullName">Full Legal Name</label>
        <input
          id="fullName"
          {...register('fullName', { required: 'Full name is required' })}
          type="text"
        />
        {errors.fullName && <span className="error">{errors.fullName.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          id="dateOfBirth"
          {...register('dateOfBirth', { required: 'Date of birth is required' })}
          type="date"
        />
        {errors.dateOfBirth && <span className="error">{errors.dateOfBirth.message}</span>}
      </div>

      <button type="submit">Next</button>
    </form>
  );
}
```

## Testing

### 1. Unit Tests

```typescript
// packages/logic/src/__tests__/will-generation.test.ts
import { WillGenerationEngine } from '../will-generation';
import { mockWillData } from './mocks';

describe('WillGenerationEngine', () => {
  let engine: WillGenerationEngine;

  beforeEach(() => {
    engine = new WillGenerationEngine();
  });

  it('should generate a valid will', async () => {
    const result = await engine.generateWill(mockWillData);

    expect(result.content).toBeDefined();
    expect(result.validation.isValid).toBe(true);
    expect(result.metadata.jurisdiction).toBe('US-General');
  });

  it('should reject invalid will data', async () => {
    const invalidData = { ...mockWillData, testator_data: {} };

    await expect(engine.generateWill(invalidData)).rejects.toThrow();
  });
});
```

### 2. Integration Tests

```typescript
// apps/web-next/src/__tests__/WillWizard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WillWizard } from '../components/will/WillWizard';

describe('WillWizard', () => {
  it('should render first step', () => {
    render(<WillWizard />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Legal Name')).toBeInTheDocument();
  });

  it('should navigate between steps', () => {
    render(<WillWizard />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(screen.getByText('Beneficiaries')).toBeInTheDocument();
  });
});
```

## API Integration

### 1. Will Management API

```typescript
// apps/web-next/src/lib/api/willApi.ts
import { supabase } from '../supabase';

export const willApi = {
  async createWill(data: CreateWillRequest): Promise<Will> {
    const { data: will, error } = await supabase
      .from('wills')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return will;
  },

  async updateWill(id: string, data: Partial<Will>): Promise<Will> {
    const { data: will, error } = await supabase
      .from('wills')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return will;
  },

  async generatePDF(id: string): Promise<{ pdfUrl: string }> {
    const { data, error } = await supabase.functions.invoke('generate-will-pdf', {
      body: { willId: id }
    });

    if (error) throw error;
    return data;
  }
};
```

### 2. Supabase Edge Function

```typescript
// supabase/functions/generate-will-pdf/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { WillGenerationEngine } from '../../../packages/logic/src/will-generation/index.ts';

serve(async (req) => {
  const { willId } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Fetch will data
  const { data: willData, error } = await supabase
    .from('wills')
    .select('*')
    .eq('id', willId)
    .single();

  if (error) throw error;

  // Generate will
  const engine = new WillGenerationEngine();
  const generatedWill = await engine.generateWill(willData);

  // Generate PDF
  const pdfGenerator = new PDFGenerator();
  const pdfBuffer = await pdfGenerator.generatePDF(willData, generatedWill.content);

  // Upload to storage
  const fileName = `wills/${willId}/will-${Date.now()}.pdf`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, pdfBuffer);

  if (uploadError) throw uploadError;

  return new Response(JSON.stringify({
    pdfUrl: uploadData.path,
    checksum: generatedWill.metadata.checksum
  }));
});
```

## Deployment

### 1. Build Configuration

```typescript
// packages/logic/package.json
{
  "name": "@schwalbe/logic",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  }
}
```

### 2. Vercel Deployment

```json
// vercel.json
{
  "functions": {
    "supabase/functions/generate-will-pdf/index.ts": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

## Troubleshooting

### Common Issues

1. **PDF Generation Fails**
   - Check Puppeteer installation
   - Verify HTML template syntax
   - Check file permissions for uploads

2. **Validation Errors**
   - Review jurisdiction requirements
   - Check data completeness
   - Verify template configuration

3. **Database Connection Issues**
   - Check Supabase credentials
   - Verify RLS policies
   - Check network connectivity

### Debug Mode

```typescript
// Enable debug logging
const engine = new WillGenerationEngine({
  debug: true,
  logLevel: 'verbose'
});
```

## Next Steps

1. Complete the full UI wizard implementation
2. Add Sofia AI integration for guided creation
3. Implement comprehensive testing suite
4. Set up monitoring and error tracking
5. Deploy to staging environment for user testing

This quick start guide provides the foundation for implementing the Will Generation Engine. Refer to the detailed documentation in other files for comprehensive implementation details.
