# Quickstart: Core Features Validation

## Primary E2E Flows to Validate Core Feature Success

### **Flow 1: User Authentication & Onboarding**

**Objective**: Verify complete user registration and onboarding experience

#### Steps

1. **User Registration**

   ```bash
   # Start application
   npm run dev
   # Navigate to sign-up page
   ```

   - ✅ User can register with email/password or social login
   - ✅ Email verification process works correctly  
   - ✅ User profile creation with basic information succeeds

2. **Onboarding Flow**

   ```typescript
   // Test identity capture with OCR
   const identityDoc = uploadFile('passport.jpg');
   const extractedData = await ocrService.extractIdentity(identityDoc);
   const profile = await createProfileFromOCR(extractedData);
   ```

   - ✅ ID document upload and OCR extraction works
   - ✅ Profile auto-completion from extracted data
   - ✅ Sofia AI introduction and personality calibration

3. **First Value Demonstration**

   ```typescript
   // Test first document upload
   const firstDoc = await uploadDocument('important-doc.pdf');
   const milestone = await completeMilestone('first-document-uploaded');
   ```

   - ✅ First document upload completes successfully
   - ✅ Milestone completion triggers celebration
   - ✅ Dashboard shows progress and next steps

### **Flow 2: Sofia AI System Interaction**

**Objective**: Verify Sofia AI provides helpful, cost-optimized assistance

#### Sofia AI Testing Steps

1. **Knowledge Base Queries**

   ```typescript
   // Test free knowledge base responses
   const sofiaResponse = await sofia.ask("How does encryption work?");
   expect(sofiaResponse.cost_tier).toBe('free');
   expect(sofiaResponse.actions).toContainActionButtons();
   ```

   - ✅ Knowledge base provides instant, free responses
   - ✅ Responses include relevant action buttons
   - ✅ Contextual filtering based on user progress

2. **Adaptive Personality Testing**

   ```typescript
   // Simulate empathetic user behavior
   await sofia.trackInteraction({
     type: 'help_seeking',
     response_time: 2000, // slow response
     session_duration: 15 // long session
   });
   
   const nextResponse = await sofia.ask("I need help");
   expect(nextResponse.tone).toBe('empathetic');
   ```

   - ✅ Sofia detects user communication preferences
   - ✅ Message tone adapts to empathetic or pragmatic style
   - ✅ Personality confidence scoring works correctly

3. **Proactive Interventions**

   ```typescript
   // Simulate user stuck state
   await simulateUserActivity({
     page: 'document-vault',
     idle_time: 180000, // 3 minutes
     no_meaningful_actions: true
   });
   
   const intervention = await sofia.checkForIntervention();
   expect(intervention.suggested).toBe(true);
   ```

   - ✅ Sofia detects when user appears stuck or idle
   - ✅ Interventions are contextually appropriate and helpful
   - ✅ Suggestions are delivered non-intrusively

### **Flow 3: Document Management System**

**Objective**: Verify secure document handling with AI-powered organization

#### Document Management Testing Steps

1. **Document Upload with Encryption**

   ```typescript
   // Test encrypted document upload
   const file = new File(['sensitive content'], 'private-doc.pdf');
   const uploadResult = await documentService.uploadDocument(file, {
     category: 'legal',
     tags: ['will', 'estate-planning']
   });
   
   // Verify encryption happened client-side
   expect(uploadResult.server_received_plaintext).toBe(false);
   expect(uploadResult.encrypted_content).toBeDefined();
   ```

   - ✅ Documents encrypted client-side before server transmission
   - ✅ Server never receives plaintext content
   - ✅ Encryption keys managed securely in browser

2. **AI Document Analysis**

   ```typescript
   // Test OCR and AI categorization
   const analysisResult = await documentService.analyzeDocument(documentId);
   
   expect(analysisResult.ocr_text).toContain('expected content');
   expect(analysisResult.ai_category).toBe('legal');
   expect(analysisResult.extracted_data.people_mentioned).toHaveLength(2);
   ```

   - ✅ OCR extracts text accurately from document images
   - ✅ AI categorizes documents with high confidence
   - ✅ Important entities (people, dates, amounts) extracted

3. **Document Search and Retrieval**

   ```typescript
   // Test encrypted content search
   const searchResults = await documentService.search({
     query: 'estate planning',
     categories: ['legal'],
     date_range: { start: '2024-01-01', end: '2024-12-31' }
   });
   
   expect(searchResults.total_count).toBeGreaterThan(0);
   expect(searchResults.search_time).toBeLessThan(300); // <300ms
   ```

   - ✅ Full-text search works across encrypted content
   - ✅ Search results returned within performance targets
   - ✅ Filtering and faceted search work correctly

