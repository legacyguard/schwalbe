import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { SecurityTester } from '../../utils/security/securityTester'
import { AuthenticationSecurityTester } from '../../utils/security/authSecurityTester'
import { DataEncryptionValidator } from '../../utils/security/encryptionValidator'
import { FileUploadSecurityTester } from '../../utils/security/fileSecurityTester'
import { APISecurityTester } from '../../utils/security/apiSecurityTester'

const mockSecureConfig = {
  supabase: {
    url: 'https://test.supabase.co',
    anonKey: 'test-anon-key',
    serviceKey: 'test-service-key'
  },
  encryption: {
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2'
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000
  }
}

describe('Penetration Testing Suite', () => {
  let securityTester: SecurityTester
  let authTester: AuthenticationSecurityTester
  let encryptionValidator: DataEncryptionValidator
  let fileTester: FileUploadSecurityTester
  let apiTester: APISecurityTester

  beforeEach(() => {
    securityTester = new SecurityTester(mockSecureConfig)
    authTester = new AuthenticationSecurityTester(mockSecureConfig)
    encryptionValidator = new DataEncryptionValidator(mockSecureConfig)
    fileTester = new FileUploadSecurityTester(mockSecureConfig)
    apiTester = new APISecurityTester(mockSecureConfig)
  })

  describe('Authentication Security Testing', () => {
    it('should test password security requirements', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        '12345678',
        'password123'
      ]

      const strongPasswords = [
        'MyStr0ng!P@ssw0rd2024',
        'C0mpl3x&S3cur3P@ss!',
        'Un1qu3$ecur3P@ssw0rd#'
      ]

      // Test weak passwords rejection
      for (const weakPassword of weakPasswords) {
        const result = await authTester.testPasswordStrength(weakPassword)
        expect(result.isSecure).toBe(false)
        expect(result.vulnerabilities).toContain('weak_password')
      }

      // Test strong passwords acceptance
      for (const strongPassword of strongPasswords) {
        const result = await authTester.testPasswordStrength(strongPassword)
        expect(result.isSecure).toBe(true)
        expect(result.vulnerabilities).not.toContain('weak_password')
      }
    })

    it('should test brute force protection', async () => {
      const testEmail = 'test@example.com'
      const wrongPassword = 'wrongpassword'

      const bruteForceAttempts = []

      // Simulate multiple failed login attempts
      for (let i = 0; i < 10; i++) {
        const result = await authTester.testLoginAttempt(testEmail, wrongPassword)
        bruteForceAttempts.push(result)
      }

      // Should be rate limited after certain attempts
      const rateLimitedAttempts = bruteForceAttempts.filter(
        attempt => attempt.rateLimited
      )

      expect(rateLimitedAttempts.length).toBeGreaterThan(0)
      expect(bruteForceAttempts[bruteForceAttempts.length - 1].rateLimited).toBe(true)
    })

    it('should test session security', async () => {
      const session = await authTester.createTestSession()

      // Test session token security
      const tokenSecurity = await authTester.validateSessionToken(session.token)
      expect(tokenSecurity.isSecure).toBe(true)
      expect(tokenSecurity.vulnerabilities).not.toContain('weak_token')

      // Test session expiration
      const expiredSession = await authTester.createExpiredSession()
      const expiredTokenValidation = await authTester.validateSessionToken(expiredSession.token)
      expect(expiredTokenValidation.isValid).toBe(false)
      expect(expiredTokenValidation.reason).toBe('expired')

      // Test session hijacking protection
      const hijackResult = await authTester.testSessionHijacking(session.token)
      expect(hijackResult.isProtected).toBe(true)
    })

    it('should test multi-factor authentication bypass attempts', async () => {
      const userWithMFA = {
        email: 'mfa-user@example.com',
        password: 'ValidP@ssw0rd123',
        mfaEnabled: true
      }

      // Test MFA bypass attempts
      const bypassAttempts = [
        { method: 'empty_mfa_code', code: '' },
        { method: 'invalid_mfa_code', code: '000000' },
        { method: 'replay_attack', code: '123456' },
        { method: 'timing_attack', code: '654321' }
      ]

      for (const attempt of bypassAttempts) {
        const result = await authTester.testMFABypass(userWithMFA, attempt.code)
        expect(result.bypassSuccessful).toBe(false)
        expect(result.securityViolations).toContain(attempt.method)
      }
    })

    it('should test password reset security', async () => {
      const testEmail = 'reset-test@example.com'

      // Test password reset token security
      const resetToken = await authTester.generatePasswordResetToken(testEmail)
      const tokenValidation = await authTester.validateResetToken(resetToken)

      expect(tokenValidation.isSecure).toBe(true)
      expect(tokenValidation.expirationTime).toBeGreaterThan(Date.now())
      expect(tokenValidation.isOneTimeUse).toBe(true)

      // Test reset token replay attack
      await authTester.useResetToken(resetToken, 'NewP@ssw0rd123')
      const replayResult = await authTester.useResetToken(resetToken, 'AnotherP@ss456')

      expect(replayResult.success).toBe(false)
      expect(replayResult.error).toBe('token_already_used')
    })

    it('should test account enumeration protection', async () => {
      const existingEmail = 'existing@example.com'
      const nonExistentEmail = 'nonexistent@example.com'

      // Both should return similar responses to prevent enumeration
      const existingResponse = await authTester.testAccountEnumeration(existingEmail)
      const nonExistentResponse = await authTester.testAccountEnumeration(nonExistentEmail)

      expect(existingResponse.responseTime).toBeCloseTo(nonExistentResponse.responseTime, 1)
      expect(existingResponse.message).toBe(nonExistentResponse.message)
      expect(existingResponse.statusCode).toBe(nonExistentResponse.statusCode)
    })
  })

  describe('Authorization Bypass Testing', () => {
    it('should test horizontal privilege escalation', async () => {
      const user1 = { id: 'user1', role: 'user', documents: ['doc1', 'doc2'] }
      const user2 = { id: 'user2', role: 'user', documents: ['doc3', 'doc4'] }

      // User1 tries to access User2's documents
      const bypassAttempts = [
        { documentId: 'doc3', expectedAccess: false },
        { documentId: 'doc4', expectedAccess: false }
      ]

      for (const attempt of bypassAttempts) {
        const result = await authTester.testDocumentAccess(user1, attempt.documentId)
        expect(result.accessGranted).toBe(attempt.expectedAccess)
        expect(result.violations).toContain('unauthorized_access_attempt')
      }
    })

    it('should test vertical privilege escalation', async () => {
      const regularUser = { id: 'user1', role: 'user' }
      const adminEndpoints = [
        '/api/admin/users',
        '/api/admin/analytics',
        '/api/admin/system-config',
        '/api/admin/logs'
      ]

      // Regular user tries to access admin endpoints
      for (const endpoint of adminEndpoints) {
        const result = await authTester.testEndpointAccess(regularUser, endpoint)
        expect(result.accessGranted).toBe(false)
        expect(result.httpStatus).toBe(403)
        expect(result.violations).toContain('insufficient_privileges')
      }
    })

    it('should test IDOR (Insecure Direct Object Reference)', async () => {
      const user = { id: 'user123', role: 'user' }

      const idorTests = [
        { endpoint: '/api/documents/1', shouldAccess: false },
        { endpoint: '/api/documents/999', shouldAccess: false },
        { endpoint: '/api/users/456/profile', shouldAccess: false },
        { endpoint: '/api/analytics/789', shouldAccess: false }
      ]

      for (const test of idorTests) {
        const result = await authTester.testIDOR(user, test.endpoint)
        expect(result.accessGranted).toBe(test.shouldAccess)
        if (!test.shouldAccess) {
          expect(result.violations).toContain('idor_vulnerability')
        }
      }
    })

    it('should test JWT token manipulation', async () => {
      const validToken = await authTester.generateValidJWT({ userId: 'user123', role: 'user' })

      const manipulationTests = [
        {
          name: 'role_escalation',
          manipulation: (token: string) => authTester.manipulateJWTClaims(token, { role: 'admin' }),
          expectedValid: false
        },
        {
          name: 'user_id_change',
          manipulation: (token: string) => authTester.manipulateJWTClaims(token, { userId: 'admin' }),
          expectedValid: false
        },
        {
          name: 'expiration_extension',
          manipulation: (token: string) => authTester.manipulateJWTClaims(token, { exp: Date.now() + 86400000 }),
          expectedValid: false
        },
        {
          name: 'signature_removal',
          manipulation: (token: string) => token.split('.').slice(0, 2).join('.'),
          expectedValid: false
        }
      ]

      for (const test of manipulationTests) {
        const manipulatedToken = test.manipulation(validToken)
        const validation = await authTester.validateJWT(manipulatedToken)

        expect(validation.isValid).toBe(test.expectedValid)
        if (!test.expectedValid) {
          expect(validation.violations).toContain(test.name)
        }
      }
    })
  })

  describe('Data Encryption Validation', () => {
    it('should validate encryption at rest', async () => {
      const sensitiveData = {
        personalInfo: 'Ján Novák, 123456789',
        documentContent: 'Obsah citlivého dokumentu',
        healthInfo: 'Zdravotné informácie'
      }

      for (const [dataType, data] of Object.entries(sensitiveData)) {
        const encryptionResult = await encryptionValidator.testDataEncryption(data, dataType)

        expect(encryptionResult.isEncrypted).toBe(true)
        expect(encryptionResult.algorithm).toBe('AES-256-GCM')
        expect(encryptionResult.encryptedData).not.toContain(data)
        expect(encryptionResult.keyStrength).toBeGreaterThanOrEqual(256)
      }
    })

    it('should validate encryption in transit', async () => {
      const testEndpoints = [
        '/api/auth/login',
        '/api/documents/upload',
        '/api/user/profile',
        '/api/sofia/chat'
      ]

      for (const endpoint of testEndpoints) {
        const tlsValidation = await encryptionValidator.testTLSEncryption(endpoint)

        expect(tlsValidation.isEncrypted).toBe(true)
        expect(tlsValidation.tlsVersion).toMatch(/TLS 1\.[23]/)
        expect(tlsValidation.cipherSuite).toMatch(/AES.*GCM/)
        expect(tlsValidation.certificateValid).toBe(true)
      }
    })

    it('should test key management security', async () => {
      const keyTests = [
        { keyType: 'encryption', expectedStrength: 256 },
        { keyType: 'signing', expectedStrength: 256 },
        { keyType: 'hmac', expectedStrength: 256 }
      ]

      for (const test of keyTests) {
        const keyValidation = await encryptionValidator.testKeyManagement(test.keyType)

        expect(keyValidation.keyStrength).toBeGreaterThanOrEqual(test.expectedStrength)
        expect(keyValidation.keyRotation).toBe(true)
        expect(keyValidation.keyStorage).toBe('secure_vault')
        expect(keyValidation.accessControls).toBe(true)
      }
    })

    it('should test data decryption authorization', async () => {
      const encryptedDocument = await encryptionValidator.encryptTestDocument('test-content')

      // Test authorized decryption
      const authorizedDecryption = await encryptionValidator.testDecryption(
        encryptedDocument,
        { userId: 'owner123', role: 'owner' }
      )
      expect(authorizedDecryption.decryptionSuccessful).toBe(true)
      expect(authorizedDecryption.decryptedContent).toBe('test-content')

      // Test unauthorized decryption
      const unauthorizedDecryption = await encryptionValidator.testDecryption(
        encryptedDocument,
        { userId: 'hacker456', role: 'user' }
      )
      expect(unauthorizedDecryption.decryptionSuccessful).toBe(false)
      expect(unauthorizedDecryption.violations).toContain('unauthorized_decryption_attempt')
    })
  })

  describe('File Upload Security Testing', () => {
    it('should test malicious file upload prevention', async () => {
      const maliciousFiles = [
        { name: 'virus.exe', content: 'MZ\x90\x00', type: 'application/octet-stream' },
        { name: 'script.php', content: '<?php system($_GET["cmd"]); ?>', type: 'application/x-php' },
        { name: 'malware.js', content: 'eval(atob("malicious_code"))', type: 'application/javascript' },
        { name: 'shell.jsp', content: '<%Runtime.getRuntime().exec(request.getParameter("cmd"));%>', type: 'application/x-jsp' }
      ]

      for (const file of maliciousFiles) {
        const uploadResult = await fileTester.testFileUpload(file)

        expect(uploadResult.uploadBlocked).toBe(true)
        expect(uploadResult.blockReason).toMatch(/(malicious_content|unauthorized_file_type|security_scan_failed)/)
        expect(uploadResult.securityViolations).toContain('malicious_file_detected')
      }
    })

    it('should test file size and type restrictions', async () => {
      const testFiles = [
        {
          name: 'huge-file.pdf',
          size: 50 * 1024 * 1024, // 50MB
          type: 'application/pdf',
          shouldPass: false,
          reason: 'file_too_large'
        },
        {
          name: 'normal-doc.pdf',
          size: 5 * 1024 * 1024, // 5MB
          type: 'application/pdf',
          shouldPass: true,
          reason: null
        },
        {
          name: 'invalid-type.xyz',
          size: 1024,
          type: 'application/unknown',
          shouldPass: false,
          reason: 'unsupported_file_type'
        }
      ]

      for (const file of testFiles) {
        const uploadResult = await fileTester.testFileUploadRestrictions(file)

        expect(uploadResult.uploadAllowed).toBe(file.shouldPass)
        if (!file.shouldPass) {
          expect(uploadResult.blockReason).toBe(file.reason)
        }
      }
    })

    it('should test file content scanning', async () => {
      const testFiles = [
        {
          name: 'clean-document.pdf',
          content: '%PDF-1.4 clean content',
          expectedThreat: false
        },
        {
          name: 'suspicious-document.pdf',
          content: '%PDF-1.4 with embedded /JavaScript action',
          expectedThreat: true
        },
        {
          name: 'macro-document.docx',
          content: 'PK with macro content',
          expectedThreat: true
        }
      ]

      for (const file of testFiles) {
        const scanResult = await fileTester.scanFileContent(file)

        expect(scanResult.threatDetected).toBe(file.expectedThreat)
        if (file.expectedThreat) {
          expect(scanResult.threatTypes).toBeDefined()
          expect(scanResult.threatTypes.length).toBeGreaterThan(0)
        }
      }
    })

    it('should test file path traversal prevention', async () => {
      const pathTraversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\config\\sam',
        '/etc/shadow',
        'C:\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd'
      ]

      for (const maliciousPath of pathTraversalAttempts) {
        const uploadResult = await fileTester.testFilePathTraversal(maliciousPath)

        expect(uploadResult.pathTraversalBlocked).toBe(true)
        expect(uploadResult.securityViolations).toContain('path_traversal_attempt')
      }
    })
  })

  describe('API Security Testing', () => {
    it('should test SQL injection protection', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "UNION SELECT * FROM sensitive_data",
        "1; INSERT INTO users VALUES ('hacker', 'password')",
        "' OR 1=1 --"
      ]

      const testEndpoints = [
        '/api/documents/search',
        '/api/users/search',
        '/api/analytics/query'
      ]

      for (const endpoint of testEndpoints) {
        for (const payload of sqlInjectionPayloads) {
          const injectionTest = await apiTester.testSQLInjection(endpoint, payload)

          expect(injectionTest.injectionBlocked).toBe(true)
          expect(injectionTest.response.statusCode).toBe(400)
          expect(injectionTest.securityViolations).toContain('sql_injection_attempt')
        }
      }
    })

    it('should test XSS protection', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(\'XSS\')">',
        '<svg onload="alert(\'XSS\')">',
        '"><script>alert("XSS")</script>'
      ]

      const testEndpoints = [
        '/api/sofia/chat',
        '/api/documents/comment',
        '/api/user/profile'
      ]

      for (const endpoint of testEndpoints) {
        for (const payload of xssPayloads) {
          const xssTest = await apiTester.testXSSProtection(endpoint, payload)

          expect(xssTest.xssBlocked).toBe(true)
          expect(xssTest.sanitizedInput).not.toContain('<script>')
          expect(xssTest.securityViolations).toContain('xss_attempt')
        }
      }
    })

    it('should test CSRF protection', async () => {
      const protectedEndpoints = [
        { endpoint: '/api/user/profile', method: 'PUT' },
        { endpoint: '/api/documents/delete', method: 'DELETE' },
        { endpoint: '/api/user/password', method: 'POST' }
      ]

      for (const { endpoint, method } of protectedEndpoints) {
        // Test without CSRF token
        const withoutToken = await apiTester.testCSRFProtection(endpoint, method, null)
        expect(withoutToken.requestBlocked).toBe(true)
        expect(withoutToken.blockReason).toBe('missing_csrf_token')

        // Test with invalid CSRF token
        const withInvalidToken = await apiTester.testCSRFProtection(endpoint, method, 'invalid-token')
        expect(withInvalidToken.requestBlocked).toBe(true)
        expect(withInvalidToken.blockReason).toBe('invalid_csrf_token')

        // Test with valid CSRF token
        const validToken = await apiTester.generateValidCSRFToken()
        const withValidToken = await apiTester.testCSRFProtection(endpoint, method, validToken)
        expect(withValidToken.requestBlocked).toBe(false)
      }
    })

    it('should test rate limiting', async () => {
      const rateLimitTests = [
        { endpoint: '/api/auth/login', limit: 5, window: 60000 },
        { endpoint: '/api/sofia/chat', limit: 20, window: 60000 },
        { endpoint: '/api/documents/upload', limit: 10, window: 60000 }
      ]

      for (const test of rateLimitTests) {
        const results = []

        // Make requests exceeding the limit
        for (let i = 0; i < test.limit + 5; i++) {
          const result = await apiTester.testRateLimit(test.endpoint)
          results.push(result)
        }

        // Check that rate limiting kicks in
        const rateLimitedRequests = results.filter(r => r.rateLimited)
        expect(rateLimitedRequests.length).toBeGreaterThan(0)

        // Check that the last few requests are blocked
        const lastRequests = results.slice(-3)
        expect(lastRequests.every(r => r.rateLimited)).toBe(true)
      }
    })

    it('should test API input validation', async () => {
      const invalidInputTests = [
        {
          endpoint: '/api/user/profile',
          payload: { email: 'invalid-email' },
          expectedError: 'invalid_email_format'
        },
        {
          endpoint: '/api/documents/create',
          payload: { title: 'a'.repeat(300) },
          expectedError: 'title_too_long'
        },
        {
          endpoint: '/api/sofia/chat',
          payload: { message: '' },
          expectedError: 'message_empty'
        },
        {
          endpoint: '/api/user/profile',
          payload: { age: -5 },
          expectedError: 'invalid_age'
        }
      ]

      for (const test of invalidInputTests) {
        const validationResult = await apiTester.testInputValidation(test.endpoint, test.payload)

        expect(validationResult.validationFailed).toBe(true)
        expect(validationResult.errorType).toBe(test.expectedError)
        expect(validationResult.statusCode).toBe(400)
      }
    })

    it('should test API authentication and authorization', async () => {
      const protectedEndpoints = [
        '/api/documents',
        '/api/user/profile',
        '/api/sofia/chat',
        '/api/analytics/dashboard'
      ]

      for (const endpoint of protectedEndpoints) {
        // Test without authentication
        const unauthResult = await apiTester.testUnauthenticatedAccess(endpoint)
        expect(unauthResult.accessDenied).toBe(true)
        expect(unauthResult.statusCode).toBe(401)

        // Test with invalid token
        const invalidTokenResult = await apiTester.testInvalidToken(endpoint, 'invalid-token')
        expect(invalidTokenResult.accessDenied).toBe(true)
        expect(invalidTokenResult.statusCode).toBe(401)

        // Test with expired token
        const expiredToken = await apiTester.generateExpiredToken()
        const expiredTokenResult = await apiTester.testExpiredToken(endpoint, expiredToken)
        expect(expiredTokenResult.accessDenied).toBe(true)
        expect(expiredTokenResult.statusCode).toBe(401)
      }
    })
  })

  describe('Security Headers Testing', () => {
    it('should test security headers presence', async () => {
      const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'Referrer-Policy'
      ]

      const testUrls = [
        '/',
        '/dashboard',
        '/documents',
        '/api/auth/login'
      ]

      for (const url of testUrls) {
        const headerTest = await securityTester.testSecurityHeaders(url)

        for (const header of requiredHeaders) {
          expect(headerTest.headers[header]).toBeDefined()
          expect(headerTest.missingHeaders).not.toContain(header)
        }
      }
    })

    it('should test Content Security Policy', async () => {
      const cspTest = await securityTester.testContentSecurityPolicy('/')

      expect(cspTest.cspPresent).toBe(true)
      expect(cspTest.allowsUnsafeInline).toBe(false)
      expect(cspTest.allowsUnsafeEval).toBe(false)
      expect(cspTest.allowsDataUrls).toBe(false)
      expect(cspTest.violations).toHaveLength(0)
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
})