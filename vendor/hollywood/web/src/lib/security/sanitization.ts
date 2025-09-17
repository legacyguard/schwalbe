
/**
 * Input Sanitization Utilities
 * Provides functions to sanitize user input and prevent injection attacks
 */

import DOMPurify from 'isomorphic-dompurify';

export interface SanitizationOptions {
  allowedAttributes?: string[];
  allowedTags?: string[];
  allowHTML?: boolean;
  maxLength?: number;
  stripScripts?: boolean;
  stripStyles?: boolean;
}

/**
 * Sanitize string input
 */
export function sanitizeString(
  input: string,
  options: SanitizationOptions = {}
): string {
  const {
    allowHTML = false,
    maxLength = 10000,
    stripScripts = true,
    stripStyles = true,
  } = options;

  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  if (!allowHTML) {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } else {
    // Use DOMPurify for HTML sanitization
      const config = {
        ALLOWED_TAGS: options.allowedTags || [
          'b',
          'i',
          'em',
          'strong',
          'a',
          'p',
          'br',
        ],
        ALLOWED_ATTR: options.allowedAttributes || ['href', 'title'],
        FORBID_TAGS: stripScripts ? ['script', 'style'] : [],
        FORBID_ATTR: stripStyles ? ['style', 'onerror', 'onload', 'onclick'] : [],
      };

    sanitized = DOMPurify.sanitize(sanitized, config) as unknown as string;
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(
    // eslint-disable-next-line no-control-regex
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
    ''
  );

  return sanitized;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T>(
  obj: T,
  options: SanitizationOptions = {}
): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj, options) as T;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options)) as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = sanitizeString(key, { maxLength: 100 });
      // Sanitize value
      sanitized[sanitizedKey] = sanitizeObject(value, options);
    }
    return sanitized as T;
  }

  // For other types, return as is
  return obj;
}

/**
 * Sanitize SQL input to prevent injection
 */
export function sanitizeSQL(input: string): string {
  if (!input) return '';

  // Escape special SQL characters
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/"/g, '""') // Escape double quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t') // Escape tabs
    // eslint-disable-next-line no-control-regex
    .replace(/\x00/g, '') // Remove null bytes
    // eslint-disable-next-line no-control-regex
    .replace(/\x1A/g, ''); // Remove SUB character
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  // Remove path traversal attempts
  let sanitized = filename
    .replace(/\.\./g, '') // Remove ..
    .replace(/[/\\]/g, '') // Remove slashes
    .replace(/^\./, '') // Remove leading dots
    .replace(/\0/g, ''); // Remove null bytes

  // Allow only safe characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || '';
    const name = sanitized.substring(0, 250 - ext.length);
    sanitized = ext ? `${name}.${ext}` : name;
  }

  return sanitized || 'unnamed';
}

/**
 * Sanitize URL to prevent XSS
 */
export function sanitizeURL(url: string): null | string {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // Only allow safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:'];
    if (!safeProtocols.includes(parsed.protocol)) {
      return null;
    }

    // Rebuild URL to ensure it's clean
    return parsed.toString();
  } catch {
    // Invalid URL
    return null;
  }
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): null | string {
  if (!email) return null;

  // Basic email validation and sanitization
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  if (!emailRegex.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): null | string {
  if (!phone) return null;

  // Remove all non-numeric characters except + for international
  const sanitized = phone.replace(/[^\d+]/g, '');

  // Basic validation
  if (sanitized.length < 10 || sanitized.length > 15) {
    return null;
  }

  return sanitized;
}

/**
 * Escape HTML entities
 */
export function escapeHTML(str: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, char => entities[char] ?? char);
}

/**
 * Validate and sanitize JSON
 */
export function sanitizeJSON(jsonString: string): any | null {
  try {
    const parsed = JSON.parse(jsonString);
    return sanitizeObject(parsed);
  } catch {
    return null;
  }
}

/**
 * Rate limit key sanitization
 */
export function sanitizeRateLimitKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9:._-]/g, '_').slice(0, 100);
}
