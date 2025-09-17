# Encryption Migration & Unification Guide

## Overview

The LegacyGuard codebase has been unified to use a single encryption standard across all packages: **TweetNaCl** (specifically `nacl.secretbox` for symmetric encryption using XSalsa20-Poly1305).

## What Changed

### Before (3 Different Systems)

The codebase previously had three inconsistent encryption implementations:

1. **WebCrypto API (AES-GCM)** - Used in `packages/shared/src/services/encryption.service.ts` and `src/lib/security/encryption.ts`
2. **TweetNaCl** - Used in `src/lib/encryption.ts`, `lib/encryption-v2.ts`, and `src/lib/security/zeroKnowledgeEncryption.ts`  
3. **Placeholder/Base64** - Used in `mobile/src/services/OfflineVaultService.ts`

### After (Unified TweetNaCl)

All encryption now uses TweetNaCl across the monorepo:

- **Shared Service**: `packages/shared/src/services/encryption.service.ts` - Core unified service
- **Web App**: `src/lib/security/encryption.ts` - Uses TweetNaCl with context-specific keys
- **Mobile App**: `mobile/src/services/OfflineVaultService.ts` - Uses TweetNaCl with per-device key stored in Expo SecureStore

## Migration Guide

### For Existing Code

#### 1. Import the Unified Service

```typescript
// Old (various imports)
import { encrypt, decrypt } from './some-encryption-file';
import CryptoJS from 'crypto-js';

// New (unified)
import { encryptionService } from '@hollywood/shared';
```

#### 2. Initialize with Password

```typescript
// Initialize encryption with a password
const { saltB64 } = await encryptionService.initializeWithPassword('user-password');
// Store saltB64 for future sessions
```

#### 3. Encrypt Data

```typescript
const encrypted = await encryptionService.encrypt('sensitive data');
// Returns: { data: string, iv: string, algorithm: 'nacl.secretbox' }
```

#### 4. Decrypt Data

```typescript
const plaintext = await encryptionService.decrypt(encrypted);
```

### For Mobile (React Native)

The mobile app now uses a per-device key stored securely in the device keychain:

```typescript
// Automatically managed in OfflineVaultService.ts
const encryptedContent = await encryptContent('document content');
const decryptedContent = await decryptContent(encryptedContent);
```

### For Web Components

The web app maintains backward compatibility while using TweetNaCl internally:

```typescript
import { encryptionService, secureStorage } from '@/lib/security/encryption';

// Use secureStorage for automatic encryption
await secureStorage.setItem('key', value);
const value = await secureStorage.getItem('key');
```

## Data Migration

### Existing Encrypted Data

Data encrypted with the old systems needs to be migrated. A migration strategy:

1. **Detect old format** - Check for algorithm field or encryption metadata
2. **Decrypt with old method** - Keep legacy decryption functions temporarily
3. **Re-encrypt with new method** - Use unified TweetNaCl service
4. **Update metadata** - Mark as migrated

Example migration function:

```typescript
async function migrateEncryptedData(oldData: any) {
  // Detect old AES-GCM format
  if (oldData.algorithm === 'AES-GCM') {
    const plaintext = await legacyDecryptAESGCM(oldData);
    return await encryptionService.encrypt(plaintext);
  }
  // Already migrated
  if (oldData.algorithm === 'nacl.secretbox') {
    return oldData;
  }
  // Handle other formats...
}
```

## Security Considerations

### Algorithm Details

- **Algorithm**: XSalsa20-Poly1305 (via nacl.secretbox)
- **Key Size**: 256 bits (32 bytes)
- **Nonce Size**: 192 bits (24 bytes)
- **Authentication**: Built-in AEAD with Poly1305

### Key Management

- **Web**: Keys derived from user passwords using PBKDF2 (100,000 iterations)
- **Mobile**: Per-device keys stored in platform secure storage (iOS Keychain/Android Keystore)
- **Server**: Keys never stored in plaintext, only encrypted forms

### Best Practices

1. Always use different nonces for each encryption (handled automatically)
2. Store salts alongside encrypted data for password-based keys
3. Use context-specific keys for field-level encryption
4. Implement key rotation policies for long-lived keys

## Testing

Run the unified encryption tests:

```bash
# Test shared service
cd packages/shared
npm test src/services/__tests__/encryption.service.test.ts

# Test web implementation
cd ../..
npm test src/lib/__tests__/encryption.test.ts

# Test mobile implementation
cd mobile
npm test
```

## Breaking Changes

### Removed Dependencies

- ❌ `crypto-js` - No longer needed
- ❌ Custom AES implementations

### API Changes

- `generateKey()` → `initializeWithPassword()`
- `encrypt(data)` returns `{ data, iv, algorithm }` instead of `{ encrypted, nonce }`
- Field `iv` used instead of `nonce` for backward compatibility

## Benefits of Unification

1. **Consistency**: Same encryption across web, mobile, and server
2. **Security**: Battle-tested NaCl library with AEAD
3. **Performance**: Optimized C implementation with JS bindings
4. **Simplicity**: Single API to learn and maintain
5. **Compliance**: Meets WARP.md security requirements

## Support

For questions or issues with the migration, refer to:

- WARP.md for project requirements
- packages/shared/src/services/**tests**/encryption.service.test.ts for usage examples
- This document for migration guidance

## Rollback Plan

If issues arise, the old encryption methods are preserved in git history at commit [previous-commit-hash]. However, rollback is not recommended as it would reintroduce security inconsistencies.
