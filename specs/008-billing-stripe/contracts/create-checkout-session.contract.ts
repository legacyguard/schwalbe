/**
 * Create Checkout Session Contract
 *
 * Defines the API contract for the create-checkout-session edge function.
 * This contract ensures consistent request/response handling for checkout session creation.
 */

export interface CreateCheckoutSessionRequest {
  /** Stripe Price ID for the subscription */
  priceId: string;
  /** User ID initiating the checkout */
  userId: string;
  /** URL to redirect to on successful payment */
  successUrl: string;
  /** URL to redirect to if payment is cancelled */
  cancelUrl: string;
  /** Additional metadata to attach to the session */
  metadata?: Record<string, any>;
  /** Whether to allow promotion codes */
  allowPromotionCodes?: boolean;
  /** Trial period in days */
  trialPeriodDays?: number;
  /** Billing address collection mode */
  billingAddressCollection?: 'auto' | 'required';
  /** Customer email (if known) */
  customerEmail?: string;
}

export interface CreateCheckoutSessionResponse {
  /** Stripe checkout session ID */
  sessionId: string;
  /** URL to redirect user to for payment */
  url: string;
  /** Session expiration timestamp */
  expiresAt?: number;
}

export interface CheckoutSessionMetadata {
  /** User ID */
  user_id: string;
  /** Price ID */
  price_id: string;
  /** Plan name */
  plan_name?: string;
  /** Billing cycle */
  billing_cycle?: 'month' | 'year';
  /** Trial period days */
  trial_days?: number;
  /** Source of checkout initiation */
  source?: 'pricing_page' | 'upgrade' | 'trial_ending' | 'api';
  /** Additional custom metadata */
  custom?: Record<string, any>;
}

/**
 * Create Checkout Session API Interface
 *
 * Defines the contract for creating Stripe checkout sessions
 */
export interface ICreateCheckoutSessionAPI {
  /**
   * Create a new checkout session
   */
  createSession(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse>;

  /**
   * Validate checkout session request
   */
  validateRequest(request: CreateCheckoutSessionRequest): ValidationResult;

  /**
   * Get price information for validation
   */
  getPriceInfo(priceId: string): Promise<PriceInfo | null>;

  /**
   * Check if user can create checkout session
   */
  canCreateSession(userId: string, priceId: string): Promise<boolean>;

  /**
   * Get or create Stripe customer
   */
  getOrCreateCustomer(userId: string, email?: string): Promise<string>;
}

export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Warnings */
  warnings: string[];
}

export interface PriceInfo {
  /** Price ID */
  id: string;
  /** Currency */
  currency: string;
  /** Amount in cents */
  unitAmount: number;
  /** Billing interval */
  interval?: 'month' | 'year';
  /** Product name */
  productName: string;
  /** Whether price is active */
  active: boolean;
}

/**
 * Edge Function Handler Interface
 *
 * Defines the contract for the edge function HTTP handler
 */
export interface ICheckoutSessionHandler {
  /**
   * Handle HTTP request
   */
  handleRequest(request: HttpRequest): Promise<HttpResponse>;

  /**
   * Parse and validate request body
   */
  parseRequestBody(body: string): Promise<CreateCheckoutSessionRequest>;

  /**
   * Create Stripe checkout session
   */
  createStripeSession(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse>;

  /**
   * Handle errors and return appropriate responses
   */
  handleError(error: Error): HttpResponse;

  /**
   * Log checkout session creation
   */
  logSessionCreation(request: CreateCheckoutSessionRequest, response: CreateCheckoutSessionResponse): void;
}

export interface HttpRequest {
  /** HTTP method */
  method: string;
  /** Request headers */
  headers: Record<string, string>;
  /** Request body */
  body?: string;
  /** Request URL */
  url: string;
  /** Query parameters */
  query?: Record<string, string>;
}

export interface HttpResponse {
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Response body */
  body: string;
}

/**
 * Error Types for Checkout Session Creation
 */
export class CheckoutSessionError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_REQUEST' | 'PRICE_NOT_FOUND' | 'CUSTOMER_ERROR' | 'STRIPE_ERROR' | 'VALIDATION_ERROR',
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'CheckoutSessionError';
  }
}

export class InvalidPriceError extends CheckoutSessionError {
  constructor(priceId: string) {
    super(
      `Invalid or inactive price: ${priceId}`,
      'PRICE_NOT_FOUND',
      400,
      { priceId }
    );
    this.name = 'InvalidPriceError';
  }
}

export class StripeAPIError extends CheckoutSessionError {
  constructor(message: string, stripeError: any) {
    super(
      `Stripe API error: ${message}`,
      'STRIPE_ERROR',
      500,
      stripeError
    );
    this.name = 'StripeAPIError';
  }
}

/**
 * Request Validation Rules
 */
export const CHECKOUT_SESSION_VALIDATION_RULES = {
  priceId: {
    required: true,
    pattern: /^price_/,
    maxLength: 100
  },
  userId: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  successUrl: {
    required: true,
    pattern: /^https?:\/\//,
    maxLength: 2000
  },
  cancelUrl: {
    required: true,
    pattern: /^https?:\/\//,
    maxLength: 2000
  },
  trialPeriodDays: {
    min: 0,
    max: 730 // 2 years
  },
  metadata: {
    maxKeys: 50,
    maxKeyLength: 40,
    maxValueLength: 500
  }
};

/**
 * Response Caching Strategy
 */
export interface CheckoutSessionCache {
  /**
   * Cache price information
   */
  cachePriceInfo(priceId: string, info: PriceInfo, ttlSeconds: number): Promise<void>;

  /**
   * Get cached price information
   */
  getCachedPriceInfo(priceId: string): Promise<PriceInfo | null>;

  /**
   * Cache customer ID mapping
   */
  cacheCustomerId(userId: string, customerId: string, ttlSeconds: number): Promise<void>;

  /**
   * Get cached customer ID
   */
  getCachedCustomerId(userId: string): Promise<string | null>;
}

/**
 * Monitoring and Analytics
 */
export interface CheckoutSessionAnalytics {
  /**
   * Track session creation
   */
  trackSessionCreated(request: CreateCheckoutSessionRequest, response: CreateCheckoutSessionResponse): void;

  /**
   * Track session creation errors
   */
  trackSessionError(request: CreateCheckoutSessionRequest, error: CheckoutSessionError): void;

  /**
   * Track validation failures
   */
  trackValidationError(request: any, errors: string[]): void;

  /**
   * Get session creation metrics
   */
  getMetrics(): Promise<{
    totalSessions: number;
    successRate: number;
    averageCreationTime: number;
    errorRate: number;
    popularPrices: Array<{ priceId: string; count: number }>;
  }>;
}

/**
 * Factory function type for creating checkout session handlers
 */
export type CheckoutSessionHandlerFactory = (config: {
  stripeSecretKey: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
}) => ICheckoutSessionHandler;