
import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';

// For MVP, we'll use a derived key from user's Clerk ID
// In production, this should be derived from a user password or master key
export const generateEncryptionKeys = () => {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
  };
};

// Get or create encryption keys for the current user
export const getUserEncryptionKeys = (userId: string) => {
  const storageKey = `encryption_keys_${userId}`;

  // Check if keys exist in localStorage
  const storedKeys = localStorage.getItem(storageKey);

  if (storedKeys) {
    return JSON.parse(storedKeys);
  }

  // Generate new keys if they don't exist
  const newKeys = generateEncryptionKeys();
  localStorage.setItem(storageKey, JSON.stringify(newKeys));

  return newKeys;
};

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

// Convert ArrayBuffer to base64
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer as ArrayBuffer);
  return encodeBase64(bytes);
};

// Encrypt file content
export const encryptFile = async (
  file: File,
  publicKey: string,
  secretKey: string
): Promise<{
  encryptedData: Uint8Array;
  metadata: Record<string, number | string>;
  nonce: Uint8Array;
}> => {
  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(arrayBuffer as ArrayBuffer);

  // Generate nonce
  const nonce = nacl.randomBytes(nacl.box?.nonceLength);

  // Create ephemeral key pair for this encryption
  const ephemeralKeyPair = nacl.box.keyPair();

  // Encrypt the file data
  const encryptedData = nacl.box(
    fileData,
    nonce,
    decodeBase64(publicKey),
    decodeBase64(secretKey)
  );

  // Store metadata for decryption
  const metadata = {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    encryptedAt: new Date().toISOString(),
    nonce: encodeBase64(nonce),
    ephemeralPublicKey: encodeBase64(ephemeralKeyPair.publicKey),
  };

  return {
    encryptedData,
    nonce,
    metadata,
  };
};

// Decrypt file content
export const decryptFile = (
  encryptedData: Uint8Array,
  nonce: Uint8Array,
  publicKey: string,
  secretKey: string
): null | Uint8Array => {
  try {
    const decrypted = nacl.box.open(
      encryptedData,
      nonce,
      decodeBase64(publicKey),
      decodeBase64(secretKey)
    );

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Create encrypted blob for upload
export const createEncryptedBlob = (
  encryptedData: Uint8Array,
  nonce: Uint8Array
): Blob => {
  // Combine nonce and encrypted data
  const combined = new Uint8Array(nonce.length + encryptedData.length);
  combined.set(nonce);
  combined.set(encryptedData, nonce.length);

  return new Blob([combined], { type: 'application/octet-stream' });
};
