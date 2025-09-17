import { logger } from '@schwalbe/shared/lib/logger';

/**
 * API Versioning Strategy
 * Implements semantic versioning with backward compatibility
 *
 * This module provides comprehensive API versioning support including:
 * - Semantic version parsing and comparison
 * - Backward compatibility transformations
 * - Deprecation management
 * - Version negotiation between client and server
 */

export interface ApiVersion {
  /** Major version number - breaking changes */
  major: number;
  /** Minor version number - new features, backward compatible */
  minor: number;
  /** Patch version number - bug fixes, backward compatible */
  patch: number;
}

/**
 * HTTP Client interface for API requests
 */
export interface HttpClient {
  delete(endpoint: string, options?: RequestOptions): Promise<unknown>;
  get(endpoint: string, options?: RequestOptions): Promise<unknown>;
  post(endpoint: string, data?: unknown, options?: RequestOptions): Promise<unknown>;
  put(endpoint: string, data?: unknown, options?: RequestOptions): Promise<unknown>;
}

/**
 * Request options interface
 */
export interface RequestOptions {
  [key: string]: unknown;
  headers?: Record<string, string>;
}

/**
 * API Version Configuration
 * Defines all supported API versions with their semantic version numbers
 */
export const API_VERSIONS = {
  /** Legacy version - maintained for backward compatibility */
  v1: { major: 1, minor: 0, patch: 0 },
  /** Current stable version - recommended for new implementations */
  v2: { major: 2, minor: 0, patch: 0 },
  /** Latest version - may include experimental features */
  current: { major: 2, minor: 1, patch: 0 },
  /** Minimum supported version - clients below this will be rejected */
  minimum: { major: 1, minor: 0, patch: 0 },
} as const;

/**
 * Parse version string to ApiVersion object
 * Supports both v1.2.3 and 1.2.3 formats
 *
 * @param versionString - Version string to parse
 * @returns Parsed ApiVersion object
 * @throws Error if version format is invalid
 */