### **Flow 4: Dashboard & Progress Tracking**

**Objective**: Verify milestone system motivates user engagement

#### Dashboard Testing Steps

1. **Milestone Completion Flow**

   ```typescript
   // Test milestone progression
   const initialProgress = await progressService.getUserProgress();
   
   await documentService.uploadDocument(testFile);
   await milestoneService.checkMilestoneCompletion('first-document');
   
   const updatedProgress = await progressService.getUserProgress();
   expect(updatedProgress.overall_completion).toBeGreaterThan(initialProgress.overall_completion);
   ```

   - ✅ Milestones update automatically based on user actions
   - ✅ Progress visualization shows completion status
   - ✅ Achievement system provides positive reinforcement

2. **Guided Workflow Testing**

   ```typescript
   // Test step-by-step task guidance
   const workflow = await workflowService.getGuidedWorkflow('document-organization');
   
   for (const step of workflow.steps) {
     const stepResult = await workflowService.completeStep(step.id);
     expect(stepResult.success).toBe(true);
   }
   
   const completedWorkflow = await workflowService.getWorkflowStatus();
   expect(completedWorkflow.completed).toBe(true);
   ```

   - ✅ Guided workflows provide clear next steps
   - ✅ Step validation works correctly
   - ✅ Workflow completion tracked and celebrated

3. **Dashboard Customization**

   ```typescript
   // Test dashboard widget system
   const layout = await dashboardService.getLayout();
   
   const newLayout = await dashboardService.updateLayout({
     ...layout,
     widgets: [
       { type: 'progress', position: { x: 0, y: 0, w: 2, h: 1 } },
       { type: 'recent-documents', position: { x: 2, y: 0, w: 2, h: 1 } }
     ]
   });
   
   expect(newLayout.saved).toBe(true);
   ```

   - ✅ Dashboard widgets can be customized and repositioned
   - ✅ Widget preferences persist across sessions
   - ✅ Dashboard loads quickly with customized layout

### **Flow 5: AI Cost Optimization Validation**

**Objective**: Verify cost controls keep AI usage within targets

#### Cost Optimization Testing Steps

1. **Three-Tier Cost Architecture**

   ```typescript
   // Test cost tier routing
   const freeQuery = await sofia.ask("How do I upload a document?");
   expect(freeQuery.cost_tier).toBe('free');
   
   const lowCostQuery = await sofia.ask("What should I do with my will?");
   expect(lowCostQuery.cost_tier).toBe('low_cost');
   
   const premiumQuery = await sofia.ask("Write a letter to my family");
   expect(premiumQuery.cost_tier).toBe('premium');
   expect(premiumQuery.confirmation_required).toBe(true);
   ```

   - ✅ Free responses provided for navigation and basic questions
   - ✅ Low-cost AI used for knowledge base enhancement
   - ✅ Premium features require explicit user confirmation

2. **Cost Tracking and Analytics**

   ```typescript
   // Test usage analytics
   const usage = await analyticsService.getAIUsage({
     period: 'daily',
     user_id: currentUser.id
   });
   
   expect(usage.free_interactions_percentage).toBeGreaterThan(70);
   expect(usage.premium_interactions_percentage).toBeLessThan(10);
   ```

   - ✅ AI usage tracked and categorized by cost tier
   - ✅ 80% free / 15% low-cost / 5% premium targets met
   - ✅ Cost transparency provided to users

3. **Budget Controls**

   ```typescript
   // Test cost limits and controls
   await sofiaService.setUserBudget({
     daily_premium_limit: 5,
     require_confirmation: true
   });
   
   const budgetStatus = await sofiaService.getBudgetStatus();
   expect(budgetStatus.within_limits).toBe(true);
   ```

   - ✅ User budget controls prevent unexpected costs
   - ✅ Premium feature limits enforced correctly
   - ✅ Budget status visible and actionable

### **Flow 6: Security & Privacy Validation**

**Objective**: Verify zero-knowledge architecture maintains user privacy

#### Security Testing Steps

1. **Client-Side Encryption Flow**

   ```typescript
   // Test end-to-end encryption
   const sensitiveData = "Personal family information";
   const encrypted = await encryptionService.encrypt(sensitiveData);
   
   // Simulate server storage (should be encrypted)
   const stored = await serverService.store(encrypted);
   expect(stored.plaintext_accessible).toBe(false);
   
   // Test decryption only works client-side
   const retrieved = await serverService.retrieve(stored.id);
   const decrypted = await encryptionService.decrypt(retrieved.encrypted_data);
   expect(decrypted).toBe(sensitiveData);
   ```

   - ✅ All sensitive data encrypted before leaving browser
   - ✅ Server cannot access plaintext user data
   - ✅ Decryption only possible with user's private key

