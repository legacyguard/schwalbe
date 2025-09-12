// Emergency Document Download API Contract
// POST /api/emergency/download-document

export interface DocumentAccessRequest {
  token: string;
  document_id: string;
  verification_code?: string;
}

export interface DocumentDownloadResponse {
  success: boolean;
  data: {
    document_id: string;
    document_title: string;
    document_category: string;
    file_type: string;
    download_url: string;
    expires_in: number;
    access_logged: boolean;
  };
}

export interface DocumentDownloadError {
  error: string;
}

// HTTP Status Codes
export const DOCUMENT_DOWNLOAD_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// Error Messages
export const DOCUMENT_DOWNLOAD_ERRORS = {
  TOKEN_REQUIRED: 'Token and document ID are required',
  INVALID_TOKEN: 'Invalid or expired access token',
  TOKEN_EXPIRED: 'Access token has expired',
  INVALID_VERIFICATION: 'Invalid verification code',
  DOCUMENT_NOT_FOUND: 'Document not found or access denied',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to access this document category',
  FILE_NOT_AVAILABLE: 'Document file not available',
  INVALID_FILE_PATH: 'Invalid document file path',
  URL_GENERATION_FAILED: 'Failed to generate download URL',
  INTERNAL_ERROR: 'Internal server error',
} as const;

// Document Categories
export const DOCUMENT_CATEGORIES = {
  HEALTH: 'health',
  MEDICAL: 'medical',
  INSURANCE: 'insurance',
  FINANCIAL: 'financial',
  BANK: 'bank',
  INVESTMENT: 'investment',
  TAX: 'tax',
  LEGAL: 'legal',
  WILL: 'will',
  ESTATE: 'estate',
  PROPERTY: 'property',
  FAMILY: 'family',
  CHILDREN: 'children',
  EDUCATION: 'education',
} as const;

// File Types
export const SUPPORTED_FILE_TYPES = {
  PDF: 'pdf',
  DOC: 'doc',
  DOCX: 'docx',
  TXT: 'txt',
  JPG: 'jpg',
  JPEG: 'jpeg',
  PNG: 'png',
  GIF: 'gif',
} as const;

// Contract Validation
export interface ContractValidation {
  request: DocumentAccessRequest;
  response: DocumentDownloadResponse | DocumentDownloadError;
  status: keyof typeof DOCUMENT_DOWNLOAD_STATUS;
}

// Permission-based Category Access
export interface CategoryPermissions {
  [DOCUMENT_CATEGORIES.HEALTH]: boolean;
  [DOCUMENT_CATEGORIES.MEDICAL]: boolean;
  [DOCUMENT_CATEGORIES.INSURANCE]: boolean;
  [DOCUMENT_CATEGORIES.FINANCIAL]: boolean;
  [DOCUMENT_CATEGORIES.BANK]: boolean;
  [DOCUMENT_CATEGORIES.INVESTMENT]: boolean;
  [DOCUMENT_CATEGORIES.TAX]: boolean;
  [DOCUMENT_CATEGORIES.LEGAL]: boolean;
  [DOCUMENT_CATEGORIES.WILL]: boolean;
  [DOCUMENT_CATEGORIES.ESTATE]: boolean;
  [DOCUMENT_CATEGORIES.PROPERTY]: boolean;
  [DOCUMENT_CATEGORIES.FAMILY]: boolean;
  [DOCUMENT_CATEGORIES.CHILDREN]: boolean;
  [DOCUMENT_CATEGORIES.EDUCATION]: boolean;
}

// Guardian Permissions Mapping
export const GUARDIAN_PERMISSION_MAPPING = {
  can_access_health_docs: [
    DOCUMENT_CATEGORIES.HEALTH,
    DOCUMENT_CATEGORIES.MEDICAL,
    DOCUMENT_CATEGORIES.INSURANCE,
  ],
  can_access_financial_docs: [
    DOCUMENT_CATEGORIES.FINANCIAL,
    DOCUMENT_CATEGORIES.BANK,
    DOCUMENT_CATEGORIES.INVESTMENT,
    DOCUMENT_CATEGORIES.TAX,
  ],
  is_will_executor: [
    DOCUMENT_CATEGORIES.LEGAL,
    DOCUMENT_CATEGORIES.WILL,
    DOCUMENT_CATEGORIES.ESTATE,
    DOCUMENT_CATEGORIES.PROPERTY,
  ],
  is_child_guardian: [
    DOCUMENT_CATEGORIES.FAMILY,
    DOCUMENT_CATEGORIES.CHILDREN,
    DOCUMENT_CATEGORIES.EDUCATION,
  ],
} as const;

// Example Usage
export const exampleRequest: DocumentAccessRequest = {
  token: 'secure-token-abc123',
  document_id: 'doc-456',
  verification_code: '123456',
};

export const exampleResponse: DocumentDownloadResponse = {
  success: true,
  data: {
    document_id: 'doc-456',
    document_title: 'Last Will and Testament',
    document_category: 'legal',
    file_type: 'pdf',
    download_url: 'https://storage.example.com/signed-url/document.pdf?token=xyz789',
    expires_in: 3600,
    access_logged: true,
  },
};

// Audit Log Entry Structure
export interface DocumentAccessAuditLog {
  token_id: string;
  user_id: string;
  guardian_id: string;
  access_type: 'document_download';
  document_id: string;
  document_title: string;
  document_category: string;
  ip_address: string;
  user_agent: string;
  verification_required: boolean;
  verification_provided: boolean;
  success: boolean;
  error_message?: string;
  created_at: string;
}

// Security Headers for Download Response
export const DOWNLOAD_SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'none'; script-src 'none'; object-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
} as const;

// Rate Limiting Rules
export const RATE_LIMIT_RULES = {
  document_download: {
    window_minutes: 15,
    max_requests: 50,
    burst_limit: 10,
  },
  token_verification: {
    window_minutes: 5,
    max_requests: 20,
    burst_limit: 5,
  },
} as const;

// CDN Configuration for Document Delivery
export interface CDNConfig {
  provider: 'cloudflare' | 'aws_cloudfront' | 'google_cdn';
  region: string;
  signed_url_expiry: number; // seconds
  allowed_origins: string[];
  cache_control: {
    max_age: number;
    stale_while_revalidate: number;
  };
}

export const DEFAULT_CDN_CONFIG: CDNConfig = {
  provider: 'cloudflare',
  region: 'us-east-1',
  signed_url_expiry: 3600, // 1 hour
  allowed_origins: ['https://app.legacyguard.com'],
  cache_control: {
    max_age: 300, // 5 minutes
    stale_while_revalidate: 60, // 1 minute
  },
};