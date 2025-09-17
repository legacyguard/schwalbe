
/**
 * BackupService - Comprehensive data backup and restore functionality
 * Handles export/import of all user data including localStorage, Supabase, and Clerk metadata
 * Now with encryption support for secure backups
 */

import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import * as nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

// Type definitions for backup data
interface Document {
  [key: string]: unknown;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  id?: string;
  upload_date?: string;
  user_id?: string;
}

interface Guardian {
  [key: string]: unknown;
  email?: string;
  full_name?: string;
  id?: string;
  phone?: string;
  relationship?: string;
  user_id?: string;
}

interface Asset {
  [key: string]: unknown;
  id?: string;
  name?: string;
  type?: string;
  user_id?: string;
  value?: number;
}

interface Person {
  [key: string]: unknown;
  email?: string;
  full_name?: string;
  id?: string;
  phone?: string;
  relationship?: string;
  user_id?: string;
}

interface Will {
  [key: string]: unknown;
  content?: string;
  created_at?: string;
  id?: string;
  title?: string;
  updated_at?: string;
  user_id?: string;
}

interface Settings {
  [key: string]: unknown;
  language?: string;
  notifications?: boolean;
  theme?: string;
}

interface OnboardingResponse {
  [key: string]: unknown;
  id?: string;
  question_id?: string;
  response?: string;
  user_id?: string;
}

interface UserPreferences {
  [key: string]: unknown;
  language?: string;
  notifications?: boolean;
  theme?: string;
}

interface UserProfile {
  [key: string]: unknown;
  created_at?: string;
  email?: string;
  full_name?: string;
  id?: string;
}

// Backup data structure
export interface BackupData {
  exportDate: string;
  localStorage: {
    assets?: Asset[];
    documents?: Document[];
    guardians?: Guardian[];
    people?: Person[];
    settings?: Settings;
    wills?: Will[];
  };
  metadata: {
    appVersion?: string;
    checksum?: string;
    encrypted?: boolean;
    encryptionVersion?: string;
    exportedFrom?: string;
  };
  supabase: {
    customData?: Record<string, any>;
    documents?: Document[];
    guardians?: Guardian[];
    onboardingResponses?: OnboardingResponse[];
  };
  userData: {
    preferences?: UserPreferences;
    profile?: UserProfile;
  };
  userId: string;
  version: string;
}

export interface EncryptedBackupData {
  data: string; // Base64 encoded encrypted data
  encrypted: true;
  encryptionVersion: string;
  metadata: {
    checksum?: string;
    exportDate: string;
    userId: string;
  };
  nonce: string;
  salt: string;
  version: string;
}

export class BackupService {
  private currentVersion = '1.0.0';
  private encryptionVersion = '1.0.0';
  private readonly PBKDF2_ITERATIONS = 100000;

