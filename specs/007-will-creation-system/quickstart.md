# Will Creation System - User Flows & Testing Scenarios

## User Journey Overview

The will creation system provides a guided, step-by-step experience for users to create legally valid wills. The process is divided into 8 main steps with Sofia AI assistance throughout.

## Primary User Flows

### Flow 1: First-Time Will Creation

#### Step 1: Getting Started
**User Action:** User clicks "Create My Will" from dashboard
**System Response:**
- Display jurisdiction selection modal
- Show estimated completion time (15-20 minutes)
- Explain the process with progress indicator

**UI Elements:**
- Jurisdiction dropdown with popular options
- "Start Creating" button
- Progress bar showing 8 steps
- Sofia welcome message

#### Step 2: Personal Information
**User Action:** Fill out personal details
**System Response:**
- Validate required fields
- Auto-save draft every 30 seconds
- Sofia provides guidance on required information

**Form Fields:**
- Full legal name
- Date of birth
- Complete address
- Citizenship
- Marital status
- Occupation (optional)

**Validation Rules:**
- Name: 2-100 characters, no special characters
- DOB: Must be 18+ years old
- Address: Complete with country

#### Step 3: Beneficiaries
**User Action:** Add and configure beneficiaries
**System Response:**
- Dynamic beneficiary addition
- Percentage validation (must total 100%)
- Relationship suggestions via Sofia AI

**Features:**
- Add/remove beneficiaries
- Set inheritance percentages
- Specify conditions
- Add contact information

#### Step 4: Assets & Property
**User Action:** Inventory assets
**System Response:**
- Categorized asset input
- Value estimation assistance
- Automatic categorization

**Asset Categories:**
- Real estate
- Vehicles
- Bank accounts
- Investments
- Personal property
- Digital assets

#### Step 5: Executor Appointment
**User Action:** Designate executor and powers
**System Response:**
- Primary and backup executor options
- Predefined power templates
- Professional executor option

**Configuration:**
- Executor personal details
- Specific powers granted
- Compensation terms

#### Step 6: Guardianship (Conditional)
**User Action:** Set up guardianship for minor children
**System Response:**
- Only shown if user has minor children
- Guardian qualification guidance
- Trust setup options

#### Step 7: Special Instructions
**User Action:** Add personal wishes and instructions
**System Response:**
- Rich text editor for instructions
- Template suggestions
- Sofia content assistance

**Sections:**
- Funeral wishes
- Organ donation
- Pet care
- Digital assets
- Personal messages
- Charitable bequests

#### Step 8: Review & Finalize
**User Action:** Review complete will and generate PDF
**System Response:**
- Complete will preview
- Legal disclaimer display
- PDF generation with progress
- Secure storage in vault

### Flow 2: Will Revision

#### Step 1: Select Existing Will
**User Action:** Choose will to revise from dashboard
**System Response:**
- List all user's wills with status
- Show last modified date
- Create revision option

#### Step 2: Revision Workflow
**User Action:** Modify existing will data
**System Response:**
- Pre-populated forms with existing data
- Change tracking and highlighting
- Version comparison option

#### Step 3: Generate New Version
**User Action:** Complete revision and generate PDF
**System Response:**
- Automatic version numbering
- Parent-child relationship tracking
- Archive previous version

### Flow 3: Template-Based Creation

#### Step 1: Template Selection
**User Action:** Browse available templates
**System Response:**
- Jurisdiction-filtered templates
- Template previews and features
- Sofia recommendations

#### Step 2: Guided Template Completion
**User Action:** Fill template-specific sections
**System Response:**
- Template-driven form flow
- Required vs optional sections
- Legal requirement validation

## Sofia AI Integration Flows

### Contextual Guidance
```typescript
// Sofia provides step-by-step assistance
interface SofiaGuidance {
  currentStep: number;
  totalSteps: 8;
  currentSection: string;
  nextAction: string;
  helpfulTips: string[];
  estimatedTimeRemaining: number;
}
```

### Content Assistance
```typescript
// AI-powered content suggestions
interface ContentSuggestion {
  type: 'beneficiary' | 'executor' | 'instruction';
  suggestion: string;
  confidence: number;
  reasoning: string;
  userConfirmationRequired: boolean;
}
```

### Legal Explanation
```typescript
// Explain legal concepts in simple terms
interface LegalExplanation {
  concept: string;
  simpleExplanation: string;
  legalImplications: string;
  commonQuestions: string[];
}
```

