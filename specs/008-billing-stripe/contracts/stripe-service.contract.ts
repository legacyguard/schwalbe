/**
 * Stripe Service Contract
 *
 * Defines the interface for Stripe payment processing operations.
 * This contract ensures consistent implementation across different environments.
 */

export interface StripeServiceConfig {
  /** Stripe API key */
  apiKey: string;
  /** API version to use */
  apiVersion: string;
  /** Maximum network retries */
  maxRetries: number;
  /** Request timeout in milliseconds */
  timeout: number;
}

export interface CustomerData {
  /** Customer email address */
  email: string;
  /** Customer name (optional) */
  name?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
}

export interface PaymentMethodData {
  /** Payment method ID */
  id: string;
  /** Payment method type */
  type: 'card' | 'bank_account';
  /** Last 4 digits of card/bank account */
  last4: string;
  /** Card brand (for card payments) */
  brand?: string;
  /** Whether this is the default payment method */
  isDefault: boolean;
}

export interface CheckoutSessionData {
  /** Price ID for the subscription */
  priceId: string;
  /** User ID creating the session */
  userId: string;
  /** Success URL after payment */
  successUrl: string;
  /** Cancel URL if payment is cancelled */
  cancelUrl: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface SubscriptionData {
  /** Customer ID */
  customerId: string;
  /** Price ID */
  priceId: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
}

export interface StripeServiceResponse<T> {
  /** Response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Error message (if any) */
  error?: string;
}

/**
 * Stripe Service Interface
 *
 * Defines the contract for Stripe payment operations
 */
export interface IStripeService {
  /**
   * Initialize the Stripe service with configuration
   */
  initialize(config: StripeServiceConfig): void;

  /**
   * Create a new Stripe customer
   */
  createCustomer(data: CustomerData): Promise<StripeServiceResponse<string>>;

  /**
   * Retrieve customer information
   */
  getCustomer(customerId: string): Promise<StripeServiceResponse<CustomerData & { id: string }>>;

  /**
   * Update customer information
   */
  updateCustomer(customerId: string, data: Partial<CustomerData>): Promise<StripeServiceResponse<void>>;

  /**
   * Create a checkout session for subscription
   */
  createCheckoutSession(data: CheckoutSessionData): Promise<StripeServiceResponse<{
    sessionId: string;
    url: string;
  }>>;

  /**
   * Create a subscription directly
   */
  createSubscription(data: SubscriptionData): Promise<StripeServiceResponse<{
    id: string;
    status: string;
  }>>;

  /**
   * Cancel a subscription
   */
  cancelSubscription(subscriptionId: string): Promise<StripeServiceResponse<void>>;

  /**
   * Update subscription (change plan)
   */
  updateSubscription(subscriptionId: string, newPriceId: string): Promise<StripeServiceResponse<void>>;

  /**
   * Retrieve subscription details
   */
  getSubscription(subscriptionId: string): Promise<StripeServiceResponse<any>>;

  /**
   * List customer's payment methods
   */
  listPaymentMethods(customerId: string): Promise<StripeServiceResponse<PaymentMethodData[]>>;

  /**
   * Attach payment method to customer
   */
  attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<StripeServiceResponse<PaymentMethodData>>;

  /**
   * Detach payment method from customer
   */
  detachPaymentMethod(paymentMethodId: string): Promise<StripeServiceResponse<void>>;

  /**
   * Get list of available products/prices
   */
  getProducts(): Promise<StripeServiceResponse<Array<{
    id: string;
    name: string;
    description?: string;
    prices: Array<{
      id: string;
      currency: string;
      unitAmount: number;
      interval?: 'month' | 'year';
    }>;
  }>>>;

  /**
   * Handle webhook events
   */
  constructWebhookEvent(payload: string, signature: string, secret: string): any;
}

/**
 * Stripe Service Error Types
 */
export class StripeServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public type: 'card_error' | 'invalid_request_error' | 'api_error' | 'authentication_error' | 'rate_limit_error'
  ) {
    super(message);
    this.name = 'StripeServiceError';
  }
}

/**
 * Factory function type for creating Stripe service instances
 */
export type StripeServiceFactory = (config: StripeServiceConfig) => IStripeService;