import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { GDPRComplianceValidator } from '../../utils/security/gdprValidator'
import { DataHandlingValidator } from '../../utils/security/dataHandlingValidator'
import { PrivacyPolicyValidator } from '../../utils/security/privacyPolicyValidator'
import { CookieConsentManager } from '../../utils/security/cookieConsentManager'
import { DataDeletionValidator } from '../../utils/security/dataDeletionValidator'

const mockGDPRConfig = {
  dataController: {
    name: 'Schwalbe Technologies s.r.o.',
    address: 'Bratislava, Slovakia',
    email: 'privacy@schwalbe.app',
    dpo: 'dpo@schwalbe.app'
  },
  legalBasis: {
    processing: 'consent',
    storage: 'legitimate_interest',
    analytics: 'consent'
  },
  retentionPeriods: {
    documents: 365 * 5, // 5 years
    analytics: 365 * 2, // 2 years
    logs: 30, // 30 days
    sessions: 1 // 1 day
  }
}

describe('GDPR Compliance Testing Suite', () => {
  let gdprValidator: GDPRComplianceValidator
  let dataHandlingValidator: DataHandlingValidator
  let privacyPolicyValidator: PrivacyPolicyValidator
  let cookieConsentManager: CookieConsentManager
  let dataDeletionValidator: DataDeletionValidator

  beforeEach(() => {
    gdprValidator = new GDPRComplianceValidator(mockGDPRConfig)
    dataHandlingValidator = new DataHandlingValidator(mockGDPRConfig)
    privacyPolicyValidator = new PrivacyPolicyValidator(mockGDPRConfig)
    cookieConsentManager = new CookieConsentManager(mockGDPRConfig)
    dataDeletionValidator = new DataDeletionValidator(mockGDPRConfig)

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
  })

  describe('GDPR Compliance Audit', () => {
    it('should validate data processing legal basis', async () => {
      const processingActivities = [
        {
          type: 'document_storage',
          personalData: ['name', 'email', 'document_content'],
          purpose: 'legacy_management',
          legalBasis: 'consent'
        },
        {
          type: 'user_analytics',
          personalData: ['usage_patterns', 'feature_interactions'],
          purpose: 'service_improvement',
          legalBasis: 'legitimate_interest'
        },
        {
          type: 'marketing_communication',
          personalData: ['email', 'preferences'],
          purpose: 'promotional_content',
          legalBasis: 'consent'
        }
      ]

      for (const activity of processingActivities) {
        const validation = await gdprValidator.validateProcessingActivity(activity)

        expect(validation.isCompliant).toBe(true)
        expect(validation.legalBasisValid).toBe(true)
        expect(validation.purposeLimitation).toBe(true)
        expect(validation.dataMinimization).toBe(true)
      }
    })

    it('should validate data subject rights implementation', async () => {
      const testUserId = 'test-user-123'
      const dataSubjectRights = [
        'right_to_access',
        'right_to_rectification',
        'right_to_erasure',
        'right_to_restrict_processing',
        'right_to_data_portability',
        'right_to_object',
        'right_to_withdraw_consent'
      ]

      for (const right of dataSubjectRights) {
        const implementation = await gdprValidator.validateDataSubjectRight(testUserId, right)

        expect(implementation.rightImplemented).toBe(true)
        expect(implementation.responseTime).toBeLessThanOrEqual(30) // Max 30 days
        expect(implementation.freeOfCharge).toBe(true)
        expect(implementation.verificationProcess).toBe(true)
      }
    })

    it('should validate consent management', async () => {
      const consentScenarios = [
        {
          type: 'document_processing',
          granular: true,
          withdrawable: true,
          informedConsent: true
        },
        {
          type: 'analytics_tracking',
          granular: true,
          withdrawable: true,
          informedConsent: true
        },
        {
          type: 'marketing_emails',
          granular: true,
          withdrawable: true,
          informedConsent: true
        }
      ]

      for (const scenario of consentScenarios) {
        const consentValidation = await gdprValidator.validateConsentMechanism(scenario)

        expect(consentValidation.isGDPRCompliant).toBe(true)
        expect(consentValidation.isGranular).toBe(scenario.granular)
        expect(consentValidation.isWithdrawable).toBe(scenario.withdrawable)
        expect(consentValidation.isInformed).toBe(scenario.informedConsent)
        expect(consentValidation.consentRecorded).toBe(true)
      }
    })

    it('should validate data retention compliance', async () => {
      const dataTypes = [
        { type: 'user_documents', retentionPeriod: 365 * 5 },
        { type: 'user_analytics', retentionPeriod: 365 * 2 },
        { type: 'system_logs', retentionPeriod: 30 },
        { type: 'session_data', retentionPeriod: 1 }
      ]

      for (const dataType of dataTypes) {
        const retentionValidation = await gdprValidator.validateDataRetention(dataType.type)

        expect(retentionValidation.hasRetentionPolicy).toBe(true)
        expect(retentionValidation.retentionPeriod).toBe(dataType.retentionPeriod)
        expect(retentionValidation.automaticDeletion).toBe(true)
        expect(retentionValidation.justificationDocumented).toBe(true)
      }
    })

    it('should validate data protection by design and default', async () => {
      const systemFeatures = [
        'user_registration',
        'document_upload',
        'data_sharing',
        'analytics_collection'
      ]

      for (const feature of systemFeatures) {
        const designValidation = await gdprValidator.validateDataProtectionByDesign(feature)

        expect(designValidation.privacyByDesign).toBe(true)
        expect(designValidation.privacyByDefault).toBe(true)
        expect(designValidation.dataMinimization).toBe(true)
        expect(designValidation.pseudonymization).toBe(true)
        expect(designValidation.encryption).toBe(true)
      }
    })

    it('should validate cross-border data transfer compliance', async () => {
      const transferScenarios = [
        {
          destination: 'EU',
          mechanism: 'adequacy_decision',
          expectedCompliant: true
        },
        {
          destination: 'US',
          mechanism: 'standard_contractual_clauses',
          expectedCompliant: true
        },
        {
          destination: 'third_country',
          mechanism: 'binding_corporate_rules',
          expectedCompliant: true
        }
      ]

      for (const scenario of transferScenarios) {
        const transferValidation = await gdprValidator.validateDataTransfer(scenario)

        expect(transferValidation.isCompliant).toBe(scenario.expectedCompliant)
        expect(transferValidation.hasLegalBasis).toBe(true)
        expect(transferValidation.adequateProtection).toBe(true)
        expect(transferValidation.subjectNotified).toBe(true)
      }
    })
  })

  describe('Data Handling Procedure Validation', () => {
    it('should validate personal data identification and classification', async () => {
      const dataElements = [
        { field: 'email', classification: 'personal_identifier', sensitive: false },
        { field: 'full_name', classification: 'personal_identifier', sensitive: false },
        { field: 'document_content', classification: 'personal_data', sensitive: true },
        { field: 'health_records', classification: 'special_category', sensitive: true },
        { field: 'ip_address', classification: 'personal_identifier', sensitive: false }
      ]

      for (const element of dataElements) {
        const classification = await dataHandlingValidator.classifyPersonalData(element.field)

        expect(classification.isPersonalData).toBe(true)
        expect(classification.classification).toBe(element.classification)
        expect(classification.isSensitive).toBe(element.sensitive)
        expect(classification.handlingProcedures).toBeDefined()
      }
    })

    it('should validate data collection procedures', async () => {
      const collectionScenarios = [
        {
          method: 'user_registration',
          dataCollected: ['email', 'name', 'password'],
          purpose: 'account_creation'
        },
        {
          method: 'document_upload',
          dataCollected: ['document_content', 'metadata'],
          purpose: 'legacy_management'
        },
        {
          method: 'analytics_tracking',
          dataCollected: ['usage_patterns', 'performance_metrics'],
          purpose: 'service_improvement'
        }
      ]

      for (const scenario of collectionScenarios) {
        const collectionValidation = await dataHandlingValidator.validateDataCollection(scenario)

        expect(collectionValidation.purposeSpecified).toBe(true)
        expect(collectionValidation.necessityJustified).toBe(true)
        expect(collectionValidation.consentObtained).toBe(true)
        expect(collectionValidation.transparentNotice).toBe(true)
      }
    })

    it('should validate data processing procedures', async () => {
      const processingOperations = [
        {
          operation: 'document_ocr',
          personalData: ['document_content'],
          purpose: 'text_extraction',
          automated: true
        },
        {
          operation: 'user_profiling',
          personalData: ['usage_patterns', 'preferences'],
          purpose: 'personalization',
          automated: true
        },
        {
          operation: 'data_backup',
          personalData: ['all_user_data'],
          purpose: 'business_continuity',
          automated: true
        }
      ]

      for (const operation of processingOperations) {
        const processingValidation = await dataHandlingValidator.validateDataProcessing(operation)

        expect(processingValidation.legalBasisValid).toBe(true)
        expect(processingValidation.purposeLimitation).toBe(true)
        expect(processingValidation.dataMinimization).toBe(true)
        expect(processingValidation.accuracyMaintained).toBe(true)
        expect(processingValidation.securityMeasures).toBe(true)
      }
    })

    it('should validate data sharing procedures', async () => {
      const sharingScenarios = [
        {
          recipient: 'family_member',
          dataShared: ['document_access'],
          purpose: 'emergency_access',
          userConsent: true
        },
        {
          recipient: 'service_provider',
          dataShared: ['encrypted_documents'],
          purpose: 'backup_storage',
          userConsent: true
        },
        {
          recipient: 'analytics_service',
          dataShared: ['anonymized_usage'],
          purpose: 'performance_analysis',
          userConsent: true
        }
      ]

      for (const scenario of sharingScenarios) {
        const sharingValidation = await dataHandlingValidator.validateDataSharing(scenario)

        expect(sharingValidation.consentObtained).toBe(scenario.userConsent)
        expect(sharingValidation.purposeCompatible).toBe(true)
        expect(sharingValidation.recipientNotified).toBe(true)
        expect(sharingValidation.dataMinimized).toBe(true)
        expect(sharingValidation.contractualSafeguards).toBe(true)
      }
    })

    it('should validate data breach procedures', async () => {
      const breachScenario = {
        type: 'unauthorized_access',
        dataAffected: ['user_documents', 'personal_profiles'],
        riskLevel: 'high',
        affectedSubjects: 1000
      }

      const breachValidation = await dataHandlingValidator.validateBreachProcedures(breachScenario)

      expect(breachValidation.detectionMechanism).toBe(true)
      expect(breachValidation.assessmentProcedure).toBe(true)
      expect(breachValidation.supervisoryAuthorityNotification).toBe(true)
      expect(breachValidation.dataSubjectNotification).toBe(true)
      expect(breachValidation.documentationProcedure).toBe(true)
      expect(breachValidation.responseTime).toBeLessThanOrEqual(72) // 72 hours max
    })
  })

  describe('Privacy Policy Alignment Tests', () => {
    it('should validate privacy policy completeness', async () => {
      const requiredSections = [
        'data_controller_identity',
        'data_processing_purposes',
        'legal_basis_for_processing',
        'data_categories',
        'data_recipients',
        'data_retention_periods',
        'data_subject_rights',
        'contact_information',
        'complaint_procedures'
      ]

      const policyValidation = await privacyPolicyValidator.validatePolicyCompleteness()

      for (const section of requiredSections) {
        expect(policyValidation.sections[section]).toBe(true)
        expect(policyValidation.missingSections).not.toContain(section)
      }

      expect(policyValidation.isComplete).toBe(true)
      expect(policyValidation.lastUpdated).toBeDefined()
    })

    it('should validate privacy policy accuracy', async () => {
      const actualPractices = {
        dataCollection: ['email', 'name', 'documents', 'usage_analytics'],
        processingPurposes: ['legacy_management', 'service_improvement', 'communication'],
        dataRetention: { documents: 1825, analytics: 730 }, // days
        thirdPartySharing: ['cloud_storage', 'analytics_provider'],
        dataTransfers: ['EU', 'US']
      }

      const accuracyValidation = await privacyPolicyValidator.validatePolicyAccuracy(actualPractices)

      expect(accuracyValidation.dataCollectionAccurate).toBe(true)
      expect(accuracyValidation.purposesAccurate).toBe(true)
      expect(accuracyValidation.retentionAccurate).toBe(true)
      expect(accuracyValidation.sharingAccurate).toBe(true)
      expect(accuracyValidation.transfersAccurate).toBe(true)
      expect(accuracyValidation.discrepancies).toHaveLength(0)
    })

    it('should validate privacy policy accessibility', async () => {
      const accessibilityValidation = await privacyPolicyValidator.validatePolicyAccessibility()

      expect(accessibilityValidation.easilyAccessible).toBe(true)
      expect(accessibilityValidation.plainLanguage).toBe(true)
      expect(accessibilityValidation.multilingual).toBe(true) // Slovak/Czech support
      expect(accessibilityValidation.searchable).toBe(true)
      expect(accessibilityValidation.mobileOptimized).toBe(true)
      expect(accessibilityValidation.wcagCompliant).toBe(true)
    })

    it('should validate privacy policy update procedures', async () => {
      const updateScenario = {
        changeType: 'new_data_processing',
        significance: 'material_change',
        affectedRights: ['data_portability'],
        consentRequired: true
      }

      const updateValidation = await privacyPolicyValidator.validateUpdateProcedures(updateScenario)

      expect(updateValidation.userNotificationRequired).toBe(true)
      expect(updateValidation.consentRecollectionRequired).toBe(updateScenario.consentRequired)
      expect(updateValidation.notificationMethod).toContain('email')
      expect(updateValidation.advanceNotice).toBeGreaterThanOrEqual(30) // 30 days
      expect(updateValidation.versioningImplemented).toBe(true)
    })
  })

  describe('Cookie Consent Implementation', () => {
    it('should validate cookie consent banner', async () => {
      const bannerValidation = await cookieConsentManager.validateConsentBanner()

      expect(bannerValidation.isVisible).toBe(true)
      expect(bannerValidation.hasRejectOption).toBe(true)
      expect(bannerValidation.hasAcceptOption).toBe(true)
      expect(bannerValidation.hasManageOption).toBe(true)
      expect(bannerValidation.clearInformation).toBe(true)
      expect(bannerValidation.nonIntrusive).toBe(true)
    })

    it('should validate cookie categorization', async () => {
      const cookieCategories = [
        {
          category: 'essential',
          required: true,
          userChoice: false,
          cookies: ['session_id', 'csrf_token', 'auth_token']
        },
        {
          category: 'functional',
          required: false,
          userChoice: true,
          cookies: ['language_preference', 'theme_setting']
        },
        {
          category: 'analytics',
          required: false,
          userChoice: true,
          cookies: ['ga_tracking', 'usage_analytics']
        },
        {
          category: 'marketing',
          required: false,
          userChoice: true,
          cookies: ['ad_personalization', 'conversion_tracking']
        }
      ]

      for (const category of cookieCategories) {
        const categorization = await cookieConsentManager.validateCookieCategory(category.category)

        expect(categorization.isRequired).toBe(category.required)
        expect(categorization.requiresConsent).toBe(category.userChoice)
        expect(categorization.cookiesListed).toBe(true)
        expect(categorization.purposeDescribed).toBe(true)
      }
    })

    it('should validate consent recording and management', async () => {
      const consentScenarios = [
        { essential: true, functional: true, analytics: false, marketing: false },
        { essential: true, functional: false, analytics: true, marketing: false },
        { essential: true, functional: true, analytics: true, marketing: true }
      ]

      for (const scenario of consentScenarios) {
        const consentResult = await cookieConsentManager.recordConsent(scenario)

        expect(consentResult.consentRecorded).toBe(true)
        expect(consentResult.timestamp).toBeDefined()
        expect(consentResult.consentId).toBeDefined()
        expect(consentResult.granularConsent).toEqual(scenario)

        // Validate consent retrieval
        const storedConsent = await cookieConsentManager.getStoredConsent(consentResult.consentId)
        expect(storedConsent.choices).toEqual(scenario)
      }
    })

    it('should validate consent withdrawal', async () => {
      // First, record consent
      const initialConsent = { essential: true, functional: true, analytics: true, marketing: true }
      const consentResult = await cookieConsentManager.recordConsent(initialConsent)

      // Then withdraw specific consents
      const withdrawalScenarios = [
        { analytics: false },
        { marketing: false },
        { functional: false }
      ]

      for (const withdrawal of withdrawalScenarios) {
        const withdrawalResult = await cookieConsentManager.withdrawConsent(
          consentResult.consentId,
          withdrawal
        )

        expect(withdrawalResult.withdrawalProcessed).toBe(true)
        expect(withdrawalResult.cookiesRemoved).toBe(true)
        expect(withdrawalResult.dataProcessingStopped).toBe(true)
      }
    })

    it('should validate cookie scanning and inventory', async () => {
      const cookieInventory = await cookieConsentManager.scanCookies()

      expect(cookieInventory.allCookiesIdentified).toBe(true)
      expect(cookieInventory.thirdPartyCookiesDetected).toBe(true)
      expect(cookieInventory.categorizedCorrectly).toBe(true)
      expect(cookieInventory.undeclaredCookies).toHaveLength(0)

      // Validate each detected cookie has proper documentation
      for (const cookie of cookieInventory.cookies) {
        expect(cookie.name).toBeDefined()
        expect(cookie.purpose).toBeDefined()
        expect(cookie.category).toBeDefined()
        expect(cookie.duration).toBeDefined()
        expect(cookie.isThirdParty).toBeDefined()
      }
    })
  })

  describe('Right to Deletion Testing', () => {
    it('should validate complete data deletion', async () => {
      const testUserId = 'deletion-test-user'
      const userData = {
        profile: { name: 'Test User', email: 'test@example.com' },
        documents: ['doc1', 'doc2', 'doc3'],
        analytics: { sessions: 50, interactions: 1000 },
        preferences: { theme: 'dark', language: 'sk' }
      }

      // Create test data
      await dataDeletionValidator.createTestUserData(testUserId, userData)

      // Execute deletion
      const deletionResult = await dataDeletionValidator.executeCompleteDataDeletion(testUserId)

      expect(deletionResult.deletionInitiated).toBe(true)
      expect(deletionResult.estimatedCompletionTime).toBeLessThanOrEqual(30) // 30 days max

      // Verify deletion
      const verificationResult = await dataDeletionValidator.verifyDataDeletion(testUserId)

      expect(verificationResult.profileDeleted).toBe(true)
      expect(verificationResult.documentsDeleted).toBe(true)
      expect(verificationResult.analyticsDeleted).toBe(true)
      expect(verificationResult.preferencesDeleted).toBe(true)
      expect(verificationResult.backupsDeleted).toBe(true)
      expect(verificationResult.thirdPartyNotified).toBe(true)
    })

    it('should validate selective data deletion', async () => {
      const testUserId = 'selective-deletion-user'
      const deletionRequests = [
        { dataType: 'analytics', reason: 'no_longer_needed' },
        { dataType: 'marketing_data', reason: 'consent_withdrawn' },
        { dataType: 'specific_documents', documentIds: ['doc1', 'doc3'], reason: 'user_request' }
      ]

      for (const request of deletionRequests) {
        const selectiveDeletion = await dataDeletionValidator.executeSelectiveDataDeletion(
          testUserId,
          request
        )

        expect(selectiveDeletion.deletionExecuted).toBe(true)
        expect(selectiveDeletion.dataTypeDeleted).toBe(request.dataType)
        expect(selectiveDeletion.relatedDataPreserved).toBe(true)
        expect(selectiveDeletion.auditTrailCreated).toBe(true)
      }
    })

    it('should validate data deletion exceptions', async () => {
      const testUserId = 'exception-test-user'
      const exceptionScenarios = [
        {
          dataType: 'legal_documents',
          exception: 'legal_obligation',
          retentionRequired: true
        },
        {
          dataType: 'financial_records',
          exception: 'accounting_requirements',
          retentionRequired: true
        },
        {
          dataType: 'fraud_prevention_data',
          exception: 'legitimate_interest',
          retentionRequired: true
        }
      ]

      for (const scenario of exceptionScenarios) {
        const exceptionValidation = await dataDeletionValidator.validateDeletionException(
          testUserId,
          scenario
        )

        expect(exceptionValidation.exceptionValid).toBe(true)
        expect(exceptionValidation.legalBasisDocumented).toBe(true)
        expect(exceptionValidation.userNotified).toBe(true)
        expect(exceptionValidation.dataMinimized).toBe(true)
        expect(exceptionValidation.reviewDateSet).toBe(true)
      }
    })

    it('should validate deletion verification and audit', async () => {
      const testUserId = 'audit-test-user'

      // Execute deletion with audit trail
      const deletionWithAudit = await dataDeletionValidator.executeDataDeletionWithAudit(testUserId)

      expect(deletionWithAudit.auditTrailCreated).toBe(true)
      expect(deletionWithAudit.deletionCertificate).toBeDefined()

      // Validate audit trail
      const auditValidation = await dataDeletionValidator.validateDeletionAuditTrail(
        deletionWithAudit.auditId
      )

      expect(auditValidation.completeDeletionRecorded).toBe(true)
      expect(auditValidation.timestampsAccurate).toBe(true)
      expect(auditValidation.dataTypesDocumented).toBe(true)
      expect(auditValidation.verificationStepsRecorded).toBe(true)
      expect(auditValidation.certificateGenerated).toBe(true)
    })

    it('should validate data resurrection prevention', async () => {
      const testUserId = 'resurrection-test-user'

      // Delete user data
      await dataDeletionValidator.executeCompleteDataDeletion(testUserId)

      // Attempt to access deleted data
      const resurrectionAttempts = [
        'profile_access',
        'document_retrieval',
        'analytics_query',
        'backup_restoration'
      ]

      for (const attempt of resurrectionAttempts) {
        const resurrectionTest = await dataDeletionValidator.testDataResurrection(
          testUserId,
          attempt
        )

        expect(resurrectionTest.accessDenied).toBe(true)
        expect(resurrectionTest.dataNotFound).toBe(true)
        expect(resurrectionTest.backupInaccessible).toBe(true)
        expect(resurrectionTest.auditViolationLogged).toBe(true)
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
})