/**
 * End-to-End User Flow Tests
 * Test complete user journeys from authentication to document management
 */

import { authService } from '../../services/auth.service';
import { DocumentService } from '../../services/documentService';
import { OCRService } from '../../lib/ocr';
import { SofiaPersonalityEngine } from '../../sofia/personality';
import { useAnalyticsStore } from '../../stores/useAnalyticsStore';

// Mock external dependencies
jest.mock('../../supabase/client');
jest.mock('../../lib/logger');
jest.mock('tesseract.js');

// Mock browser APIs
global.File = class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;

  constructor(content: any[], filename: string, options: any = {}) {
    this.name = filename;
    this.size = content.reduce((size, chunk) => size + (chunk?.length || 0), 0);
    this.type = options.type || 'application/octet-stream';
    this.lastModified = Date.now();
  }
} as any;

// Mock window APIs for analytics
Object.defineProperty(window, 'location', {
  value: { origin: 'https://app.example.com' },
  writable: true,
});

describe('End-to-End User Flow Tests', () => {
  let mockSupabase: any;
  let mockOCRWorker: any;
  let sofiaEngine: SofiaPersonalityEngine;
  let analyticsStore: ReturnType<typeof useAnalyticsStore.getState>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup comprehensive mocks
    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn(),
        or: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      })),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(),
          getPublicUrl: jest.fn(),
          remove: jest.fn(),
        })),
      },
    };

    mockOCRWorker = {
      recognize: jest.fn(),
      setParameters: jest.fn(),
      terminate: jest.fn(),
    };

    require('../../supabase/client').supabase = mockSupabase;
    require('tesseract.js').default = {
      createWorker: jest.fn().mockResolvedValue(mockOCRWorker),
      PSM: { AUTO: 3 },
    };

    sofiaEngine = new SofiaPersonalityEngine();
    analyticsStore = useAnalyticsStore.getState();

    // Reset analytics store
    useAnalyticsStore.setState({
      events: [],
      sessions: [],
      currentSession: null,
      featureUsage: [],
      userJourneys: [],
      behaviorInsights: [],
      abTests: [],
      userVariants: {},
      isOptedOut: false,
      pendingEvents: [],
    });
  });

  describe('New User Onboarding Flow', () => {
    it('should complete full new user journey: signup → onboarding → first document', async () => {
      // Step 1: User Registration
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'new-user-123',
              email: 'newuser@example.com',
              created_at: new Date().toISOString(),
            },
            access_token: 'new-user-token',
            expires_at: Date.now() / 1000 + 3600,
          },
        },
        error: null,
      });

      const signUpResult = await authService.signUp({
        email: 'newuser@example.com',
        password: 'securepassword123',
        name: 'New User',
      });

      expect(signUpResult.user.email).toBe('newuser@example.com');

      // Track registration event
      analyticsStore.trackEvent({
        type: 'milestone_achieved',
        category: 'auth',
        action: 'user_registration',
        label: 'signup_complete',
        privacyLevel: 'pseudonymous',
        metadata: { registrationMethod: 'email' },
      });

      // Step 2: Sofia Introduction and Onboarding
      const welcomeContext = {
        documentsCount: 0,
        timeInApp: 60000, // 1 minute
        lastActivity: new Date(),
        completedTasks: [],
      };

      const sofiaWelcome = sofiaEngine.generateResponse(
        'new-user-123',
        welcomeContext,
        'welcome'
      );

      expect(sofiaWelcome).toContain('svetluška');
      expect(sofiaWelcome).toContain('Sofia');

      // Track onboarding progress
      analyticsStore.addJourneyStep('/onboarding/welcome', 'sofia_introduction');
      analyticsStore.addJourneyStep('/onboarding/trust-box', 'trust_box_interaction');
      analyticsStore.addJourneyStep('/onboarding/key-graving', 'key_customization');

      // Step 3: First Document Upload
      const firstDocument = new File(['Important ID document'], 'passport.pdf', {
        type: 'application/pdf',
      });

      // Mock successful upload
      mockSupabase.storage.from().upload.mockResolvedValue({
        data: { path: 'new-user-123/documents/passport.pdf' },
        error: null,
      });

      mockSupabase.storage.from().getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://storage.supabase.co/passport.pdf' },
      });

      const uploadResult = await DocumentService.uploadFile(
        firstDocument,
        'new-user-123/documents/passport.pdf'
      );

      expect(uploadResult.path).toBe('new-user-123/documents/passport.pdf');

      // Step 4: OCR Processing
      mockOCRWorker.recognize.mockResolvedValue({
        data: {
          text: 'PASSPORT\nSK123456789\nJOHN DOE\nDate of Birth: 15.03.1990',
          confidence: 88,
          words: [
            { text: 'PASSPORT', confidence: 95, bbox: { x0: 10, y0: 10, x1: 80, y1: 30 } },
            { text: 'SK123456789', confidence: 92, bbox: { x0: 10, y0: 40, x1: 100, y1: 60 } },
          ],
        },
      });

      const ocrService = OCRService.getInstance();
      const ocrResult = await ocrService.extractDocumentData(firstDocument, 'passport');

      expect(ocrResult.text).toContain('PASSPORT');
      expect(ocrResult.extractedFields.passportNumber).toBe('SK123456789');

      // Step 5: Save Document to Database
      const documentRecord = {
        userId: 'new-user-123',
        name: firstDocument.name,
        category: 'personal',
        filePath: uploadResult.path,
        fileSize: firstDocument.size,
        mimeType: firstDocument.type,
        metadata: {
          ocrText: ocrResult.text,
          ocrConfidence: ocrResult.confidence,
          extractedFields: ocrResult.extractedFields,
          documentType: 'passport',
        },
      };

      mockSupabase.from().single.mockResolvedValue({
        data: { id: 'doc-first-123', ...documentRecord },
        error: null,
      });

      const savedDocument = await DocumentService.createDocument(documentRecord);
      expect(savedDocument.id).toBe('doc-first-123');

      // Step 6: Sofia Celebration
      const celebrationContext = {
        documentsCount: 1,
        timeInApp: 300000, // 5 minutes
        lastActivity: new Date(),
        completedTasks: ['first_document'],
      };

      const sofiaCelebration = sofiaEngine.generateResponse(
        'new-user-123',
        celebrationContext,
        'celebration'
      );

      expect(sofiaCelebration).toContain('Skvelé');
      expect(sofiaCelebration).toContain('prvý kameň');

      // Track completion
      analyticsStore.trackMilestone('first_document_uploaded', 1);
      analyticsStore.completeJourney(true);

      // Verify analytics events
      const state = useAnalyticsStore.getState();
      expect(state.events.length).toBeGreaterThan(0);

      const milestoneEvent = state.events.find(
        e => e.type === 'milestone_achieved' && e.label === 'first_document_uploaded'
      );
      expect(milestoneEvent).toBeDefined();
    });

    it('should handle onboarding dropout and recovery', async () => {
      // User starts onboarding
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          session: {
            user: { id: 'dropout-user', email: 'dropout@example.com' },
            access_token: 'token',
            expires_at: Date.now() / 1000 + 3600,
          },
        },
        error: null,
      });

      await authService.signUp({
        email: 'dropout@example.com',
        password: 'password123',
      });

      // Track onboarding start
      analyticsStore.addJourneyStep('/onboarding/welcome', 'start_onboarding');
      analyticsStore.addJourneyStep('/onboarding/trust-box', 'trust_box_view');

      // User drops off at document upload
      analyticsStore.trackDropoff('/documents/upload', 'complexity_concern');

      // Later return - Sofia should provide encouraging guidance
      const returnContext = {
        documentsCount: 0,
        timeInApp: 120000, // 2 minutes on return
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        completedTasks: [],
      };

      const sofiaGuidance = sofiaEngine.generateResponse(
        'dropout-user',
        returnContext,
        'guidance'
      );

      expect(sofiaGuidance).toContain('nemusíte');
      expect(sofiaGuidance).toContain('malý krok');

      // Should show suggestions for nervous users
      const shouldShowSuggestion = sofiaEngine.shouldShowSuggestion(
        'dropout-user',
        returnContext
      );
      expect(shouldShowSuggestion).toBe(false); // Too early for nervous user
    });
  });

  describe('Experienced User Document Management Flow', () => {
    it('should handle experienced user workflow: batch upload → organization → search', async () => {
      // Step 1: Existing User Authentication
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            user: { id: 'experienced-user', email: 'expert@example.com' },
            access_token: 'expert-token',
            expires_at: Date.now() / 1000 + 3600,
          },
        },
        error: null,
      });

      const signInResult = await authService.signIn({
        email: 'expert@example.com',
        password: 'password123',
      });

      expect(signInResult.user.id).toBe('experienced-user');

      // Step 2: Sofia Greeting for Returning User
      const experiencedContext = {
        documentsCount: 15,
        timeInApp: 3600000, // 1 hour
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        completedTasks: ['personal_info', 'assets', 'family_info'],
      };

      const sofiaGreeting = sofiaEngine.generateResponse(
        'experienced-user',
        experiencedContext,
        'welcome'
      );

      expect(sofiaGreeting).toContain('Vitajte späť');

      // Step 3: Batch Document Upload
      const documents = [
        new File(['Financial report content'], 'annual-report-2025.pdf', {
          type: 'application/pdf',
        }),
        new File(['Insurance policy content'], 'insurance-policy.pdf', {
          type: 'application/pdf',
        }),
        new File(['Tax document content'], 'tax-filing-2024.pdf', {
          type: 'application/pdf',
        }),
      ];

      // Mock successful uploads
      mockSupabase.storage
        .from()
        .upload.mockImplementation((path: string) =>
          Promise.resolve({ data: { path }, error: null })
        );

      mockSupabase.storage
        .from()
        .getPublicUrl.mockImplementation((path: string) => ({
          data: { publicUrl: `https://storage.supabase.co/${path}` },
        }));

      // Upload all documents concurrently
      const uploadPromises = documents.map((doc, index) =>
        DocumentService.uploadFile(doc, `experienced-user/documents/${doc.name}`)
      );

      const uploadResults = await Promise.all(uploadPromises);
      expect(uploadResults).toHaveLength(3);

      // Step 4: Process Documents with Category Detection
      mockOCRWorker.recognize.mockImplementation((file: File) => {
        if (file.name.includes('annual-report')) {
          return Promise.resolve({
            data: {
              text: 'ANNUAL FINANCIAL REPORT 2025\nRevenue: €1,250,000\nProfit: €180,000',
              confidence: 92,
              words: [],
            },
          });
        } else if (file.name.includes('insurance')) {
          return Promise.resolve({
            data: {
              text: 'INSURANCE POLICY\nPolicy Number: INS789456123\nCoverage: €500,000',
              confidence: 89,
              words: [],
            },
          });
        } else {
          return Promise.resolve({
            data: {
              text: 'TAX FILING DOCUMENT 2024\nTax ID: 123456789\nRefund: €2,450',
              confidence: 87,
              words: [],
            },
          });
        }
      });

      const ocrService = OCRService.getInstance();
      const processedDocs = await Promise.all(
        documents.map(async (doc, index) => {
          const ocrResult = await ocrService.extractDocumentData(doc, 'general');
          return {
            ...uploadResults[index],
            ocrResult,
            category: doc.name.includes('annual-report')
              ? 'financial'
              : doc.name.includes('insurance')
              ? 'insurance'
              : 'tax',
          };
        })
      );

      expect(processedDocs).toHaveLength(3);

      // Step 5: Save to Database with Categories
      const documentRecords = processedDocs.map((doc, index) => ({
        userId: 'experienced-user',
        name: documents[index].name,
        category: doc.category,
        filePath: doc.path,
        fileSize: documents[index].size,
        mimeType: documents[index].type,
        metadata: {
          ocrText: doc.ocrResult.text,
          ocrConfidence: doc.ocrResult.confidence,
          extractedFields: doc.ocrResult.extractedFields,
          autoClassified: true,
        },
      }));

      mockSupabase.from().single.mockImplementation((record: any) =>
        Promise.resolve({
          data: { id: `doc-${Date.now()}-${Math.random()}`, ...record },
          error: null,
        })
      );

      const savedDocs = await Promise.all(
        documentRecords.map(record => DocumentService.createDocument(record))
      );

      expect(savedDocs).toHaveLength(3);

      // Step 6: Sofia Milestone Detection
      const updatedContext = {
        documentsCount: 18, // 15 + 3 new
        timeInApp: 3900000, // 1 hour 5 minutes
        lastActivity: new Date(),
        completedTasks: ['personal_info', 'assets', 'family_info'],
      };

      const legalMilestone = sofiaEngine.detectLegalMilestone(updatedContext);
      expect(legalMilestone).toBeTruthy();
      expect(legalMilestone!.type).toBe('will_ready');

      const sofiaSuggestion = sofiaEngine.generateResponse(
        'experienced-user',
        updatedContext,
        'suggestion'
      );

      expect(sofiaSuggestion).toContain('závet');

      // Step 7: Advanced Search and Organization
      const mockSearchResults = [
        {
          id: 'doc-financial-1',
          name: 'annual-report-2025.pdf',
          category: 'financial',
          metadata: { ocrText: 'ANNUAL FINANCIAL REPORT 2025' },
        },
        {
          id: 'doc-financial-2',
          name: 'quarterly-statement.pdf',
          category: 'financial',
          metadata: { ocrText: 'Q4 2024 Financial Statement' },
        },
      ];

      mockSupabase.from().order.mockResolvedValue({
        data: mockSearchResults,
        error: null,
      });

      const searchResults = await DocumentService.searchDocuments(
        'experienced-user',
        'financial'
      );

      expect(searchResults).toHaveLength(2);

      // Track advanced features usage
      analyticsStore.trackFeatureUsage('batch_upload', 'documents', 180000);
      analyticsStore.trackFeatureUsage('advanced_search', 'search', 5000);
      analyticsStore.trackFeatureUsage('auto_categorization', 'ai', 30000);

      // Verify feature adoption
      const state = useAnalyticsStore.getState();
      expect(state.events.filter(e => e.type === 'feature_used')).toHaveLength(3);
    });

    it('should handle will generation workflow for ready users', async () => {
      // User with sufficient data for will generation
      await authService.signIn({
        email: 'ready@example.com',
        password: 'password123',
      });

      const readyContext = {
        documentsCount: 25,
        timeInApp: 7200000, // 2 hours
        lastActivity: new Date(),
        completedTasks: ['personal_info', 'assets', 'family_info', 'insurance'],
      };

      // Sofia detects will readiness
      const legalMilestone = sofiaEngine.detectLegalMilestone(readyContext);
      expect(legalMilestone).toBeTruthy();
      expect(legalMilestone!.readinessScore).toBe(0.8);
      expect(legalMilestone!.missingElements).toHaveLength(0);

      // Sofia suggests will creation
      const willSuggestion = sofiaEngine.generateResponse(
        'ready-user',
        readyContext,
        'legal_milestone'
      );

      expect(willSuggestion).toContain('závet');
      expect(willSuggestion).toContain('informácií');

      // Track will generation interest
      analyticsStore.trackEvent({
        type: 'feature_used',
        category: 'legal',
        action: 'will_generator_accessed',
        label: 'sofia_suggestion',
        privacyLevel: 'pseudonymous',
        metadata: { readinessScore: 0.8 },
      });

      // Mock will template generation (would integrate with legal template system)
      const willData = {
        userId: 'ready-user',
        documentType: 'will',
        templateVersion: '1.0',
        jurisdiction: 'SK',
        generatedAt: new Date().toISOString(),
        dataCompleteness: 0.8,
        reviewRequired: false,
      };

      mockSupabase.from().single.mockResolvedValue({
        data: { id: 'will-123', ...willData },
        error: null,
      });

      // Simulate will document creation
      const willDocument = await DocumentService.createDocument({
        userId: 'ready-user',
        name: 'Generated Will - Draft v1.0',
        category: 'legal',
        metadata: willData,
      });

      expect(willDocument.id).toBe('will-123');

      // Sofia celebrates legal milestone
      const celebration = sofiaEngine.generateResponse(
        'ready-user',
        { ...readyContext, documentsCount: 26 },
        'celebration'
      );

      expect(celebration).toContain('pokrok');

      analyticsStore.trackMilestone('will_generated', 1, {
        method: 'ai_assisted',
        completeness: 0.8,
      });
    });
  });

  describe('Error Recovery and User Support Flows', () => {
    it('should handle upload failures with helpful guidance', async () => {
      await authService.signIn({
        email: 'user@example.com',
        password: 'password123',
      });

      const problematicFile = new File(['corrupted data'], 'corrupted.pdf', {
        type: 'application/pdf',
      });

      // Simulate upload failure
      mockSupabase.storage.from().upload.mockResolvedValue({
        data: null,
        error: { message: 'File too large', code: 'FILE_SIZE_LIMIT' },
      });

      await expect(
        DocumentService.uploadFile(problematicFile, 'user/documents/corrupted.pdf')
      ).rejects.toEqual({
        message: 'File too large',
        code: 'FILE_SIZE_LIMIT',
      });

      // Sofia provides helpful guidance
      const errorContext = {
        documentsCount: 5,
        timeInApp: 300000,
        lastActivity: new Date(),
        completedTasks: ['personal_info'],
        currentTask: 'document_upload',
      };

      const sofiaGuidance = sofiaEngine.generateResponse(
        'user-123',
        errorContext,
        'guidance'
      );

      // Track error for analytics
      analyticsStore.trackEvent({
        type: 'click',
        category: 'error',
        action: 'upload_failed',
        label: 'file_size_limit',
        privacyLevel: 'anonymous',
        metadata: { errorCode: 'FILE_SIZE_LIMIT' },
      });

      expect(sofiaGuidance).toBeDefined();
    });

    it('should handle OCR processing failures gracefully', async () => {
      await authService.signIn({
        email: 'user@example.com',
        password: 'password123',
      });

      const blurryImage = new File(['blurry image data'], 'blurry-scan.jpg', {
        type: 'image/jpeg',
      });

      // Upload succeeds
      mockSupabase.storage.from().upload.mockResolvedValue({
        data: { path: 'user/documents/blurry-scan.jpg' },
        error: null,
      });

      mockSupabase.storage.from().getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://storage.supabase.co/blurry-scan.jpg' },
      });

      const uploadResult = await DocumentService.uploadFile(
        blurryImage,
        'user/documents/blurry-scan.jpg'
      );

      // OCR fails
      mockOCRWorker.recognize.mockRejectedValue(new Error('Image too blurry'));

      const ocrService = OCRService.getInstance();

      await expect(ocrService.extractText(blurryImage)).rejects.toThrow(
        'OCR processing failed'
      );

      // Save document without OCR data
      const partialDocument = {
        userId: 'user-123',
        name: blurryImage.name,
        category: 'general',
        filePath: uploadResult.path,
        fileSize: blurryImage.size,
        mimeType: blurryImage.type,
        metadata: {
          ocrStatus: 'failed',
          ocrError: 'Image too blurry',
          manualReviewRequired: true,
        },
      };

      mockSupabase.from().single.mockResolvedValue({
        data: { id: 'doc-partial', ...partialDocument },
        error: null,
      });

      const savedDocument = await DocumentService.createDocument(partialDocument);
      expect(savedDocument.metadata.ocrStatus).toBe('failed');

      // Track OCR failure
      analyticsStore.trackEvent({
        type: 'feature_used',
        category: 'ocr',
        action: 'processing_failed',
        label: 'image_quality',
        privacyLevel: 'anonymous',
        metadata: { errorType: 'blurry_image' },
      });
    });
  });

  describe('Analytics and User Journey Tracking', () => {
    it('should track complete user journey with meaningful insights', async () => {
      // Reset analytics for clean test
      analyticsStore.clearOldData(0); // Clear all data

      // Start session
      analyticsStore.startSession('desktop', 'direct');

      // Sign in
      await authService.signIn({
        email: 'analytics@example.com',
        password: 'password123',
      });

      analyticsStore.trackEvent({
        type: 'milestone_achieved',
        category: 'auth',
        action: 'sign_in',
        label: 'success',
        privacyLevel: 'pseudonymous',
      });

      // Journey through app
      const journeySteps = [
        { page: '/dashboard', action: 'view_dashboard' },
        { page: '/documents/upload', action: 'start_upload' },
        { page: '/documents/processing', action: 'ocr_processing' },
        { page: '/documents/library', action: 'view_library' },
        { page: '/will/generator', action: 'explore_will' },
        { page: '/settings', action: 'adjust_preferences' },
      ];

      journeySteps.forEach(step => {
        analyticsStore.addJourneyStep(step.page, step.action);
        analyticsStore.trackPageView(step.page);
      });

      // Upload and process document
      const testFile = new File(['content'], 'analytics-test.pdf', {
        type: 'application/pdf',
      });

      mockSupabase.storage.from().upload.mockResolvedValue({
        data: { path: 'user/documents/analytics-test.pdf' },
        error: null,
      });

      await DocumentService.uploadFile(testFile, 'user/documents/analytics-test.pdf');

      analyticsStore.trackDocumentUpload('pdf', 1024, { category: 'test' });

      // Feature usage
      analyticsStore.trackFeatureUsage('document_upload', 'documents', 30000);
      analyticsStore.trackFeatureUsage('ocr_processing', 'ai', 15000);
      analyticsStore.trackFeatureUsage('search', 'navigation', 5000);

      // Sofia interactions
      analyticsStore.trackSofiaInteraction('suggestion_click', 4.5, {
        suggestionType: 'document_category',
      });

      analyticsStore.trackSofiaInteraction('celebration_view', 5.0, {
        milestone: 'first_document',
      });

      // Complete journey
      analyticsStore.completeJourney(true);
      analyticsStore.endSession();

      // Generate insights
      analyticsStore.generateInsights();

      // Verify comprehensive tracking
      const finalState = useAnalyticsStore.getState();

      expect(finalState.events.length).toBeGreaterThan(10);
      expect(finalState.sessions.length).toBeGreaterThan(0);
      expect(finalState.userJourneys.length).toBeGreaterThan(0);
      expect(finalState.featureUsage.length).toBeGreaterThan(0);

      // Check specific metrics
      const uploadEvents = finalState.events.filter(
        e => e.type === 'document_upload'
      );
      expect(uploadEvents.length).toBeGreaterThan(0);

      const sofiaEvents = finalState.events.filter(
        e => e.type === 'sofia_interaction'
      );
      expect(sofiaEvents.length).toBeGreaterThan(0);

      const pageViews = finalState.events.filter(e => e.type === 'page_view');
      expect(pageViews.length).toBeGreaterThan(5);

      // Verify feature adoption tracking
      const documentUploadUsage = finalState.featureUsage.find(
        f => f.feature === 'document_upload'
      );
      expect(documentUploadUsage).toBeDefined();
      expect(documentUploadUsage!.usageCount).toBeGreaterThan(0);
    });

    it('should provide actionable insights based on user behavior', async () => {
      // Simulate user with multiple incomplete journeys
      for (let i = 0; i < 15; i++) {
        analyticsStore.addJourneyStep('/documents/upload', 'start_upload');
        analyticsStore.addJourneyStep('/documents/processing', 'processing_start');
        // Don't complete - simulate dropoff
        analyticsStore.trackDropoff('/documents/processing', 'complexity');
      }

      // Generate insights
      analyticsStore.generateInsights();

      const state = useAnalyticsStore.getState();
      const dropoffInsight = state.behaviorInsights.find(
        insight => insight.type === 'opportunity' && insight.title.includes('prerušenia')
      );

      expect(dropoffInsight).toBeDefined();
      expect(dropoffInsight!.impact).toBe('high');
      expect(dropoffInsight!.recommendations).toContain(
        'Zjednodušiť proces onboardingu'
      );

      // Simulate low feature adoption
      analyticsStore.updateFeatureUsage('advanced_search', 'search');
      analyticsStore.updateFeatureUsage('will_generator', 'legal');
      analyticsStore.calculateAdoptionRates();

      analyticsStore.generateInsights();

      const adoptionInsight = state.behaviorInsights.find(
        insight => insight.title.includes('adopcia funkcií')
      );

      expect(adoptionInsight).toBeDefined();
      expect(adoptionInsight!.recommendations).toContain(
        'Zlepšiť objaviteľnosť funkcií'
      );
    });
  });

  describe('Performance and Scale Testing', () => {
    it('should handle high-volume user activity efficiently', async () => {
      await authService.signIn({
        email: 'power-user@example.com',
        password: 'password123',
      });

      const startTime = Date.now();

      // Simulate intensive user session
      for (let i = 0; i < 100; i++) {
        analyticsStore.trackPageView(`/page-${i}`);
        analyticsStore.trackClick(`button-${i}`, 'navigation');
        analyticsStore.trackFeatureUsage(`feature-${i % 10}`, 'category', 1000);
      }

      // Batch document operations
      const mockDocs = Array.from({ length: 50 }, (_, i) => ({
        id: `doc-${i}`,
        name: `Document ${i}`,
        category: 'general',
        userId: 'power-user',
      }));

      mockSupabase.from().order.mockResolvedValue({
        data: mockDocs,
        error: null,
      });

      const documents = await DocumentService.getDocuments('power-user');
      expect(documents).toHaveLength(50);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle high volume efficiently
      expect(duration).toBeLessThan(1000); // Less than 1 second

      // Verify state management efficiency
      const state = useAnalyticsStore.getState();
      expect(state.events.length).toBe(200); // 100 page views + 100 clicks
      expect(state.featureUsage.length).toBe(10); // 10 unique features
    });

    it('should maintain performance with large datasets', async () => {
      // Simulate large user dataset
      const largeDocumentSet = Array.from({ length: 10000 }, (_, i) => ({
        id: `bulk-doc-${i}`,
        name: `Bulk Document ${i}`,
        category: i % 5 === 0 ? 'financial' : 'general',
        userId: 'bulk-user',
        metadata: {
          ocrText: `Document content ${i}`.repeat(100), // Large text
          tags: [`tag-${i % 20}`, `category-${i % 10}`, `year-${2020 + (i % 5)}`],
        },
      }));

      mockSupabase.from().order.mockResolvedValue({
        data: largeDocumentSet,
        error: null,
      });

      const startTime = Date.now();
      const bulkDocuments = await DocumentService.getDocuments('bulk-user');
      const endTime = Date.now();

      expect(bulkDocuments).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast with mocks

      // Test search performance with large dataset
      const searchStartTime = Date.now();
      mockSupabase.from().order.mockResolvedValue({
        data: largeDocumentSet.filter(doc => doc.category === 'financial'),
        error: null,
      });

      const searchResults = await DocumentService.searchDocuments(
        'bulk-user',
        'financial'
      );
      const searchEndTime = Date.now();

      expect(searchResults.length).toBeGreaterThan(1000);
      expect(searchEndTime - searchStartTime).toBeLessThan(50);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should work consistently across different environments', async () => {
      // Test server-side environment (no window)
      const originalWindow = global.window;
      delete (global as any).window;

      await authService.signIn({
        email: 'server@example.com',
        password: 'password123',
      });

      const testFile = new File(['server content'], 'server-test.pdf', {
        type: 'application/pdf',
      });

      mockSupabase.storage.from().upload.mockResolvedValue({
        data: { path: 'server/documents/server-test.pdf' },
        error: null,
      });

      const uploadResult = await DocumentService.uploadFile(
        testFile,
        'server/documents/server-test.pdf'
      );

      expect(uploadResult.path).toBeDefined();

      // Restore window
      global.window = originalWindow;

      // Test client-side environment
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });

      // Should work in both environments
      const clientUpload = await DocumentService.uploadFile(
        testFile,
        'client/documents/client-test.pdf'
      );

      expect(clientUpload.path).toBeDefined();
    });

    it('should handle mobile-specific scenarios', async () => {
      // Simulate mobile environment
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        writable: true,
      });

      await authService.signIn({
        email: 'mobile@example.com',
        password: 'password123',
      });

      // Start mobile session
      analyticsStore.startSession('mobile', 'safari');

      // Simulate mobile-specific interactions
      analyticsStore.trackEvent({
        type: 'click',
        category: 'mobile',
        action: 'camera_capture',
        label: 'document_scan',
        privacyLevel: 'anonymous',
        metadata: { inputMethod: 'camera' },
      });

      // Mobile file upload (typically from camera)
      const mobileImage = new File(['camera capture'], 'photo.jpg', {
        type: 'image/jpeg',
      });

      mockSupabase.storage.from().upload.mockResolvedValue({
        data: { path: 'mobile/documents/photo.jpg' },
        error: null,
      });

      const mobileUpload = await DocumentService.uploadFile(
        mobileImage,
        'mobile/documents/photo.jpg'
      );

      expect(mobileUpload.path).toBe('mobile/documents/photo.jpg');

      // Track mobile-specific journey
      analyticsStore.addJourneyStep('/mobile/camera', 'open_camera');
      analyticsStore.addJourneyStep('/mobile/preview', 'preview_image');
      analyticsStore.addJourneyStep('/mobile/upload', 'confirm_upload');

      analyticsStore.completeJourney(true);

      const state = useAnalyticsStore.getState();
      const mobileSession = state.currentSession;

      expect(mobileSession?.deviceType).toBe('mobile');
    });
  });
});