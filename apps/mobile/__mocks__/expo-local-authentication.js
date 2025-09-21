module.exports = {
  hasHardwareAsync: async () => true,
  isEnrolledAsync: async () => true,
  supportedAuthenticationTypesAsync: async () => [1],
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 },
  authenticateAsync: async () => ({ success: true }),
};