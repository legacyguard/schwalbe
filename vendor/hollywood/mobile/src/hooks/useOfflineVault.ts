// src/hooks/useOfflineVault.ts
/* global __DEV__ */
import { useCallback, useEffect, useState } from 'react';
import { OfflineVaultService } from '@/services/OfflineVaultService';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY_NAME = 'offline_vault_key';

interface VaultDocument {
  content: string;
  documentType: string;
  fileName: string;
  fileSize?: number;
  id: string;
  tags?: string[];
  uploadedAt?: Date;
}

interface UseOfflineVaultReturn {
  addDocument: (doc: VaultDocument) => Promise<void>;
  clearVault: () => Promise<void>;
  documentCount: number;
  documents: VaultDocument[];
  error: null | string;
  getDocument: (id: string) => Promise<null | VaultDocument>;
  isAvailable: boolean; // Added for compatibility
  isLoading: boolean;
  isVaultOpen: boolean;
  loadDocuments: () => Promise<void>;
  offlineDocuments: VaultDocument[]; // Alias for compatibility
  removeDocument: (id: string) => Promise<void>;
  syncWithCloud: () => Promise<void>;
  totalSize: number;
}

export const useOfflineVault = (): UseOfflineVaultReturn => {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [stats, setStats] = useState({ documentCount: 0, totalSize: 0 });

  /**
   * Generate or retrieve encryption key
   */
  const getOrCreateEncryptionKey =
    useCallback(async (): Promise<Uint8Array> => {
      try {
        let keyHex = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);

        if (!keyHex) {
          // Generate a new 64-byte key
          const randomBytes = await Crypto.getRandomBytesAsync(64);
          keyHex = Array.from(randomBytes)
            .map((b: number) => b.toString(16).padStart(2, '0'))
            .join('');

          await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, keyHex);
          // New encryption key generated and stored
        }

        // Convert hex string to Uint8Array
        const keyBytes = new Uint8Array(64);
        for (let i = 0; i < 64; i++) {
          keyBytes[i] = parseInt(keyHex.substr(i * 2, 2), 16);
        }

        return keyBytes;
      } catch (_error) {
        // Failed to get/create encryption key
        throw new Error('Failed to initialize encryption');
      }
    }, []);

  /**
   * Initialize vault on hook mount
   */
  useEffect(() => {
    const initializeVault = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const _encryptionKey = await getOrCreateEncryptionKey();
        await OfflineVaultService.open();
        setIsVaultOpen(true);

        // Load initial documents
        const docs = await OfflineVaultService.getDocuments();
        setDocuments(docs);

        const vaultStats = await OfflineVaultService.getStats();
        setStats({
          documentCount: vaultStats.documentCount,
          totalSize: vaultStats.totalSize,
        });
      } catch (_error) {
        // Failed to initialize vault
        setError(
          error instanceof Error ? error.message : 'Failed to open vault'
        );
        setIsVaultOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeVault();

    // Cleanup on unmount
    return () => {
      OfflineVaultService.close();
    };
  }, [getOrCreateEncryptionKey]);

  /**
   * Load all documents from vault
   */
  const loadDocuments = useCallback(async () => {
    if (!isVaultOpen && !OfflineVaultService.isOpen()) {
      // Vault is not open
      return;
    }

    try {
      const docs = await OfflineVaultService.getDocuments();
      setDocuments(docs);

      const vaultStats = await OfflineVaultService.getStats();
      setStats({
        documentCount: vaultStats.documentCount,
        totalSize: vaultStats.totalSize,
      });
    } catch (_error) {
      if (__DEV__) console.error('Failed to load documents:', error);
      setError('Failed to load documents');
    }
  }, [isVaultOpen]);

  /**
   * Add document to vault
   */
  const addDocument = useCallback(
    async (doc: VaultDocument) => {
      if (!isVaultOpen) {
        throw new Error('Vault is not open');
      }

      try {
        await OfflineVaultService.addDocument(doc);
        await loadDocuments(); // Reload to update list
        if (__DEV__) console.log(`Document ${doc.fileName} added successfully`);
      } catch (_error) {
        if (__DEV__) console.error('Failed to add document:', error);
        throw error;
      }
    },
    [isVaultOpen, loadDocuments]
  );

  /**
   * Remove document from vault
   */
  const removeDocument = useCallback(
    async (id: string) => {
      if (!isVaultOpen) {
        throw new Error('Vault is not open');
      }

      try {
        const success = await OfflineVaultService.removeDocument(id);
        if (success) {
          await loadDocuments(); // Reload to update list
          if (__DEV__) console.log(`Document ${id} removed successfully`);
        }
      } catch (_error) {
        if (__DEV__) console.error('Failed to remove document:', error);
        throw error;
      }
    },
    [isVaultOpen, loadDocuments]
  );

  /**
   * Get single document by ID
   */
  const getDocument = useCallback(
    async (id: string): Promise<null | VaultDocument> => {
      if (!isVaultOpen) {
        throw new Error('Vault is not open');
      }

      try {
        return await OfflineVaultService.getDocument(id);
      } catch (_error) {
        if (__DEV__) console.error('Failed to get document:', error);
        throw error;
      }
    },
    [isVaultOpen]
  );

  /**
   * Clear all documents from vault
   */
  const clearVault = useCallback(async () => {
    if (!isVaultOpen) {
      throw new Error('Vault is not open');
    }

    try {
      await OfflineVaultService.clearAll();
      await loadDocuments(); // Reload to update list
      if (__DEV__) console.log('Vault cleared successfully');
    } catch (_error) {
      if (__DEV__) console.error('Failed to clear vault:', error);
      throw error;
    }
  }, [isVaultOpen, loadDocuments]);

  /**
   * Sync documents with cloud (placeholder)
   */
  const syncWithCloud = useCallback(async () => {
    if (!isVaultOpen) {
      throw new Error('Vault is not open');
    }

    try {
      // TODO: Implement cloud sync
      // 1. Get list of documents from API
      // 2. Compare with local documents
      // 3. Download new/updated documents
      // 4. Upload local-only documents
      if (__DEV__) console.log('Cloud sync not yet implemented');
    } catch (_error) {
      if (__DEV__) console.error('Failed to sync with cloud:', error);
      throw error;
    }
  }, [isVaultOpen]);

  return {
    isVaultOpen,
    isLoading,
    error,
    documents,
    offlineDocuments: documents, // Alias for compatibility
    documentCount: stats.documentCount,
    totalSize: stats.totalSize,
    isAvailable: isVaultOpen && !isLoading, // Added for compatibility
    loadDocuments,
    addDocument,
    removeDocument,
    getDocument,
    clearVault,
    syncWithCloud,
  };
};
