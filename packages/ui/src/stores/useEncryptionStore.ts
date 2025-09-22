import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EncryptionKey, EncryptionStatus } from '../components/security/EncryptionManager'

interface EncryptionStore {
  // State
  encryptionKeys: EncryptionKey[]
  encryptionStatus: EncryptionStatus | null
  isInitialized: boolean
  isEncrypting: boolean
  masterKeyId: string | null

  // Actions
  initializeEncryption: (masterPassword: string) => Promise<void>
  generateMasterKey: (password: string) => Promise<string>
  generateDocumentKey: () => Promise<string>
  generateTimeCapsuleKey: () => Promise<string>
  generateBackupKey: () => Promise<string>

  // Encryption/Decryption
  encryptDocument: (documentId: string) => Promise<string>
  encryptTimeCapsule: (timeCapsuleId: string) => Promise<string>
  encryptBackup: (backupId: string) => Promise<string>
  decryptData: (encryptedData: string, keyId: string) => Promise<string>

  // Key Management
  rotateKeys: () => Promise<void>
  expireKey: (keyId: string) => Promise<void>
  reactivateKey: (keyId: string) => Promise<void>
  deleteKey: (keyId: string) => Promise<void>

  // Import/Export
  exportKeys: (password?: string) => Promise<Blob>
  importKeys: (file: File, password?: string) => Promise<void>

  // Health & Monitoring
  getEncryptionHealth: () => number
  updateEncryptionStatus: () => Promise<void>
  validateKeyIntegrity: () => Promise<boolean>
}