export function parseVersion(versionString: string): ApiVersion {
  const match = versionString.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid version format: ${versionString}`);
  }

  const [, major, minor, patch] = match;
  return {
    major: parseInt(major || '0', 10),
    minor: parseInt(minor || '0', 10),
    patch: parseInt(patch || '0', 10),
  };
}

/**
 * Format ApiVersion to string
 * Converts ApiVersion object to semantic version string
 *
 * @param version - ApiVersion object to format
 * @returns Semantic version string (e.g., "2.1.0")
 */
export function formatVersion(version: ApiVersion): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

/**
 * Compare two versions
 * Implements semantic version comparison following semver specification
 *
 * @param a - First version to compare
 * @param b - Second version to compare
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareVersions(a: ApiVersion, b: ApiVersion): number {
  if (a.major !== b.major) {
    return a.major < b.major ? -1 : 1;
  }
  if (a.minor !== b.minor) {
    return a.minor < b.minor ? -1 : 1;
  }
  if (a.patch !== b.patch) {
    return a.patch < b.patch ? -1 : 1;
  }
  return 0;
}

/**
 * Check if a version is compatible with requirements
 * Validates version compatibility against minimum and optional maximum version constraints
 *
 * @param version - Version to check
 * @param minimum - Minimum required version (defaults to API_VERSIONS.minimum)
 * @param maximum - Maximum allowed version (optional)
 * @returns true if version is within the compatible range
 */
export function isVersionCompatible(
  version: ApiVersion,
  minimum: ApiVersion = API_VERSIONS.minimum,
  maximum?: ApiVersion
): boolean {
  const minCompare = compareVersions(version, minimum);
  if (minCompare < 0) {
    return false;
  }

  if (maximum) {
    const maxCompare = compareVersions(version, maximum);
    if (maxCompare > 0) {
      return false;
    }
  }

  return true;
}

/**
 * Version-aware API client wrapper
 * Provides client-side API versioning support with automatic compatibility checking
 */
export class VersionedApiClient {
  private version: ApiVersion;
  private acceptVersion: string;

  /**
   * Create a new versioned API client
   *
   * @param version - API version to use (defaults to current)
   */
  constructor(version: ApiVersion = API_VERSIONS.current) {
    this.version = version;
    this.acceptVersion = `application/vnd.legacyguard.v${version.major}+json`;
  }

  /**
   * Get versioned headers for API requests
   * Includes all necessary headers for version negotiation
   *
   * @returns Object containing version-related headers
   */
  getVersionHeaders(): Record<string, string> {
    return {
      'API-Version': formatVersion(this.version),
      Accept: this.acceptVersion,
      'X-API-Version': formatVersion(this.version),
      'X-Min-Version': formatVersion(API_VERSIONS.minimum),
    };
  }

  /**
   * Check if server version is compatible
   * Validates server version against minimum requirements
   *
   * @param serverVersionHeader - Server version from response headers
   * @returns true if server version is compatible
   */
  checkServerVersion(serverVersionHeader: null | string): boolean {
    if (!serverVersionHeader) {
      logger.warn('No server version header found, assuming compatibility');
      return true;
    }

    try {
      const serverVersion = parseVersion(serverVersionHeader);
      return isVersionCompatible(serverVersion, API_VERSIONS.minimum);
    } catch (error) {
      logger.error('Failed to parse server version:', error);
      return false;
    }
  }

  /**
   * Handle version mismatch
   * Provides detailed warnings and error handling for version mismatches
   *
   * @param clientVersion - Client's API version
   * @param serverVersion - Server's API version as string
   * @param response - HTTP response object
   */
  handleVersionMismatch(
    clientVersion: ApiVersion,
    serverVersion: string,
    response: Response
  ): void {
    const serverVer = parseVersion(serverVersion);

    if (compareVersions(clientVersion, serverVer) < 0) {
      logger.warn(
        `Client version (${formatVersion(clientVersion)}) is older than server version (${serverVersion}). ` +
          'Consider updating the client.'
      );
    } else {
      logger.warn(
        `Client version (${formatVersion(clientVersion)}) is newer than server version (${serverVersion}). ` +
          'Some features may not be available.'
      );
    }

    // Check if we need to downgrade the request
    if (response.status === 406) {
      // Not Acceptable
      throw new Error(
        `API version mismatch: Client ${formatVersion(clientVersion)} is not compatible with server ${serverVersion}`
      );
    }
  }
}

/**
 * Version negotiation middleware
 * Handles server-side version negotiation and compatibility checking
 */
export class VersionNegotiator {
  private supportedVersions: ApiVersion[];

  /**
   * Create a new version negotiator
   *
   * @param supportedVersions - List of supported API versions (defaults to v1, v2, current)
   */
  constructor(
    supportedVersions: ApiVersion[] = [
      API_VERSIONS.v1,
      API_VERSIONS.v2,
      API_VERSIONS.current,
    ]
  ) {
    this.supportedVersions = supportedVersions;
  }

  /**
   * Negotiate best version based on client request
   * Implements intelligent version selection with fallback to current
   *
   * @param requestedVersion - Client requested version string
   * @returns Best matching ApiVersion
   */
  negotiate(requestedVersion: null | string): ApiVersion {
    if (!requestedVersion) {
      return API_VERSIONS.current;
    }

    try {
      const requested = parseVersion(requestedVersion);

      // Find exact match
      const exactMatch = this.supportedVersions.find(
        v => compareVersions(v, requested) === 0
      );
      if (exactMatch) {
        return exactMatch;
      }

      // Find best compatible version (same major, highest minor/patch)
      const compatible = this.supportedVersions
        .filter(v => v.major === requested.major)
        .sort((a, b) => compareVersions(b, a))[0];

      if (compatible) {
        return compatible;
      }

      // No compatible version found
      throw new Error(`No compatible version found for ${requestedVersion}`);
    } catch (error) {
      logger.error('Version negotiation failed:', error);
      return API_VERSIONS.current;
    }
  }

  /**
   * Get all supported version strings
   *
   * @returns Array of supported version strings
   */
  getSupportedVersionStrings(): string[] {
    return this.supportedVersions.map(formatVersion);
  }

  /**
   * Check if a version is supported
   *
   * @param version - Version string to check
   * @returns true if version is supported
   */
  isSupported(version: string): boolean {
    try {
      const ver = parseVersion(version);
      return this.supportedVersions.some(v => compareVersions(v, ver) === 0);
    } catch {
      return false;
    }
  }
}

/**
 * Deprecation warning system
 * Manages API deprecation lifecycle with warnings and migration guidance
 */
export class DeprecationManager {
  private deprecations: Map<
    string,
    {
      /** Alternative API or feature to use instead */
      alternative?: string;
      /** Deprecation message explaining why it's deprecated */
      message: string;
      /** Version when this feature was deprecated */
      version: ApiVersion;
    }
  >;

  constructor() {
    this.deprecations = new Map();
  }

  /**
   * Mark an API endpoint or feature as deprecated
   *
   * @param feature - Feature name or endpoint path
   * @param deprecatedInVersion - Version when deprecation occurred
   * @param message - Deprecation explanation message
   * @param alternative - Optional alternative feature/endpoint to use
   */
  deprecate(
    feature: string,
    deprecatedInVersion: ApiVersion,
    message: string,
    alternative?: string
  ): void {
    this.deprecations.set(feature, {
      version: deprecatedInVersion,
      message,
      ...(alternative !== undefined && { alternative }),
    });
  }

  /**
   * Check if a feature is deprecated
   *
   * @param feature - Feature name to check
   * @param currentVersion - Current API version
   * @returns true if feature is deprecated in current version
   */
  isDeprecated(feature: string, currentVersion: ApiVersion): boolean {
    const deprecation = this.deprecations.get(feature);
    if (!deprecation) {
      return false;
    }

    return compareVersions(currentVersion, deprecation.version) >= 0;
  }

  /**
   * Get deprecation warning for a feature
   *
   * @param feature - Feature name to get warning for
   * @returns Formatted deprecation warning or null if not deprecated
   */
  getWarning(feature: string): null | string {
    const deprecation = this.deprecations.get(feature);
    if (!deprecation) {
      return null;
    }

    let warning = `[DEPRECATED] ${feature}: ${deprecation.message}`;
    if (deprecation.alternative) {
      warning += ` Use ${deprecation.alternative} instead.`;
    }
    warning += ` (Deprecated since v${formatVersion(deprecation.version)})`;

    return warning;
  }

  /**
   * Log deprecation warning
   *
   * @param feature - Feature name to warn about
   */
  warn(feature: string): void {
    const warning = this.getWarning(feature);
    if (warning) {
      logger.warn(warning);
    }
  }
}

/**
 * Response transformer for version compatibility
 * Handles automatic response transformation for backward compatibility
 */
export class VersionedResponseTransformer {
  /**
   * Transform response based on client version
   * Automatically applies backward compatibility transformations when needed
   *
   * @param data - Response data to transform
   * @param clientVersion - Client's API version
   * @param serverVersion - Server's API version
   * @returns Transformed data compatible with client version
   */
  static transform<T>(
    data: T,
    clientVersion: ApiVersion,
    serverVersion: ApiVersion
  ): T {
    // If client is older, we might need to transform the response
    if (compareVersions(clientVersion, serverVersion) < 0) {
      return this.backwardTransform(data, clientVersion, serverVersion);
    }

    // If client is newer, response should be compatible
    return data;
  }

  /**
   * Transform response for backward compatibility
   * Applies version-specific transformations based on version differences
   *
   * @param data - Response data to transform
   * @param clientVersion - Client's API version
   * @param serverVersion - Server's API version
   * @returns Transformed data
   */
  private static backwardTransform<T>(
    data: T,
    clientVersion: ApiVersion,
    serverVersion: ApiVersion
  ): T {
    // Version-specific transformations
    if (clientVersion.major === 1 && serverVersion.major === 2) {
      // Transform v2 response to v1 format
      return this.transformV2ToV1(data);
    }

    return data;
  }

  /**
   * Transform v2 response to v1 format
   * Handles field renaming and removal for v1 compatibility
   *
   * @param data - v2 response data
   * @returns v1 compatible response data
   */
  private static transformV2ToV1<T>(data: T): T {
    // Example transformations
    const transformed = { ...data } as Record<string, unknown>;

    // Rename fields that changed between versions
    if ('userId' in transformed && !('user_id' in transformed)) {
      transformed['user_id'] = transformed['userId'];
      delete transformed['userId'];
    }

    // Remove fields that don't exist in v1
    if ('newFeature' in transformed) {
      delete transformed['newFeature'];
    }

    // Transform nested objects recursively
    if (typeof transformed === 'object' && transformed !== null) {
      Object.keys(transformed).forEach(key => {
        if (typeof transformed[key] === 'object' && transformed[key] !== null) {
          transformed[key] = this.transformV2ToV1(transformed[key]);
        }
      });
    }

    return transformed as T;
  }
}

/**
 * Create a versioned API client instance
 * Wraps a base HTTP client with version-aware functionality
 *
 * @param baseClient - Base HTTP client to wrap
 * @param version - API version to use (defaults to current)
 * @returns Versioned client with automatic version handling
 */
export function createVersionedClient(
  baseClient: HttpClient,
  version: ApiVersion = API_VERSIONS.current
): HttpClient {
  const versionClient = new VersionedApiClient(version);
  const deprecationManager = new DeprecationManager();

  // Set up common deprecations
  deprecationManager.deprecate(
    '/api/v1/documents',
    API_VERSIONS.v2,
    'This endpoint is deprecated',
    '/api/v2/documents'
  );

  // Wrap the base client methods
  const wrappedClient = {
    ...baseClient,

    /**
     * GET request with version headers and deprecation checking
     */
    async get(endpoint: string, options?: RequestOptions) {
      // Check for deprecations
      deprecationManager.warn(endpoint);

      // Add version headers
      const headers = {
        ...options?.headers,
        ...versionClient.getVersionHeaders(),
      };

      const response = await baseClient.get(endpoint, { ...options, headers });

      // Check server version
      const responseWithHeaders = response as { headers?: Record<string, string> };
      const serverVersion = responseWithHeaders.headers?.['x-api-version'];
      if (serverVersion && !versionClient.checkServerVersion(serverVersion)) {
        versionClient.handleVersionMismatch(version, serverVersion, response as Response);
      }

      return response;
    },

    /**
     * POST request with version headers and deprecation checking
     */
    async post(endpoint: string, data?: unknown, options?: RequestOptions) {
      deprecationManager.warn(endpoint);

      const headers = {
        ...options?.headers,
        ...versionClient.getVersionHeaders(),
      };

      return baseClient.post(endpoint, data, { ...options, headers });
    },

    /**
     * PUT request with version headers and deprecation checking
     */
    async put(endpoint: string, data?: unknown, options?: RequestOptions) {
      deprecationManager.warn(endpoint);

      const headers = {
        ...options?.headers,
        ...versionClient.getVersionHeaders(),
      };

      return baseClient.put(endpoint, data, { ...options, headers });
    },

    /**
     * DELETE request with version headers and deprecation checking
     */
    async delete(endpoint: string, options?: RequestOptions) {
      deprecationManager.warn(endpoint);

      const headers = {
        ...options?.headers,
        ...versionClient.getVersionHeaders(),
      };

      return baseClient.delete(endpoint, { ...options, headers });
    },
  };

  return wrappedClient;
}

// Classes are already exported above, no need to re-export
