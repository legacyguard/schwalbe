/**
 * Encryption Service Contract
 * 
 * This contract defines the interface for the Encryption Service API,
 * including all operations for key management, encryption/decryption, and security.
 */

export interface EncryptionServiceContract {
  // Key management
  generateKeyPair(): Promise<CryptoKeyPair>;
  deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>;
  encryptPrivateKey(privateKey: CryptoKey, masterKey: CryptoKey): Promise<EncryptedData>;
  decryptPrivateKey(encryptedPrivateKey: EncryptedData, masterKey: CryptoKey): Promise<CryptoKey>;
  
  // Document encryption/decryption
  encryptDocument(document: File, key: CryptoKey): Promise<EncryptedDocument>;
  decryptDocument(encryptedDocument: EncryptedDocument, key: CryptoKey): Promise<Blob>;
  
  // Data encryption/decryption
  encryptData(data: string, key: CryptoKey): Promise<EncryptedData>;
  decryptData(encryptedData: EncryptedData, key: CryptoKey): Promise<string>;
  
  // Session management
  unlockSession(masterPassword: string): Promise<EncryptionSession>;
  lockSession(): Promise<void>;
  isSessionUnlocked(): boolean;
  
  // Recovery
  generateBackupPhrase(): Promise<string>;
  recoverFromBackupPhrase(backupPhrase: string): Promise<CryptoKeyPair>;
  createGuardianShares(key: CryptoKey, guardians: string[]): Promise<GuardianShare[]>;
  recoverFromGuardians(guardianShares: GuardianShare[]): Promise<CryptoKey>;
}

// Data Transfer Objects

export interface EncryptedData {
  algorithm: string;
  data: string; // base64 encoded
  iv: string; // base64 encoded nonce
  salt?: string; // base64 encoded salt
}

export interface EncryptedDocument {
  id: string;
  encryptedData: EncryptedData;
  encryptedMetadata: EncryptedData;
  documentSalt: string;
  nonce: string;
  version: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface EncryptionSession {
  sessionId: string;
  publicKey: string;
  ephemeralKeyPair: CryptoKeyPair;
  keyDerivationSalt: string;
  isUnlocked: boolean;
  unlockTimestamp: Date;
  autoLockTimeout: number;
}

export interface GuardianShare {
  guardianId: string;
  share: string;
  threshold: number;
  createdAt: Date;
}

export interface DocumentAccess {
  documentId: string;
  recipientPublicKey: string;
  encryptedDocumentKey: string;
  permissions: AccessPermissions;
  expiresAt?: Date;
  createdAt: Date;
}

export interface AccessPermissions {
  canRead: boolean;
  canDownload: boolean;
  canShare: boolean;
  canDelete: boolean;
}

export interface EncryptionKeyPair {
  publicKey: string;
  encryptedPrivateKey: string;
  keyDerivationSalt: string;
  keyDerivationIterations: number;
}

export interface ZeroKnowledgeSession {
  sessionId: string;
  publicKey: string;
  ephemeralKeyPair: CryptoKeyPair;
  keyDerivationSalt: string;
  isUnlocked: boolean;
  unlockTimestamp: Date;
  autoLockTimeout: number;
}

// Error Types

export class EncryptionError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Encryption error: ${message}`);
    this.name = 'EncryptionError';
    this.cause = cause;
  }
}

export class DecryptionError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Decryption error: ${message}`);
    this.name = 'DecryptionError';
    this.cause = cause;
  }
}

export class KeyGenerationError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Key generation error: ${message}`);
    this.name = 'KeyGenerationError';
    this.cause = cause;
  }
}

export class SessionError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Session error: ${message}`);
    this.name = 'SessionError';
    this.cause = cause;
  }
}

export class RecoveryError extends Error {
  constructor(message: string, cause?: Error) {
    super(`Recovery error: ${message}`);
    this.name = 'RecoveryError';
    this.cause = cause;
  }
}

// Security Requirements

export interface SecurityRequirements {
  encryption: {
    symmetricAlgorithm: string;
    asymmetricAlgorithm: string;
    keyDerivationAlgorithm: string;
    hashAlgorithm: string;
  };
  keyManagement: {
    keySize: number;
    keyDerivationIterations: number;
    keyRotationInterval: number;
    maxKeyAge: number;
  };
  sessionManagement: {
    autoLockTimeout: number;
    maxSessionDuration: number;
    maxFailedAttempts: number;
    lockoutDuration: number;
  };
  recovery: {
    backupPhraseLength: number;
    guardianThreshold: number;
    securityQuestionCount: number;
    recoveryCodeLength: number;
  };
}

export const DEFAULT_SECURITY_REQUIREMENTS: SecurityRequirements = {
  encryption: {
    symmetricAlgorithm: 'XSalsa20-Poly1305',
    asymmetricAlgorithm: 'RSA-OAEP',
    keyDerivationAlgorithm: 'PBKDF2',
    hashAlgorithm: 'SHA-256'
  },
  keyManagement: {
    keySize: 256,
    keyDerivationIterations: 100000,
    keyRotationInterval: 90,
    maxKeyAge: 365
  },
  sessionManagement: {
    autoLockTimeout: 30 * 60 * 1000,
    maxSessionDuration: 24 * 60 * 60 * 1000,
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000
  },
  recovery: {
    backupPhraseLength: 24,
    guardianThreshold: 3,
    securityQuestionCount: 5,
    recoveryCodeLength: 8
  }
};

// Helper Types

export interface CryptoKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface CryptoKey {
  type: string;
  extractable: boolean;
  algorithm: any;
  usages: string[];
}
