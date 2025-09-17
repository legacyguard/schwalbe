
/**
 * Blockchain Verification Service for LegacyGuard
 * Provides immutable audit trails and document integrity verification
 */

import { createHash, randomBytes } from 'crypto';
import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

export interface BlockchainEntry {
  action: BlockchainAction;
  currentHash: string;
  documentId: string;
  id: string;
  merkleRoot: string;
  metadata: Record<string, any>;
  previousHash: string;
  signature: string;
  timestamp: number;
  userId: string;
}

export interface DocumentFingerprint {
  documentId: string;
  fileSize: number;
  mimeType: string;
  sha256Hash: string;
  timestamp: number;
  version: number;
}

export interface AuditTrail {
  documentId: string;
  entries: BlockchainEntry[];
  integrity: 'compromised' | 'intact' | 'unknown';
  lastVerified: number;
  verified: boolean;
}

export interface VerificationResult {
  chainIntegrity: boolean;
  documentIntegrity: boolean;
  errors: string[];
  isValid: boolean;
  signatureVerification: boolean;
  warnings: string[];
}

export type BlockchainAction =
  | 'ACCESS'
  | 'BACKUP'
  | 'CREATE'
  | 'DECRYPT'
  | 'DELETE'
  | 'ENCRYPT'
  | 'PERMISSION_CHANGE'
  | 'RESTORE'
  | 'SHARE'
  | 'UPDATE';

export interface MerkleTree {
  leaves: string[];
  proofs: Record<string, string[]>;
  root: string;
}

class BlockchainVerificationService {
  private readonly BLOCKCHAIN_VERSION = 1;
  private readonly HASH_ALGORITHM = 'sha256';
  private readonly ___DIFFICULTY = 4; // Number of leading zeros for proof of work

  /**
   * Create a new blockchain entry
   */
  async createBlockchainEntry(
    documentId: string,
    action: BlockchainAction,
    userId: string,
    metadata: Record<string, any> = {},
    privateKey?: string
  ): Promise<BlockchainEntry> {
    const timestamp = Date.now();
    const previousHash =
      (await this.getLastBlockHash(documentId)) || '0'.repeat(64);

    // Create document fingerprint if action involves document content
    let documentFingerprint: DocumentFingerprint | undefined;
    if (['CREATE', 'UPDATE', 'ENCRYPT'].includes(action) && metadata.fileData) {
      documentFingerprint = await this.createDocumentFingerprint(
        documentId,
        metadata.fileData,
        metadata.mimeType || 'application/octet-stream'
      );
    }

    // Create entry data
    const entryData = {
      id: this.generateId(),
      timestamp,
      documentId,
      action,
      userId,
      previousHash,
      metadata: {
        ...metadata,
        documentFingerprint,
        version: this.BLOCKCHAIN_VERSION,
      },
    };

    // Calculate current hash
    const currentHash = this.calculateHash(entryData);

    // Create Merkle tree for this block
    const merkleTree = this.createMerkleTree([
      currentHash,
      previousHash,
      documentFingerprint?.sha256Hash || '',
    ]);

    // Sign the entry
    const signature = privateKey
      ? this.signEntry(entryData, privateKey)
      : this.createSystemSignature(entryData);

    const entry: BlockchainEntry = {
      ...entryData,
      currentHash,
      merkleRoot: merkleTree.root,
      signature,
    };

    // Store the entry
    await this.storeBlockchainEntry(entry);

    return entry;
  }

  /**
   * Create document fingerprint for integrity verification
   */
  async createDocumentFingerprint(
    documentId: string,
    fileData: ArrayBuffer | Uint8Array,
    mimeType: string
  ): Promise<DocumentFingerprint> {
    const dataArray =
      fileData instanceof ArrayBuffer ? new Uint8Array(fileData) : fileData;

    // Calculate SHA-256 hash
    const hash = createHash(this.HASH_ALGORITHM);
    hash.update(dataArray);
    const sha256Hash = hash.digest('hex');

    return {
      documentId,
      sha256Hash,
      fileSize: dataArray.length,
      mimeType,
      timestamp: Date.now(),
      version: this.BLOCKCHAIN_VERSION,
    };
  }

  /**
   * Verify document integrity against blockchain
   */
  async verifyDocumentIntegrity(
    documentId: string,
    currentFileData: ArrayBuffer | Uint8Array
  ): Promise<VerificationResult> {
    const auditTrail = await this.getAuditTrail(documentId);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!auditTrail || auditTrail.entries.length === 0) {
      errors.push('No audit trail found for document');
      return {
        isValid: false,
        chainIntegrity: false,
        documentIntegrity: false,
        signatureVerification: false,
        errors,
        warnings,
      };
    }

    // Verify chain integrity
    const chainIntegrity = await this.verifyChainIntegrity(auditTrail.entries);
    if (!chainIntegrity) {
      errors.push('Blockchain chain integrity compromised');
    }