## Error Handling Flows

### Validation Errors
```typescript
interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
  sofiaHelp?: string;
}
```

### Recovery Scenarios
- **Draft Auto-save Failure:** Local storage fallback
- **Network Interruption:** Offline mode with sync on reconnect
- **Invalid Data:** Clear error messages with correction guidance
- **PDF Generation Failure:** Retry mechanism with alternative formats

## Testing Scenarios

### 1) Basic Will Creation
**Objective:** Test simple will generation with minimal data
```typescript
describe('Basic Will Creation', () => {
  test('should create valid will with required fields', async () => {
    const willData = {
      testator: {
        fullName: 'John Doe',
        dateOfBirth: '1980-01-01',
        address: createTestAddress(),
        citizenship: 'US',
        maritalStatus: 'single'
      },
      beneficiaries: [{
        name: 'Jane Doe',
        relationship: 'sibling',
        percentage: 100
      }],
      executor: {
        name: 'Bob Smith',
        relationship: 'friend'
      }
    };

    const result = await createWill(willData);
    expect(result.success).toBe(true);
    expect(result.willId).toBeDefined();
    expect(result.validationErrors).toHaveLength(0);
  });
});
```

### 2) Complex Will Creation
**Objective:** Test will with multiple beneficiaries and complex assets
```typescript
describe('Complex Will Creation', () => {
  test('should handle multiple beneficiaries and assets', async () => {
    const willData = {
      testator: createTestTestator(),
      beneficiaries: [
        { name: 'Spouse', percentage: 50, relationship: 'spouse' },
        { name: 'Child 1', percentage: 25, relationship: 'child' },
        { name: 'Child 2', percentage: 25, relationship: 'child' }
      ],
      assets: {
        realEstate: [createTestProperty()],
        bankAccounts: [createTestAccount()],
        investments: [createTestInvestment()]
      },
      executor: createTestExecutor(),
      backupExecutor: createTestBackupExecutor()
    };

    const result = await createWill(willData);
    expect(result.beneficiaryDistribution).toBe(100);
    expect(result.assetAssignments).toBeValid();
  });
});
```

### 3) Legal Validation
**Objective:** Test jurisdiction compliance and legal requirement validation
```typescript
describe('Legal Validation', () => {
  test('should validate against jurisdiction requirements', async () => {
    const willData = createWillForJurisdiction('US-California');

    const validation = await validateWillLegally(willData, 'US-California');
    expect(validation.isValid).toBe(true);
    expect(validation.witnessesRequired).toBe(2);
    expect(validation.notarizationRequired).toBe(false);
  });

  test('should catch legal compliance issues', async () => {
    const invalidWill = createInvalidWill();

    const validation = await validateWillLegally(invalidWill, 'US-Texas');
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('notarization_required');
  });
});
```

### 4) i18n Testing
**Objective:** Test multi-language support and localization
```typescript
describe('i18n Testing', () => {
  test('should generate will in different languages', async () => {
    const willData = createTestWill();
    const languages = ['en', 'es', 'fr', 'de'];

    for (const lang of languages) {
      const localizedWill = await generateWillInLanguage(willData, lang);
      expect(localizedWill.language).toBe(lang);
      expect(localizedWill.clauses).toBeTranslated();
      expect(localizedWill.legalTerms).toBeLocalized();
    }
  });

  test('should handle jurisdiction-language combinations', async () => {
    const result = await getAvailableLanguages('US-California');
    expect(result).toContain('en');
    expect(result).toContain('es');

    const spanishWill = await createWillInLanguage('US-California', 'es');
    expect(spanishWill.jurisdictionLanguage).toBe('es-US');
  });
});
```

### 5) PDF Export
**Objective:** Test document generation and formatting
```typescript
describe('PDF Export', () => {
  test('should generate properly formatted PDF', async () => {
    const will = await createTestWill();
    const pdf = await generateWillPDF(will.id);

    expect(pdf.size).toBeGreaterThan(0);
    expect(pdf.pageCount).toBeGreaterThan(1);
    expect(pdf.hasWatermark).toBe(false);
    expect(pdf.checksum).toBeDefined();
  });

  test('should include all required legal sections', async () => {
    const will = await createCompleteWill();
    const pdf = await generateWillPDF(will.id);

    const content = await extractPDFText(pdf);
    expect(content).toContain('Last Will and Testament');
    expect(content).toContain(will.testator.fullName);
    expect(content).toContain('Executor');
    expect(content).toContain('Witnesses');
  });
});
```

