
/**
 * Multi-Factor Authentication Service for LegacyGuard
 * Supports FIDO2/WebAuthn, TOTP, SMS, and biometric authentication
 */

import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

export interface MFADevice {
  createdAt: string;
  credentialId?: string; // For WebAuthn
  id: string;
  isActive: boolean;
  isBackup: boolean;
  lastUsedAt?: string;
  name: string;
  phoneNumber?: string; // For SMS
  publicKey?: string; // For WebAuthn
  secret?: string; // For TOTP (encrypted)
  type: 'biometric' | 'sms' | 'totp' | 'webauthn';
}

export interface MFAChallenge {
  attempts: number;
  challenge: string;
  challengeId: string;
  expiresAt: string;
  maxAttempts: number;
  type: 'biometric' | 'sms' | 'totp' | 'webauthn';
}

export interface BiometricCapabilities {
  availableAuthenticators: string[];
  isSupported: boolean;
  platformAuthenticator: boolean;
  userVerification: 'discouraged' | 'preferred' | 'required';
}

export interface MFAConfig {
  allowedMethods: ('biometric' | 'sms' | 'totp' | 'webauthn')[];
  backupCodesCount: number;
  requireMFA: boolean;
  smsProvider?: 'aws-sns' | 'twilio';
  totpIssuer: string;
}

class MultiFactorAuthService {
  private readonly RP_NAME = 'LegacyGuard';
  private readonly RP_ID = 'legacyguard.cz';
  private readonly CHALLENGE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_ATTEMPTS = 3;

  /**
   * Check if WebAuthn is supported by the browser
   */
  async isWebAuthnSupported(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    return !!(
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential === 'function' &&
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
    );
  }

  /**
   * Check biometric capabilities
   */
  async getBiometricCapabilities(): Promise<BiometricCapabilities> {
    const isSupported = await this.isWebAuthnSupported();

    if (!isSupported) {
      return {
        isSupported: false,
        availableAuthenticators: [],
        platformAuthenticator: false,
        userVerification: 'discouraged',
      };
    }

    try {
      const platformAuthenticator =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

      return {
        isSupported: true,
        availableAuthenticators: platformAuthenticator
          ? ['platform', 'cross-platform']
          : ['cross-platform'],
        platformAuthenticator,
        userVerification: platformAuthenticator ? 'required' : 'preferred',
      };
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      return {
        isSupported: false,
        availableAuthenticators: [],
        platformAuthenticator: false,
        userVerification: 'discouraged',
      };
    }
  }

  /**
   * Register a new WebAuthn/FIDO2 device
   */
  async registerWebAuthnDevice(
    userId: string,
    deviceName: string,
    requireBiometric = false
  ): Promise<MFADevice> {
    if (!(await this.isWebAuthnSupported())) {
      throw new Error('WebAuthn not supported by this browser');
    }

    // Generate registration options
    const options: PublicKeyCredentialCreationOptionsJSON = {
      rp: {
        name: this.RP_NAME,
        id: this.RP_ID,
      },
      user: {
        id: btoa(userId),
        name: userId,
        displayName: deviceName,
      },
      challenge: this.generateChallenge(),
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      timeout: 60000,
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: requireBiometric ? 'platform' : undefined,
        userVerification: requireBiometric ? 'required' : 'preferred',
        requireResidentKey: false,
      },
      excludeCredentials: [], // TODO: Get existing credentials from server
    };

    try {
      const registrationResponse = await startRegistration({
        optionsJSON: options,
      });

      // Verify registration on server
      const verified = await this.verifyRegistration(
        registrationResponse,
        options
      );

      if (!verified) {
        throw new Error('Registration verification failed');
      }

      const device: MFADevice = {
        id: this.generateId(),
        name: deviceName,
        type: requireBiometric ? 'biometric' : 'webauthn',
        credentialId: registrationResponse.id,
        publicKey: registrationResponse.response.publicKey || '',
        isBackup: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      return device;
    } catch (error) {
      console.error('WebAuthn registration failed:', error);
      throw new Error('Failed to register security key');
    }
  }