2. **Key Management Security**

   ```typescript
   // Test key derivation and storage
   const userPassword = "secure-password";
   const salt = crypto.getRandomValues(new Uint8Array(16));
   
   const derivedKey = await keyManagement.deriveKey(userPassword, salt);
   const storedKey = await keyManagement.storeSecurely(derivedKey);
   
   expect(storedKey.plaintext_stored).toBe(false);
   ```

   - ✅ Keys derived securely from user passwords
   - ✅ Keys stored using browser secure storage APIs
   - ✅ Key rotation functionality works without data loss

3. **Audit Logging Validation**

   ```typescript
   // Test security event logging
   await authService.signIn(credentials);
   await documentService.uploadDocument(file);
   await encryptionService.rotateKeys();
   
   const auditLog = await auditService.getSecurityEvents();
   expect(auditLog).toContainEvents(['sign_in', 'document_upload', 'key_rotation']);
   ```

   - ✅ All security-relevant events properly logged
   - ✅ Audit log helps detect suspicious activity
   - ✅ Privacy maintained (no sensitive data in logs)

## Performance Benchmarks

### **Core Performance Targets**

- **Sofia Knowledge Base Response**: < 500ms
- **Document Upload (10MB)**: < 5 seconds total
- **Dashboard Load**: < 2 seconds to interactive
- **Document Search**: < 300ms for results
- **AI Premium Generation**: < 10 seconds

### **Mobile Performance Validation**

- **Touch Interactions**: < 100ms response time
- **Sofia Mobile Interface**: Full functionality maintained
- **Document Upload on Mobile**: Works with camera and file picker
- **Offline Functionality**: Core features work without network

### **Memory & CPU Usage**

- **Encryption Operations**: < 500ms for typical documents
- **Background Processing**: No blocking of UI interactions  
- **Memory Leaks**: No memory growth over extended sessions
- **Battery Impact**: Minimal drain on mobile devices

### Security Verification Checklist

- Identity: Supabase Auth only (no Clerk)
- Row Level Security (RLS): enable and test on these tables at minimum
  - user_profiles
  - documents
  - document_shares (if applicable)
- Owner-first default policies examples:

```sql
-- Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own documents"
ON documents
FOR SELECT
USING (auth.uid() = user_id);
```

- Token handling:
  - Only hashed single-use tokens with expires_at; store token_hash only; never log raw tokens
  - For server-to-server, use Supabase service role in Edge Functions; never expose to clients

- Observability baseline:
  - Structured logging in Supabase Edge Functions: include requestId, userId, path, status, latency; redact PII
  - Critical alerts via Resend; no Sentry

## Accessibility Compliance Checklist

### **WCAG 2.1 AA Standards**

- [ ] All interactive elements keyboard accessible
- [ ] Screen reader compatibility for Sofia AI conversations
- [ ] Color contrast ratios meet minimum requirements
- [ ] Alt text provided for all meaningful images
- [ ] Focus indicators clearly visible
- [ ] No content flashing more than 3 times per second

### **Sofia AI Accessibility**

- [ ] Sofia conversations readable by screen readers
- [ ] Action buttons have descriptive labels
- [ ] Cost tier information conveyed non-visually
- [ ] Proactive interventions respect user preferences

## Rollback & Recovery Plan

### **Feature Toggle System**

- **Sofia AI**: Can be disabled while maintaining core functionality
- **Document Intelligence**: OCR/AI analysis can be temporarily disabled  
- **Proactive Interventions**: User preference controls available
- **Advanced Features**: Graceful degradation to basic functionality

### **Data Recovery Procedures**

- **Encryption Keys**: Recovery mechanism for lost keys
- **Document Backup**: Automated backup before destructive operations
- **Conversation History**: Recovery from localStorage or server backup
- **User Preferences**: Default fallbacks for corrupted preferences

## Success Criteria Summary

Core features implementation is successful when:

1. **Authentication flows work seamlessly across all devices**
2. **Sofia AI provides value while keeping 80% interactions free**  
3. **Document encryption maintains zero-knowledge architecture**
4. **User onboarding completion rate exceeds 70%**
5. **Performance targets met on low-end mobile devices**
6. **Accessibility compliance verified with actual users**
7. **Security audit confirms no sensitive data exposure**
8. **E2E tests cover all critical user journeys**