### 6) Template Updates
**Objective:** Test legal template changes and updates
```typescript
describe('Template Updates', () => {
  test('should handle template version changes', async () => {
    const will = await createWillWithTemplate('US-General', '1.0');

    // Update template to version 1.1
    await updateTemplate('US-General', '1.1');

    const updatedWill = await regenerateWill(will.id);
    expect(updatedWill.templateVersion).toBe('1.1');
    expect(updatedWill.clauses).toBeUpdated();
  });

  test('should maintain backward compatibility', async () => {
    const oldWill = await createWillWithOldTemplate();

    const migratedWill = await migrateWillToNewTemplate(oldWill.id);
    expect(migratedWill.isValid).toBe(true);
    expect(migratedWill.migrationNotes).toBeDefined();
  });
});
```

### 7) Error Handling
**Objective:** Test validation errors and recovery
```typescript
describe('Error Handling', () => {
  test('should handle validation errors gracefully', async () => {
    const invalidData = createInvalidWillData();

    const result = await createWill(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('fullName_required');
    expect(result.errors).toContain('dateOfBirth_invalid');
  });

  test('should provide helpful error messages', async () => {
    const willWithErrors = createWillWithValidationIssues();

    const validation = await validateWill(willWithErrors);
    expect(validation.errorMessages).toBeUserFriendly();
    expect(validation.suggestions).toBeActionable();
  });
});
```

### 8) Performance Test
**Objective:** Test system performance with large wills
```typescript
describe('Performance Test', () => {
  test('should handle large wills efficiently', async () => {
    const largeWill = createLargeWill(50); // 50 beneficiaries

    const startTime = Date.now();
    const result = await createWill(largeWill);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(5000); // 5 seconds
    expect(result.success).toBe(true);
  });

  test('should generate PDFs within time limits', async () => {
    const complexWill = createComplexWill();

    const startTime = Date.now();
    const pdf = await generateWillPDF(complexWill.id);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(3000); // 3 seconds
    expect(pdf.size).toBeGreaterThan(0);
  });
});
```

### 9) Security Test
**Objective:** Test data protection and access controls
```typescript
describe('Security Test', () => {
  test('should encrypt sensitive will data', async () => {
    const willData = createWillWithSensitiveData();

    const savedWill = await saveWill(willData);
    expect(savedWill.isEncrypted).toBe(true);
    expect(savedWill.canDecrypt).toBe(true);
  });

  test('should enforce access controls', async () => {
    const user1Will = await createWillForUser(user1);
    const user2Token = getAuthToken(user2);

    await expect(
      accessWill(user1Will.id, user2Token)
    ).rejects.toThrow('Unauthorized');
  });
});
```

### 10) End-to-End Test
**Objective:** Test complete user journey
```typescript
describe('End-to-End Test', () => {
  test('should complete full will creation workflow', async () => {
    // 1. User authentication
    const user = await authenticateUser();

    // 2. Start will creation
    const session = await startWillCreation(user.id, 'US-General');

    // 3. Fill personal information
    await updateWillSection(session.id, 'testator', testatorData);

    // 4. Add beneficiaries
    await updateWillSection(session.id, 'beneficiaries', beneficiaryData);

    // 5. Add assets
    await updateWillSection(session.id, 'assets', assetData);

    // 6. Set executor
    await updateWillSection(session.id, 'executor', executorData);

    // 7. Add special instructions
    await updateWillSection(session.id, 'instructions', instructionData);

    // 8. Review and validate
    const validation = await validateWill(session.id);
    expect(validation.isValid).toBe(true);

    // 9. Generate PDF
    const pdf = await generateWillPDF(session.id);
    expect(pdf).toBeDefined();

    // 10. Complete will
    const finalWill = await completeWill(session.id);
    expect(finalWill.status).toBe('completed');
    expect(finalWill.pdfUrl).toBeDefined();
  });
});
```

#### Template Processing
```typescript
describe('Template Processing', () => {
  test('should assemble clauses correctly', () => {
    const template = getTemplate('US-General');
    const willData = createMockWillData();

    const result = processTemplate(template, willData);

    expect(result.sections).toHaveLength(8);
    expect(result.clauses.revocation).toBeDefined();
  });
});
```

### Integration Testing