  // Create Supabase client (note: this should be created with proper auth context when used)
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  /**
   * Derive encryption key from password
   */
  private async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const key = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      256 // 32 bytes
    );

    return new Uint8Array(key as ArrayBuffer);
  }

  /**
   * Encrypt backup data
   */
  private async encryptBackupData(
    data: BackupData,
    password: string
  ): Promise<EncryptedBackupData> {
    const salt = nacl.randomBytes(16);
    const nonce = nacl.randomBytes(nacl.secretbox?.nonceLength);
    const key = await this.deriveKey(password, salt);

    const dataString = JSON.stringify(data);
    const dataBytes = new TextEncoder().encode(dataString);
    const encrypted = nacl.secretbox(dataBytes, nonce, key);

    return {
      version: this.currentVersion,
      encrypted: true,
      encryptionVersion: this.encryptionVersion,
      salt: encodeBase64(salt),
      nonce: encodeBase64(nonce),
      data: encodeBase64(encrypted),
      metadata: {
        exportDate: data.exportDate,
        userId: data.userId,
      },
    };
  }

  /**
   * Decrypt backup data
   */
  private async decryptBackupData(
    encryptedData: EncryptedBackupData,
    password: string
  ): Promise<BackupData | null> {
    try {
      // Validate required fields
      if (!encryptedData.salt || !encryptedData?.nonce || !encryptedData.data) {
        console.error('Invalid encrypted backup structure');
        return null;
      }

      const salt = decodeBase64(encryptedData.salt);
      const nonce = decodeBase64(encryptedData?.nonce);
      const encrypted = decodeBase64(encryptedData.data);
      const key = await this.deriveKey(password, salt);

      const decrypted = nacl.secretbox.open(encrypted, nonce, key);

      if (!decrypted) {
        return null;
      }

      const dataString = new TextDecoder().decode(decrypted);
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Export all user data to a JSON backup file
   */
  async exportData(userId: string, password?: string): Promise<void> {
    try {
      toast.info('Preparing your data export...');

      const backupData: BackupData = {
        version: this.currentVersion,
        exportDate: new Date().toISOString(),
        userId,
        userData: await this.exportUserData(userId),
        localStorage: await this.exportLocalStorageData(userId),
        supabase: await this.exportSupabaseData(userId),
        metadata: {
          appVersion: this.currentVersion,
          exportedFrom: window.location.hostname,
          checksum: '',
        },
      };

      // Generate checksum for data integrity
      backupData.metadata.checksum = await this.generateChecksum(backupData);

      // Encrypt if password provided
      let finalData: BackupData | EncryptedBackupData = backupData;
      if (password) {
        backupData.metadata.encrypted = true;
        backupData.metadata.encryptionVersion = this.encryptionVersion;
        finalData = await this.encryptBackupData(backupData, password);
        toast.info('Backup encrypted successfully');
      }

      // Create and download the backup file
      this.downloadBackupFile(finalData, userId);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data. Please try again.');
    }
  }

  /**
   * Import data from a backup file
   */
  async importData(
    file: File,
    userId: string,
    password?: string
  ): Promise<void> {
    try {
      toast.info('Reading backup file...');

      const fileContent = await this.readFile(file);
      let backupData: BackupData;

      // Check if file is encrypted
      const parsedContent = JSON.parse(fileContent);
      if (parsedContent.encrypted) {
        if (!password) {
          toast.error('This backup is encrypted. Please provide the password.');
          throw new Error('Password required for encrypted backup');
        }

        const decrypted = await this.decryptBackupData(
          parsedContent as EncryptedBackupData,
          password
        );
        if (!decrypted) {
          toast.error('Invalid password or corrupted backup file');
          throw new Error('Decryption failed');
        }
        backupData = decrypted;
      } else {
        backupData = parsedContent as BackupData;
      }

      // Validate backup data
      if (!(await this.validateBackupData(backupData, userId))) {
        throw new Error('Invalid backup file or data corruption detected');
      }

      // Check version compatibility
      if (!this.isVersionCompatible(backupData.version)) {
        const proceed = await this.confirmVersionMismatch(backupData.version);
        if (!proceed) return;
      }

      toast.info('Restoring your data...');

      // Import data in order of dependency
      await this.importUserData(backupData.userData, userId);
      await this.importLocalStorageData(backupData.localStorage, userId);
      await this.importSupabaseData(backupData.supabase, userId);

      toast.success('Data restored successfully! Please refresh the page.');

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(
        'Failed to import data. Please check the file and try again.'
      );
    }
  }

  /**
   * Export user profile and preferences
   */
  private async exportUserData(userId: string): Promise<{
    preferences?: UserPreferences;
    profile?: UserProfile;
  }> {
    const userData: {
      preferences?: UserPreferences;
      profile?: UserProfile;
    } = {};

    // Get Clerk user metadata if available
    try {
      // This would integrate with Clerk to get user metadata
      // For now, we'll collect basic data from localStorage
      const preferences = localStorage.getItem(`preferences_${userId}`);
      if (preferences) {
        userData.preferences = JSON.parse(preferences) as UserPreferences;
      }
    } catch (error) {
      console.warn('Could not export user preferences:', error);
    }

    return userData;
  }

  /**
   * Export all localStorage data for the user
   */
  private async exportLocalStorageData(userId: string): Promise<{
    assets?: Asset[];
    documents?: Document[];
    guardians?: Guardian[];
    people?: Person[];
    settings?: Settings;
    taskProgress?: Record<string, any>;
    wills?: Will[];
  }> {
    const localData: {
      assets?: Asset[];
      documents?: Document[];
      guardians?: Guardian[];
      people?: Person[];
      settings?: Settings;
      taskProgress?: Record<string, any>;
      wills?: Will[];
    } = {};

    // Define keys to export
    const keysToExport = [
      `documents_${userId}`,
      `assets_${userId}`,
      `people_${userId}`,
      `wills_${userId}`,
      `guardians_${userId}`,
      `settings_${userId}`,
      `taskProgress_${userId}`,
    ];

    keysToExport.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const keyName = key.replace(`_${userId}`, '') as keyof typeof localData;
          localData[keyName] = JSON.parse(data);
        } catch (error) {
          console.warn(`Could not parse localStorage key ${key}:`, error);
        }
      }
    });

    return localData;
  }

  /**
   * Export Supabase data
   */
  private async exportSupabaseData(userId: string): Promise<{
    customData?: Record<string, any>;
    documents?: Document[];
    guardians?: Guardian[];
    onboardingResponses?: OnboardingResponse[];
  }> {
    const supabaseData: {
      customData?: Record<string, any>;
      documents?: Document[];
      guardians?: Guardian[];
      onboardingResponses?: OnboardingResponse[];
    } = {};

    try {
      // Export documents
      const { data: documents, error: docsError } = await this.supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);

      if (!docsError && documents) {
        supabaseData.documents = documents;
      }

      // Export guardians
      const { data: guardians, error: guardiansError } = await this.supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId);

      if (!guardiansError && guardians) {
        supabaseData.guardians = guardians;
      }

      // Export onboarding responses
      const { data: onboarding, error: onboardingError } = await this.supabase
        .from('onboarding_responses')
        .select('*')
        .eq('user_id', userId);

      if (!onboardingError && onboarding) {
        supabaseData.onboardingResponses = onboarding;
      }
    } catch (error) {
      console.warn('Could not export all Supabase data:', error);
    }

    return supabaseData;
  }

  /**
   * Import user data
   */
  private async importUserData(
    userData: {
      preferences?: UserPreferences;
      profile?: UserProfile;
    },
    userId: string
  ): Promise<void> {
    if (!userData) return;

    try {
      if (userData.preferences) {
        localStorage.setItem(
          `preferences_${userId}`,
          JSON.stringify(userData.preferences)
        );
      }
    } catch (error) {
      console.warn('Could not import user preferences:', error);
    }
  }

  /**
   * Import localStorage data
   */
  private async importLocalStorageData(
    localData: {
      assets?: Asset[];
      documents?: Document[];
      guardians?: Guardian[];
      people?: Person[];
      settings?: Settings;
      taskProgress?: Record<string, any>;
      wills?: Will[];
    },
    userId: string
  ): Promise<void> {
    if (!localData) return;

    Object.entries(localData).forEach(([key, value]) => {
      try {
        localStorage.setItem(`${key}_${userId}`, JSON.stringify(value));
      } catch (error) {
        console.warn(`Could not import localStorage key ${key}:`, error);
      }
    });
  }

  /**
   * Import Supabase data
   */
  private async importSupabaseData(
    supabaseData: {
      customData?: Record<string, any>;
      documents?: Document[];
      guardians?: Guardian[];
      onboardingResponses?: OnboardingResponse[];
    },
    userId: string
  ): Promise<void> {
    if (!supabaseData) return;

    // Import documents (without duplicating)
    if (supabaseData.documents && Array.isArray(supabaseData.documents)) {
      for (const doc of supabaseData.documents) {
        try {
          // Check if document already exists
          const { data: existing } = await this.supabase
            .from('documents')
            .select('id')
            .eq('user_id', userId)
            .eq('file_name', doc.file_name)
            .single();

          if (!existing) {
            // Remove id to let database generate new one
            const { id: _id, ...docData } = doc;
            await this.supabase
              .from('documents')
              .insert({ ...docData, user_id: userId });
          }
        } catch (error) {
          console.warn('Could not import document:', error);
        }
      }
    }

    // Import guardians
    if (supabaseData.guardians && Array.isArray(supabaseData.guardians)) {
      for (const guardian of supabaseData.guardians) {
        try {
          // Check if guardian already exists
          const { data: existing } = await this.supabase
            .from('guardians')
            .select('id')
            .eq('user_id', userId)
            .eq('email', guardian.email)
            .single();

          if (!existing) {
            const { id: _id, ...guardianData } = guardian;
            await this.supabase
              .from('guardians')
              .insert({ ...guardianData, user_id: userId });
          }
        } catch (error) {
          console.warn('Could not import guardian:', error);
        }
      }
    }
  }

  /**
   * Generate checksum for data integrity
   */
  private async generateChecksum(data: BackupData): Promise<string> {
    const dataString = JSON.stringify({
      ...data,
      metadata: { ...data.metadata, checksum: undefined },
    });

    // Simple checksum using btoa and character sum
    const encoded = btoa(dataString);
    let checksum = 0;
    for (let i = 0; i < encoded.length; i++) {
      checksum = (checksum << 5) - checksum + encoded.charCodeAt(i);
      checksum = checksum & checksum;
    }
    return Math.abs(checksum).toString(16);
  }

  /**
   * Validate backup data integrity
   */
  private async validateBackupData(
    data: BackupData,
    userId: string
  ): Promise<boolean> {
    // Check required fields
    if (!data.version || !data.exportDate || !data.userId) {
      toast.error('Invalid backup file format');
      return false;
    }

    // Verify checksum if present
    if (data.metadata?.checksum) {
      const calculatedChecksum = await this.generateChecksum(data);
      if (calculatedChecksum !== data.metadata.checksum) {
        toast.error('Backup file appears to be corrupted');
        return false;
      }
    }

    // Warn if importing data from different user
    if (data.userId !== userId) {
      const proceed = confirm(
        'This backup appears to be from a different user account. ' +
          'Importing it will merge the data with your current account. Continue?'
      );
      return proceed;
    }

    return true;
  }

  /**
   * Check version compatibility
   */
  private isVersionCompatible(backupVersion: string): boolean {
    const [backupMajor] = backupVersion.split('.').map(Number);
    const [currentMajor] = this.currentVersion.split('.').map(Number);
    return backupMajor === currentMajor;
  }

  /**
   * Confirm version mismatch with user
   */
  private async confirmVersionMismatch(
    backupVersion: string
  ): Promise<boolean> {
    return confirm(
      `This backup was created with version ${backupVersion}, ` +
        `but you're currently using version ${this.currentVersion}. ` +
        `The import might not work correctly. Continue anyway?`
    );
  }

  /**
   * Read file content as text
   */
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * Download backup file
   */
  private downloadBackupFile(
    data: BackupData | EncryptedBackupData,
    _userId: string
  ): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    const filename = `legacyguard-backup-${date}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get backup file size estimate
   */
  async estimateBackupSize(userId: string): Promise<string> {
    const localData = await this.exportLocalStorageData(userId);
    const size = new Blob([JSON.stringify(localData)]).size;

    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Clear all user data (use with caution!)
   */
  async clearAllData(userId: string): Promise<void> {
    const confirmed = confirm(
      'WARNING: This will delete ALL your local data. ' +
        'Make sure you have a backup before proceeding. Continue?'
    );

    if (!confirmed) return;

    const doubleConfirmed = confirm(
      'Are you absolutely sure? This action cannot be undone!'
    );

    if (!doubleConfirmed) return;

    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(userId)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    toast.success('All local data has been cleared');
  }
}

// Export singleton instance
export const backupService = new BackupService();
