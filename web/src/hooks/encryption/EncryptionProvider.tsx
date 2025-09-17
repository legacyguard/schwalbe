
import _React, { createContext, type ReactNode, useContext } from 'react';
import { useEncryption } from '../useEncryption';

interface EncryptionContextValue {
  checkEncryptionStatus: () => Promise<void>;
  decryptData: (
    encryptedData: string,
    iv: string,
    salt?: string
  ) => Promise<ArrayBuffer | null>;
  encryptData: (data: ArrayBuffer | string) => Promise<any>;
  encryptFile: (file: File) => Promise<any>;
  generateSecureToken: () => string;
  hashPassword: (password: string) => Promise<string>;
  hasKey: boolean;
  hidePasswordPrompt: () => void;
  initializeEncryption: (password: string) => Promise<boolean>;
  initializeKeys: (password: string) => Promise<boolean>;
  isInitialized: boolean;
  isLoading: boolean;
  isLocked: boolean;
  isUnlocked: boolean;
  lockEncryption: () => void;
  migrateKeys: (password: string) => Promise<boolean>;
  needsMigration: boolean;
  passwordPromptVisible: boolean;
  showPasswordPrompt: () => Promise<boolean>;
  unlockKeys: (password: string) => Promise<boolean>;
}

const EncryptionContext = createContext<EncryptionContextValue | undefined>(
  undefined
);

export function EncryptionProvider({ children }: { children: ReactNode }) {
  const encryption = useEncryption();

  return (
    <EncryptionContext.Provider value={encryption}>
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryptionContext() {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error(
      'useEncryptionContext must be used within an EncryptionProvider'
    );
  }
  return context;
}
