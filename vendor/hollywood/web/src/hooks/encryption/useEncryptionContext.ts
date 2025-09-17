
import { useContext } from 'react';

interface EncryptionContextValue {
  checkEncryptionStatus: () => Promise<void>;
  decryptData: (
    encryptedData: string,
    iv: string,
    salt?: string
  ) => Promise<ArrayBuffer | null>;
  encryptData: (data: ArrayBuffer | string) => Promise<unknown>;
  encryptFile: (file: File) => Promise<unknown>;
  generateSecureToken: () => string;
  hashPassword: (password: string) => Promise<string>;
  hasKey: boolean;
  initializeEncryption: (password: string) => Promise<boolean>;
  isInitialized: boolean;
  isLocked: boolean;
  lockEncryption: () => void;
}

// This context is defined in EncryptionProvider.tsx
declare const EncryptionContext: React.Context<
  EncryptionContextValue | undefined
>;

export function useEncryptionContext() {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error(
      'useEncryptionContext must be used within an EncryptionProvider'
    );
  }
  return context;
}