#### End-to-End Will Creation
```typescript
describe('End-to-End Will Creation', () => {
  test('should create complete will with PDF', async () => {
    // Setup
    const user = await createTestUser();
    const jurisdiction = 'US-General';

    // Execute flow
    const will = await createWill(user.id, jurisdiction);
    await fillPersonalInfo(will.id, mockPersonalData);
    await addBeneficiaries(will.id, mockBeneficiaries);
    await addAssets(will.id, mockAssets);
    await setExecutor(will.id, mockExecutor);
    await addSpecialInstructions(will.id, mockInstructions);

    // Generate PDF
    const pdf = await generateWillPDF(will.id);

    // Assertions
    expect(will.status).toBe('completed');
    expect(pdf).toBeDefined();
    expect(pdf.length).toBeGreaterThan(0);
  });
});
```

#### Sofia AI Integration
```typescript
describe('Sofia AI Integration', () => {
  test('should provide contextual guidance', async () => {
    const context = {
      currentStep: 3,
      userData: mockUserData,
      willProgress: 0.5
    };

    const guidance = await getSofiaGuidance(context);

    expect(guidance.nextAction).toBeDefined();
    expect(guidance.helpfulTips).toHaveLengthGreaterThan(0);
  });
});
```

### Performance Testing

#### PDF Generation Performance
```typescript
describe('PDF Generation Performance', () => {
  test('should generate PDF within 3 seconds', async () => {
    const willData = createLargeWillData();
    const startTime = Date.now();

    await generateWillPDF(willData);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000);
  });
});
```

#### Concurrent User Load
```typescript
describe('Concurrent User Load', () => {
  test('should handle 100 concurrent users', async () => {
    const users = await createTestUsers(100);
    const promises = users.map(user => createWill(user.id, 'US-General'));

    const results = await Promise.all(promises);

    expect(results).toHaveLength(100);
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  });
});
```

## Accessibility Testing

### Screen Reader Compatibility
- All form fields have proper labels
- Progress indicators are announced
- Error messages are associated with fields
- PDF output includes accessibility metadata

### Keyboard Navigation
- Tab order follows logical flow
- Enter/Space activate buttons
- Arrow keys navigate dropdowns
- Escape cancels modals

### Color Contrast
- All text meets WCAG AA standards
- Error states clearly distinguishable
- Focus indicators visible
- Color not only method of conveying information

## Security Testing

### Data Encryption
```typescript
describe('Data Encryption', () => {
  test('should encrypt will data at rest', async () => {
    const willData = createMockWillData();
    const encrypted = await encryptWillData(willData);

    expect(encrypted).not.toBe(JSON.stringify(willData));
    expect(await decryptWillData(encrypted)).toEqual(willData);
  });
});
```

### Authentication & Authorization
```typescript
describe('Authentication & Authorization', () => {
  test('should prevent unauthorized access', async () => {
    const user1Will = await createWill(user1.id, 'US-General');
    const user2Token = await getAuthToken(user2);

    await expect(
      getWill(user1Will.id, user2Token)
    ).rejects.toThrow('Unauthorized');
  });
});
```

## Cross-Browser Testing

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Responsive Design
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Internationalization Testing

### Language Support
```typescript
describe('Language Support', () => {
  test('should display in user locale', async () => {
    const user = await createUser({ locale: 'es-ES' });
    const will = await createWill(user.id, 'ES-General');

    const ui = await renderWillCreation(user);
    expect(ui.labels).toEqual(spanishLabels);
  });
});
```

### Jurisdiction-Specific Templates
```typescript
describe('Jurisdiction Templates', () => {
  test('should load correct template for jurisdiction', async () => {
    const californiaWill = await createWill(user.id, 'US-California');
    const texasWill = await createWill(user.id, 'US-Texas');

    expect(californiaWill.template.witnessCount).toBe(2);
    expect(texasWill.template.notarizationRequired).toBe(true);
  });
});
```

## Monitoring & Analytics

### User Behavior Tracking
- Step completion rates
- Time spent per section
- Common drop-off points
- Sofia interaction patterns

### Performance Metrics
- PDF generation time
- Page load times
- Error rates by step
- Template usage statistics

### Business Metrics
- Conversion rates
- Will completion rates
- User satisfaction scores
- Support ticket volume

This comprehensive testing approach ensures the will creation system is robust, secure, accessible, and provides an excellent user experience across all scenarios.