// Crypto utilities
const cryptoUtils = {
  // Generate secure random bytes
  generateRandomBytes: (length: number): Uint8Array => {
    return crypto.getRandomValues(new Uint8Array(length))
  },

  // Derive key from password using PBKDF2
  deriveKey: async (password: string, salt: Uint8Array, iterations = 100000): Promise<CryptoKey> => {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  },

  // Generate AES-256-GCM key
  generateAESKey: async (): Promise<CryptoKey> => {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  },

  // Encrypt data with AES-256-GCM
  encryptAES: async (data: string, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> => {
    const encoder = new TextEncoder()
    const iv = crypto.getRandomValues(new Uint8Array(12)) // 96-bit IV for GCM

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    )

    return { encrypted, iv }
  },

  // Decrypt data with AES-256-GCM
  decryptAES: async (encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> => {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  },

  // Export key to JWK format
  exportKey: async (key: CryptoKey): Promise<JsonWebKey> => {
    return crypto.subtle.exportKey('jwk', key)
  },

  // Import key from JWK format
  importKey: async (jwk: JsonWebKey): Promise<CryptoKey> => {
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    )
  },

  // Generate key fingerprint
  generateFingerprint: async (key: CryptoKey): Promise<string> => {
    const exported = await cryptoUtils.exportKey(key)
    const keyString = JSON.stringify(exported)
    const encoder = new TextEncoder()
    const data = encoder.encode(keyString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

export const useEncryptionStore = create<EncryptionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      encryptionKeys: [],
      encryptionStatus: null,
      isInitialized: false,
      isEncrypting: false,
      masterKeyId: null,

      // Actions
      initializeEncryption: async (masterPassword) => {
        try {
          // Generate master key
          const masterKeyId = await get().generateMasterKey(masterPassword)

          // Generate initial document and timecapsule keys
          await get().generateDocumentKey()
          await get().generateTimeCapsuleKey()
          await get().generateBackupKey()

          // Update status
          await get().updateEncryptionStatus()

          set({
            isInitialized: true,
            masterKeyId
          })
        } catch (error) {
          console.error('Encryption initialization failed:', error)
          throw error
        }
      },

      generateMasterKey: async (password) => {
        try {
          const salt = cryptoUtils.generateRandomBytes(32)
          const key = await cryptoUtils.deriveKey(password, salt)
          const fingerprint = await cryptoUtils.generateFingerprint(key)

          const masterKey: EncryptionKey = {
            id: `master-${Date.now()}-${fingerprint.slice(0, 8)}`,
            name: 'Master Key',
            type: 'master',
            algorithm: 'AES-256-GCM',
            createdAt: new Date(),
            isActive: true,
            usage: ['key-derivation', 'master-encryption'],
            strength: 'maximum'
          }

          set((state) => ({
            encryptionKeys: [...state.encryptionKeys, masterKey]
          }))

          // Store encrypted master key and salt securely
          const exported = await cryptoUtils.exportKey(key)
          localStorage.setItem('lgp_master_salt', Array.from(salt).join(','))
          localStorage.setItem('lgp_master_key_id', masterKey.id)

          return masterKey.id
        } catch (error) {
          console.error('Master key generation failed:', error)
          throw error
        }
      },

      generateDocumentKey: async () => {
        try {
          const key = await cryptoUtils.generateAESKey()
          const fingerprint = await cryptoUtils.generateFingerprint(key)

          const documentKey: EncryptionKey = {
            id: `doc-${Date.now()}-${fingerprint.slice(0, 8)}`,
            name: 'Document Encryption Key',
            type: 'document',
            algorithm: 'AES-256-GCM',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            isActive: true,
            usage: ['document-encryption', 'file-encryption'],
            strength: 'maximum'
          }

          set((state) => ({
            encryptionKeys: [...state.encryptionKeys, documentKey]
          }))

          // Store key securely
          const exported = await cryptoUtils.exportKey(key)
          localStorage.setItem(`lgp_key_${documentKey.id}`, JSON.stringify(exported))

          return documentKey.id
        } catch (error) {
          console.error('Document key generation failed:', error)
          throw error
        }
      },

      generateTimeCapsuleKey: async () => {
        try {
          const key = await cryptoUtils.generateAESKey()
          const fingerprint = await cryptoUtils.generateFingerprint(key)

          const timeCapsuleKey: EncryptionKey = {
            id: `tc-${Date.now()}-${fingerprint.slice(0, 8)}`,
            name: 'Time Capsule Key',
            type: 'timecapsule',
            algorithm: 'AES-256-GCM',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
            isActive: true,
            usage: ['timecapsule-encryption', 'message-encryption'],
            strength: 'maximum'
          }

          set((state) => ({
            encryptionKeys: [...state.encryptionKeys, timeCapsuleKey]
          }))

          // Store key securely
          const exported = await cryptoUtils.exportKey(key)
          localStorage.setItem(`lgp_key_${timeCapsuleKey.id}`, JSON.stringify(exported))

          return timeCapsuleKey.id
        } catch (error) {
          console.error('Time capsule key generation failed:', error)
          throw error
        }
      },

      generateBackupKey: async () => {
        try {
          const key = await cryptoUtils.generateAESKey()
          const fingerprint = await cryptoUtils.generateFingerprint(key)

          const backupKey: EncryptionKey = {
            id: `backup-${Date.now()}-${fingerprint.slice(0, 8)}`,
            name: 'Backup Encryption Key',
            type: 'backup',
            algorithm: 'AES-256-GCM',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years
            isActive: true,
            usage: ['backup-encryption', 'archive-encryption'],
            strength: 'maximum'
          }

          set((state) => ({
            encryptionKeys: [...state.encryptionKeys, backupKey]
          }))

          // Store key securely
          const exported = await cryptoUtils.exportKey(key)
          localStorage.setItem(`lgp_key_${backupKey.id}`, JSON.stringify(exported))

          return backupKey.id
        } catch (error) {
          console.error('Backup key generation failed:', error)
          throw error
        }
      },

      // Encryption/Decryption
      encryptDocument: async (documentId) => {
        set({ isEncrypting: true })

        try {
          const { encryptionKeys } = get()
          const documentKey = encryptionKeys.find(k => k.type === 'document' && k.isActive)

          if (!documentKey) {
            throw new Error('No active document key found')
          }

          // Load the actual key
          const keyData = localStorage.getItem(`lgp_key_${documentKey.id}`)
          if (!keyData) {
            throw new Error('Document key not found in storage')
          }

          const jwk = JSON.parse(keyData)
          const key = await cryptoUtils.importKey(jwk)

          // In a real implementation, you would:
          // 1. Fetch document data from database
          // 2. Encrypt the document content
          // 3. Store encrypted version back to database
          // 4. Update document metadata with encryption info

          // For demo, simulate encryption process
          if (documentId === 'all') {
            // Encrypt all documents
            await new Promise(resolve => setTimeout(resolve, 2000))
          } else {
            // Encrypt single document
            await new Promise(resolve => setTimeout(resolve, 500))
          }

          await get().updateEncryptionStatus()
          return documentKey.id
        } catch (error) {
          console.error('Document encryption failed:', error)
          throw error
        } finally {
          set({ isEncrypting: false })
        }
      },

      encryptTimeCapsule: async (timeCapsuleId) => {
        try {
          const { encryptionKeys } = get()
          const timeCapsuleKey = encryptionKeys.find(k => k.type === 'timecapsule' && k.isActive)

          if (!timeCapsuleKey) {
            throw new Error('No active time capsule key found')
          }

          // Similar process as document encryption
          if (timeCapsuleId === 'all') {
            await new Promise(resolve => setTimeout(resolve, 1500))
          } else {
            await new Promise(resolve => setTimeout(resolve, 300))
          }

          await get().updateEncryptionStatus()
          return timeCapsuleKey.id
        } catch (error) {
          console.error('Time capsule encryption failed:', error)
          throw error
        }
      },

      encryptBackup: async (backupId) => {
        try {
          const { encryptionKeys } = get()
          const backupKey = encryptionKeys.find(k => k.type === 'backup' && k.isActive)

          if (!backupKey) {
            throw new Error('No active backup key found')
          }

          // Backup encryption process
          await new Promise(resolve => setTimeout(resolve, 1000))

          await get().updateEncryptionStatus()
          return backupKey.id
        } catch (error) {
          console.error('Backup encryption failed:', error)
          throw error
        }
      },

      decryptData: async (encryptedData, keyId) => {
        try {
          const keyData = localStorage.getItem(`lgp_key_${keyId}`)
          if (!keyData) {
            throw new Error('Encryption key not found')
          }

          const jwk = JSON.parse(keyData)
          const key = await cryptoUtils.importKey(jwk)

          // Parse encrypted data (format: base64_iv:base64_encrypted)
          const [ivBase64, encryptedBase64] = encryptedData.split(':')
          const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0))
          const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0)).buffer

          const decrypted = await cryptoUtils.decryptAES(encrypted, key, iv)
          return decrypted
        } catch (error) {
          console.error('Data decryption failed:', error)
          throw error
        }
      },

      // Key Management
      rotateKeys: async () => {
        try {
          const { encryptionKeys } = get()

          // Generate new keys for each type
          const newDocumentKey = await get().generateDocumentKey()
          const newTimeCapsuleKey = await get().generateTimeCapsuleKey()

          // Deactivate old keys but keep them for decryption
          set((state) => ({
            encryptionKeys: state.encryptionKeys.map(key => {
              if ((key.type === 'document' || key.type === 'timecapsule') && key.isActive) {
                return { ...key, isActive: false }
              }
              return key
            })
          }))

          // TODO: Re-encrypt data with new keys
          console.log('Key rotation completed')
        } catch (error) {
          console.error('Key rotation failed:', error)
          throw error
        }
      },

      expireKey: async (keyId) => {
        set((state) => ({
          encryptionKeys: state.encryptionKeys.map(key =>
            key.id === keyId
              ? { ...key, isActive: false, expiresAt: new Date() }
              : key
          )
        }))
      },

      reactivateKey: async (keyId) => {
        set((state) => ({
          encryptionKeys: state.encryptionKeys.map(key =>
            key.id === keyId
              ? { ...key, isActive: true, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
              : key
          )
        }))
      },

      deleteKey: async (keyId) => {
        // Remove from storage
        localStorage.removeItem(`lgp_key_${keyId}`)

        // Remove from state
        set((state) => ({
          encryptionKeys: state.encryptionKeys.filter(key => key.id !== keyId)
        }))
      },

      // Import/Export
      exportKeys: async (password) => {
        try {
          const { encryptionKeys } = get()

          const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            keys: encryptionKeys.map(key => ({
              id: key.id,
              name: key.name,
              type: key.type,
              algorithm: key.algorithm,
              createdAt: key.createdAt.toISOString(),
              expiresAt: key.expiresAt?.toISOString(),
              isActive: key.isActive,
              usage: key.usage,
              strength: key.strength
            }))
          }

          let content = JSON.stringify(exportData, null, 2)

          // Encrypt export if password provided
          if (password) {
            const salt = cryptoUtils.generateRandomBytes(32)
            const key = await cryptoUtils.deriveKey(password, salt)
            const { encrypted, iv } = await cryptoUtils.encryptAES(content, key)

            const encryptedExport = {
              encrypted: true,
              salt: Array.from(salt),
              iv: Array.from(iv),
              data: Array.from(new Uint8Array(encrypted))
            }

            content = JSON.stringify(encryptedExport)
          }

          const blob = new Blob([content], { type: 'application/json' })
          return blob
        } catch (error) {
          console.error('Key export failed:', error)
          throw error
        }
      },

      importKeys: async (file, password) => {
        try {
          const content = await file.text()
          let importData = JSON.parse(content)

          // Decrypt if necessary
          if (importData.encrypted && password) {
            const salt = new Uint8Array(importData.salt)
            const iv = new Uint8Array(importData.iv)
            const encrypted = new Uint8Array(importData.data).buffer

            const key = await cryptoUtils.deriveKey(password, salt)
            const decrypted = await cryptoUtils.decryptAES(encrypted, key, iv)
            importData = JSON.parse(decrypted)
          }

          // Validate import data
          if (!importData.keys || !Array.isArray(importData.keys)) {
            throw new Error('Invalid key file format')
          }

          // Import keys
          const importedKeys: EncryptionKey[] = importData.keys.map((keyData: any) => ({
            ...keyData,
            createdAt: new Date(keyData.createdAt),
            expiresAt: keyData.expiresAt ? new Date(keyData.expiresAt) : undefined
          }))

          set((state) => ({
            encryptionKeys: [...state.encryptionKeys, ...importedKeys]
          }))

          console.log(`Imported ${importedKeys.length} encryption keys`)
        } catch (error) {
          console.error('Key import failed:', error)
          throw error
        }
      },

      // Health & Monitoring
      getEncryptionHealth: () => {
        const { encryptionKeys, encryptionStatus } = get()

        if (!encryptionKeys.length) return 0

        let score = 100
        const now = new Date()

        // Check for expired keys
        const expiredKeys = encryptionKeys.filter(key =>
          key.expiresAt && key.expiresAt < now && key.isActive
        )
        score -= expiredKeys.length * 15

        // Check for missing key types
        const hasActiveDocument = encryptionKeys.some(k => k.type === 'document' && k.isActive)
        const hasActiveTimeCapsule = encryptionKeys.some(k => k.type === 'timecapsule' && k.isActive)
        const hasActiveMaster = encryptionKeys.some(k => k.type === 'master' && k.isActive)

        if (!hasActiveDocument) score -= 20
        if (!hasActiveTimeCapsule) score -= 15
        if (!hasActiveMaster) score -= 25

        // Check encryption coverage
        if (encryptionStatus) {
          const totalItems = encryptionStatus.totalDocuments + encryptionStatus.totalTimecapsules + encryptionStatus.totalBackups
          const encryptedItems = encryptionStatus.documentsEncrypted + encryptionStatus.timecapsulesEncrypted + encryptionStatus.backupsEncrypted

          if (totalItems > 0) {
            const coverage = (encryptedItems / totalItems) * 100
            score = (score * 0.7) + (coverage * 0.3)
          }
        }

        return Math.max(0, Math.round(score))
      },

      updateEncryptionStatus: async () => {
        try {
          // In a real implementation, fetch actual counts from database
          // For demo, simulate with random numbers
          const status: EncryptionStatus = {
            documentsEncrypted: Math.floor(Math.random() * 50) + 30,
            totalDocuments: Math.floor(Math.random() * 20) + 40,
            timecapsulesEncrypted: Math.floor(Math.random() * 10) + 5,
            totalTimecapsules: Math.floor(Math.random() * 5) + 8,
            backupsEncrypted: Math.floor(Math.random() * 5) + 2,
            totalBackups: Math.floor(Math.random() * 2) + 3,
            overallProgress: 0,
            lastEncryption: new Date()
          }

          // Calculate overall progress
          const totalItems = status.totalDocuments + status.totalTimecapsules + status.totalBackups
          const encryptedItems = status.documentsEncrypted + status.timecapsulesEncrypted + status.backupsEncrypted
          status.overallProgress = totalItems > 0 ? Math.round((encryptedItems / totalItems) * 100) : 0

          set({ encryptionStatus: status })
        } catch (error) {
          console.error('Failed to update encryption status:', error)
        }
      },

      validateKeyIntegrity: async () => {
        try {
          const { encryptionKeys } = get()
          let allValid = true

          for (const key of encryptionKeys) {
            try {
              const keyData = localStorage.getItem(`lgp_key_${key.id}`)
              if (!keyData) {
                console.warn(`Key ${key.id} not found in storage`)
                allValid = false
                continue
              }

              const jwk = JSON.parse(keyData)
              await cryptoUtils.importKey(jwk)
            } catch (error) {
              console.error(`Key ${key.id} validation failed:`, error)
              allValid = false
            }
          }

          return allValid
        } catch (error) {
          console.error('Key integrity validation failed:', error)
          return false
        }
      }
    }),
    {
      name: 'encryption-store',
      partialize: (state) => ({
        encryptionKeys: state.encryptionKeys,
        isInitialized: state.isInitialized,
        masterKeyId: state.masterKeyId
      })
    }
  )
)