  /**
   * Authenticate with WebAuthn/FIDO2 device
   */
  async authenticateWebAuthn(
    allowedCredentials: string[] = []
  ): Promise<boolean> {
    if (!(await this.isWebAuthnSupported())) {
      throw new Error('WebAuthn not supported by this browser');
    }

    const options: PublicKeyCredentialRequestOptionsJSON = {
      challenge: this.generateChallenge(),
      timeout: 60000,
      rpId: this.RP_ID,
      allowCredentials: allowedCredentials.map(id => ({
        id,
        type: 'public-key',
        transports: ['usb', 'nfc', 'ble', 'internal'],
      })),
      userVerification: 'preferred',
    };

    try {
      const authResponse = await startAuthentication({ optionsJSON: options });

      // Verify authentication on server
      const verified = await this.verifyAuthentication(authResponse, options);

      return verified;
    } catch (error) {
      console.error('WebAuthn authentication failed:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Setup TOTP authentication
   */
  async setupTOTP(
    userId: string,
    serviceName: string = 'LegacyGuard'
  ): Promise<{
    backupCodes: string[];
    qrCodeUrl: string;
    secret: string;
  }> {
    // Generate a random secret
    const secret = new OTPAuth.Secret();

    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer: serviceName,
      label: userId,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    });

    // Generate QR code URL
    const qrCodeDataUrl = await QRCode.toDataURL(totp.toString());

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(8);

    return {
      secret: secret.base32,
      qrCodeUrl: qrCodeDataUrl,
      backupCodes,
    };
  }

  /**
   * Verify TOTP token
   */
  verifyTOTP(token: string, secret: string): boolean {
    try {
      const totp = new OTPAuth.TOTP({
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      // Allow for clock skew (±1 period)
      const currentTime = Date.now();
      const window = 1;

      for (let i = -window; i <= window; i++) {
        const timeOffset = currentTime + i * 30 * 1000;
        if (totp.generate({ timestamp: timeOffset }) === token) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('TOTP verification failed:', error);
      return false;
    }
  }

  /**
   * Request SMS authentication
   */
  async requestSMSAuth(phoneNumber: string): Promise<MFAChallenge> {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const challenge: MFAChallenge = {
      challengeId: this.generateId(),
      type: 'sms',
      challenge: code,
      expiresAt: new Date(Date.now() + this.CHALLENGE_TIMEOUT).toISOString(),
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
    };

    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    // await this.sendSMS(phoneNumber, `Your LegacyGuard verification code: ${code}`);

    console.log(`SMS verification code for ${phoneNumber}: ${code}`);

    return challenge;
  }

  /**
   * Verify SMS code
   */
  verifySMSCode(challenge: MFAChallenge, code: string): boolean {
    if (challenge.attempts >= challenge.maxAttempts) {
      throw new Error('Maximum verification attempts exceeded');
    }

    if (new Date(challenge.expiresAt) < new Date()) {
      throw new Error('Verification code has expired');
    }

    challenge.attempts++;

    return challenge.challenge === code;
  }

  /**
   * Register biometric authentication
   */
  async registerBiometric(userId: string): Promise<MFADevice> {
    const capabilities = await this.getBiometricCapabilities();

    if (!capabilities.isSupported || !capabilities.platformAuthenticator) {
      throw new Error('Biometric authentication not supported on this device');
    }

    return this.registerWebAuthnDevice(
      userId,
      'Biometric Authentication',
      true
    );
  }

  /**
   * Authenticate with biometrics
   */
  async authenticateBiometric(credentialId: string): Promise<boolean> {
    const capabilities = await this.getBiometricCapabilities();

    if (!capabilities.isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    return this.authenticateWebAuthn([credentialId]);
  }

  /**
   * Generate backup recovery codes
   */
  generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = Array.from(
        { length: 8 },
        () =>
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');

      // Format as XXXX-XXXX
      const formattedCode = `${code.slice(0, 4)}-${code.slice(4)}`;
      codes.push(formattedCode);
    }

    return codes;
  }

  /**
   * Validate MFA setup completeness
   */
  async validateMFASetup(
    devices: MFADevice[],
    config: MFAConfig
  ): Promise<{
    isValid: boolean;
    missingFactors: string[];
    recommendations: string[];
  }> {
    const activeDevices = devices.filter(d => d.isActive);
    const deviceTypes = new Set(activeDevices.map(d => d.type));

    const missingFactors: string[] = [];
    const recommendations: string[] = [];

    // Check required factors
    if (config.requireMFA && activeDevices.length === 0) {
      missingFactors.push('At least one authentication factor required');
    }

    // Check for backup methods
    const hasBackup = activeDevices.some(d => d.isBackup);
    if (!hasBackup && activeDevices.length === 1) {
      recommendations.push('Add a backup authentication method');
    }

    // Recommend hardware security keys
    if (!deviceTypes.has('webauthn') && !deviceTypes.has('biometric')) {
      recommendations.push(
        'Consider adding a hardware security key for enhanced security'
      );
    }

    // Recommend biometric if available
    const biometricCapabilities = await this.getBiometricCapabilities();
    if (
      biometricCapabilities.platformAuthenticator &&
      !deviceTypes.has('biometric')
    ) {
      recommendations.push('Enable biometric authentication for convenience');
    }

    return {
      isValid: missingFactors.length === 0,
      missingFactors,
      recommendations,
    };
  }

  /**
   * Private helper methods
   */
  private generateChallenge(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private async verifyRegistration(
    registrationResponse: RegistrationResponseJSON,
    options: PublicKeyCredentialCreationOptionsJSON
  ): Promise<boolean> {
    // TODO: Implement server-side verification
    // This would typically involve:
    // 1. Verify the challenge matches
    // 2. Verify the origin matches
    // 3. Verify the attestation
    // 4. Store the credential

    console.log('Registration response:', registrationResponse);
    console.log('Registration options:', options);

    // For now, return true (in production, this must be properly implemented)
    return true;
  }

  private async verifyAuthentication(
    authResponse: AuthenticationResponseJSON,
    options: PublicKeyCredentialRequestOptionsJSON
  ): Promise<boolean> {
    // TODO: Implement server-side verification
    // This would typically involve:
    // 1. Verify the challenge matches
    // 2. Verify the origin matches
    // 3. Verify the signature against the stored public key
    // 4. Update the sign count

    console.log('Authentication response:', authResponse);
    console.log('Authentication options:', options);

    // For now, return true (in production, this must be properly implemented)
    return true;
  }
}

// Export singleton instance
export const multiFactorAuth = new MultiFactorAuthService();
export default multiFactorAuth;
