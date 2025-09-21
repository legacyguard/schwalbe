/**
 * Security utilities for input sanitization and validation
 * Prevents XSS, SQL injection, and other injection attacks
 */

import DOMPurify from 'isomorphic-dompurify';

// HTML sanitization options
const DEFAULT_SANITIZE_OPTIONS = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'target'],
  ALLOW_DATA_ATTR: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string, options = {}): string {
  if (typeof dirty !== 'string') return '';

  const config = { ...DEFAULT_SANITIZE_OPTIONS, ...options };
  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize plain text input (removes all HTML)
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';

  // Remove all HTML tags and decode HTML entities
  const stripped = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });

  // Additional cleanup for common injection patterns
  return stripped
    .replace(/[<>]/g, '') // Remove any remaining angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return '';

  // Remove path traversal patterns and dangerous characters
  return filename
    .replace(/\.\./g, '') // Remove ..
    .replace(/[/\\]/g, '_') // Replace slashes with underscore
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Keep only safe characters
    .substring(0, 255); // Limit length
}

/**
 * Sanitize and validate email address
 */
export function sanitizeEmail(email: string): null | string {
  if (typeof email !== 'string') return null;

  const cleaned = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(cleaned) ? cleaned : null;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';

  // Keep only digits, spaces, and common phone characters
  return phone.replace(/[^0-9+\-() ]/g, '').substring(0, 20);
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): null | string {
  if (typeof url !== 'string') return null;

  const cleaned = url.trim();

  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = cleaned.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return null;
    }
  }

  // Ensure it's a valid URL
  try {
    const urlObj = new URL(cleaned);
    // Only allow http(s) and mailto
    if (!['http:', 'https:', 'mailto:'].includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.toString();
  } catch {
    // If not a valid URL, check if it's a relative path
    if (cleaned.startsWith('/') && !cleaned.includes('//')) {
      return cleaned;
    }
    return null;
  }
}

/**
 * Sanitize JSON string to prevent injection
 */
export function sanitizeJson(jsonString: string): null | object {
  if (typeof jsonString !== 'string') return null;

  try {
    const parsed = JSON.parse(jsonString);
    // Re-stringify to remove any non-JSON content
    return JSON.parse(JSON.stringify(parsed));
  } catch {
    return null;
  }
}

/**
 * Sanitize SQL-like input (for search queries, etc.)
 */
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') return '';

  // Escape SQL special characters
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comment start
    .replace(/\*\//g, '') // Remove multi-line comment end
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|EXEC|EXECUTE)\b/gi, '') // Remove SQL keywords
    .trim();
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(
  input: unknown,
  options: {
    allowFloat?: boolean;
    max?: number;
    min?: number;
  } = {}
): null | number {
  const num = options.allowFloat ? parseFloat(input) : parseInt(input, 10);

  if (isNaN(num)) return null;

  if (options.min !== undefined && num < options.min) return null;
  if (options.max !== undefined && num > options.max) return null;

  return num;
}

/**
 * Sanitize object keys and values recursively
 */
export function sanitizeObject(obj: unknown, maxDepth: number = 10): unknown {
  if (maxDepth <= 0) return null;

  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth - 1));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize the key
      const sanitizedKey = sanitizeText(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeObject(value, maxDepth - 1);
      }
    }
    return sanitized;
  }

  return null;
}

/**
 * Create a content security policy nonce
 */
export function generateCSPNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  options: {
    allowedExtensions?: string[];
    allowedTypes?: string[];
    maxSize?: number; // in bytes
  } = {}
): { error?: string; valid: boolean; } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed`,
      };
    }
  }

  // Additional security check for disguised executables
  const dangerousExtensions = [
    'exe',
    'dll',
    'scr',
    'bat',
    'cmd',
    'com',
    'pif',
    'app',
  ];
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (fileExt && dangerousExtensions.includes(fileExt)) {
    return {
      valid: false,
      error: 'Executable files are not allowed',
    };
  }

  return { valid: true };
}

/**
 * Rate limit key generator for user-specific operations
 */
export function generateRateLimitKey(
  userId: string,
  operation: string
): string {
  return `${sanitizeText(userId)}:${sanitizeText(operation)}:${Date.now()}`;
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, keepChars: number = 4): string {
  if (typeof data !== 'string' || data.length <= keepChars) return '***';

  const visiblePart = data.substring(0, keepChars);
  const maskedPart = '*'.repeat(Math.min(data.length - keepChars, 20));

  return `${visiblePart}${maskedPart}`;
}

// Export all functions as a namespace for convenience
export const Security = {
  sanitizeHtml,
  sanitizeText,
  sanitizeFilename,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeJson,
  sanitizeSqlInput,
  sanitizeNumber,
  sanitizeObject,
  generateCSPNonce,
  validateFile,
  generateRateLimitKey,
  maskSensitiveData,
};