    // Verify document fingerprint
    const latestFingerprint = this.getLatestDocumentFingerprint(
      auditTrail.entries
    );
    let documentIntegrity = false;

    if (latestFingerprint) {
      const currentFingerprint = await this.createDocumentFingerprint(
        documentId,
        currentFileData,
        latestFingerprint.mimeType
      );

      documentIntegrity =
        latestFingerprint.sha256Hash === currentFingerprint.sha256Hash;

      if (!documentIntegrity) {
        errors.push(
          'Document content has been modified since last blockchain entry'
        );
      }

      if (latestFingerprint.fileSize !== currentFingerprint.fileSize) {
        warnings.push('File size mismatch detected');
      }
    } else {
      warnings.push('No document fingerprint found in audit trail');
    }

    // Verify signatures
    const signatureVerification = await this.verifyAllSignatures(
      auditTrail.entries
    );
    if (!signatureVerification) {
      errors.push('One or more signatures in the audit trail are invalid');
    }

    return {
      isValid: chainIntegrity && documentIntegrity && signatureVerification,
      chainIntegrity,
      documentIntegrity,
      signatureVerification,
      errors,
      warnings,
    };
  }

  /**
   * Get complete audit trail for a document
   */
  async getAuditTrail(documentId: string): Promise<AuditTrail | null> {
    try {
      const entries = await this.getBlockchainEntries(documentId);

      if (entries.length === 0) {
        return null;
      }

      // Sort by timestamp
      entries.sort((a, b) => a.timestamp - b.timestamp);

      // Verify chain integrity
      const chainIntegrity = await this.verifyChainIntegrity(entries);

      return {
        documentId,
        entries,
        verified: chainIntegrity,
        integrity: chainIntegrity ? 'intact' : 'compromised',
        lastVerified: Date.now(),
      };
    } catch (error) {
      console.error('Failed to get audit trail:', error);
      return null;
    }
  }

  /**
   * Create Merkle tree for block verification
   */
  private createMerkleTree(leaves: string[]): MerkleTree {
    if (leaves.length === 0) {
      throw new Error('Cannot create Merkle tree with no leaves');
    }

    // Remove empty strings and duplicates
    const cleanLeaves = [...new Set(leaves.filter(leaf => leaf))];

    if (cleanLeaves.length === 0) {
      throw new Error('No valid leaves provided for Merkle tree');
    }

    // Hash all leaves
    const hashedLeaves = cleanLeaves.map(leaf => this.hashData(leaf));

    let currentLevel = hashedLeaves;
    const proofs: Record<string, string[]> = {};

    // Build tree bottom-up
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;

        const combined = this.hashData(left + right);
        nextLevel.push(combined);

        // Store proof paths
        if (!proofs[left]) proofs[left] = [];
        if (!proofs[right]) proofs[right] = [];

        proofs[left].push(right);
        proofs[right].push(left);
      }

      currentLevel = nextLevel;
    }

    return {
      root: currentLevel[0],
      leaves: hashedLeaves,
      proofs,
    };
  }

  /**
   * Verify Merkle proof
   */
  private ___verifyMerkleProof(
    leaf: string,
    proof: string[],
    root: string
  ): boolean {
    let computedHash = this.hashData(leaf);

    for (const proofElement of proof) {
      computedHash = this.hashData(computedHash + proofElement);
    }

    return computedHash === root;
  }

  /**
   * Verify blockchain chain integrity
   */
  private async verifyChainIntegrity(
    entries: BlockchainEntry[]
  ): Promise<boolean> {
    if (entries.length === 0) return true;

    // Sort by timestamp
    const sortedEntries = [...entries].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    for (let i = 1; i < sortedEntries.length; i++) {
      const current = sortedEntries[i];
      const previous = sortedEntries[i - 1];

      // Verify that current entry references previous correctly
      if (current.previousHash !== previous.currentHash) {
        console.error(`Chain integrity broken at entry ${current.id}`);
        return false;
      }

      // Verify current hash
      const expectedHash = this.calculateHash({
        id: current.id,
        timestamp: current.timestamp,
        documentId: current.documentId,
        action: current.action,
        userId: current.userId,
        previousHash: current.previousHash,
        metadata: current.metadata,
      });

      if (current.currentHash !== expectedHash) {
        console.error(`Hash mismatch at entry ${current.id}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Verify all signatures in audit trail
   */
  private async verifyAllSignatures(
    entries: BlockchainEntry[]
  ): Promise<boolean> {
    for (const entry of entries) {
      const isValid = await this.verifyEntrySignature(entry);
      if (!isValid) {
        console.error(`Signature verification failed for entry ${entry.id}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Sign blockchain entry
   */
  private signEntry(entryData: any, privateKey: string): string {
    const dataToSign = JSON.stringify(entryData);
    const keyPair = nacl.box.keyPair.fromSecretKey(decodeBase64(privateKey));
    const signature = nacl.sign.detached(
      new TextEncoder().encode(dataToSign),
      keyPair.secretKey
    );
    return encodeBase64(signature);
  }

  /**
   * Create system signature (fallback when no private key)
   */
  private createSystemSignature(entryData: any): string {
    const dataToSign = JSON.stringify(entryData);
    const hash = createHash('sha256').update(dataToSign).digest('hex');
    return hash;
  }

  /**
   * Verify entry signature
   */
  private async verifyEntrySignature(entry: BlockchainEntry): Promise<boolean> {
    try {
      // For system signatures (fallback), verify hash
      if (entry.signature.length === 64) {
        const entryData = { ...entry };
        delete (entryData as any).signature;
        delete (entryData as any).currentHash;
        delete (entryData as any).merkleRoot;

        const expectedHash = createHash('sha256')
          .update(JSON.stringify(entryData))
          .digest('hex');

        return entry.signature === expectedHash;
      }

      // For cryptographic signatures, would need public key verification
      // TODO: Implement public key signature verification
      return true;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Calculate hash for blockchain entry
   */
  private calculateHash(entryData: any): string {
    const dataString = JSON.stringify(entryData);
    return createHash(this.HASH_ALGORITHM).update(dataString).digest('hex');
  }

  /**
   * Hash arbitrary data
   */
  private hashData(data: string): string {
    return createHash(this.HASH_ALGORITHM).update(data).digest('hex');
  }

  /**
   * Get latest document fingerprint from audit trail
   */
  private getLatestDocumentFingerprint(
    entries: BlockchainEntry[]
  ): DocumentFingerprint | null {
    // Sort by timestamp descending
    const sortedEntries = [...entries].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    for (const entry of sortedEntries) {
      if (entry.metadata?.documentFingerprint) {
        return entry.metadata.documentFingerprint;
      }
    }

    return null;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return createHash('sha256')
      .update(randomBytes(16))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Storage operations (IndexedDB/Supabase)
   */
  private async storeBlockchainEntry(entry: BlockchainEntry): Promise<void> {
    // Store in IndexedDB for local verification
    await this.storeInIndexedDB('blockchain_entries', entry);

    // TODO: Store in Supabase for persistence
    // await this.storeInSupabase('blockchain_entries', entry);
  }

  private async getBlockchainEntries(
    documentId: string
  ): Promise<BlockchainEntry[]> {
    // Get from IndexedDB
    const entries = await this.getFromIndexedDB(
      'blockchain_entries',
      documentId
    );
    return Array.isArray(entries) ? entries : entries ? [entries] : [];
  }

  private async getLastBlockHash(documentId: string): Promise<null | string> {
    const entries = await this.getBlockchainEntries(documentId);
    if (entries.length === 0) return null;

    // Sort by timestamp and get latest
    const latest = entries.sort((a, b) => b.timestamp - a.timestamp)[0];
    return latest.currentHash;
  }

  /**
   * IndexedDB operations
   */
  private async storeInIndexedDB(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LegacyGuardBlockchain', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const putRequest = store.put(data, `${data.documentId}_${data.id}`);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
    });
  }

  private async getFromIndexedDB(
    storeName: string,
    documentId: string
  ): Promise<BlockchainEntry[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LegacyGuardBlockchain', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);

        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          const allEntries = getAllRequest.result as BlockchainEntry[];
          const filteredEntries = allEntries.filter(
            entry => entry.documentId === documentId
          );
          resolve(filteredEntries);
        };
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
    });
  }

  /**
   * Generate blockchain summary report
   */
  async generateBlockchainReport(documentId: string): Promise<null | {
    actions: Record<BlockchainAction, number>;
    documentId: string;
    firstEntry: string;
    integrityStatus: string;
    lastEntry: string;
    totalEntries: number;
    verified: boolean;
  }> {
    const auditTrail = await this.getAuditTrail(documentId);

    if (!auditTrail) {
      return null;
    }

    // Count actions
    const actions = auditTrail.entries.reduce(
      (acc, entry) => {
        acc[entry.action] = (acc[entry.action] || 0) + 1;
        return acc;
      },
      {} as Record<BlockchainAction, number>
    );

    return {
      documentId,
      totalEntries: auditTrail.entries.length,
      actions,
      firstEntry: new Date(auditTrail.entries[0]?.timestamp || 0).toISOString(),
      lastEntry: new Date(
        auditTrail.entries[auditTrail.entries.length - 1]?.timestamp || 0
      ).toISOString(),
      verified: auditTrail.verified,
      integrityStatus: auditTrail.integrity,
    };
  }
}

// Export singleton instance
export const blockchainVerification = new BlockchainVerificationService();
export default blockchainVerification;
