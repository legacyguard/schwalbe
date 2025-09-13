/**
 * Checkout Component Contract
 *
 * Defines the interface for frontend checkout components.
 * Ensures consistent checkout experience across the application.
 */

export interface CheckoutConfig {
  /** Stripe publishable key */
  stripeKey: string;
  /** Success URL after payment */
  successUrl: string;
  /** Cancel URL if payment is cancelled */
  cancelUrl: string;
  /** Whether to allow promotion codes */
  allowPromotionCodes?: boolean;
  /** Billing address collection mode */
  billingAddressCollection?: 'auto' | 'required';
  /** Customer email (pre-fills checkout) */
  customerEmail?: string;
}

export interface PriceData {
  /** Price ID from Stripe */
  id: string;
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** Price amount in cents */
  amount: number;
  /** Currency code */
  currency: string;
  /** Billing interval */
  interval?: 'month' | 'year';
  /** Whether this is a popular/recommended plan */
  popular?: boolean;
  /** Feature list for this plan */
  features: string[];
}

export interface CheckoutSessionRequest {
  /** Price ID to create checkout for */
  priceId: string;
  /** User ID initiating checkout */
  userId: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Whether to allow promotion codes */
  allowPromotionCodes?: boolean;
  /** Trial period days */
  trialPeriodDays?: number;
}

export interface CheckoutSessionResponse {
  /** Checkout session ID */
  sessionId: string;
  /** Stripe checkout URL */
  url: string;
}

export interface CheckoutComponentProps {
  /** Price data for the checkout */
  price: PriceData;
  /** Checkout configuration */
  config: CheckoutConfig;
  /** User ID */
  userId: string;
  /** Callback when checkout is initiated */
  onCheckoutStart?: () => void;
  /** Callback when checkout succeeds */
  onCheckoutSuccess?: (session: CheckoutSessionResponse) => void;
  /** Callback when checkout is cancelled */
  onCheckoutCancel?: () => void;
  /** Callback when error occurs */
  onError?: (error: CheckoutError) => void;
  /** Whether checkout is disabled */
  disabled?: boolean;
  /** Custom button text */
  buttonText?: string;
  /** Loading state */
  loading?: boolean;
}

export interface CheckoutError {
  /** Error type */
  type: 'network' | 'stripe' | 'validation' | 'unknown';
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: any;
}

/**
 * Checkout Component Interface
 *
 * Defines the contract for checkout UI components
 */
export interface ICheckoutComponent {
  /**
   * Initialize the checkout component
   */
  initialize(config: CheckoutConfig): Promise<void>;

  /**
   * Create a checkout session
   */
  createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse>;

  /**
   * Redirect to Stripe checkout
   */
  redirectToCheckout(sessionId: string): Promise<void>;

  /**
   * Handle successful checkout return
   */
  handleSuccess(sessionId: string): Promise<void>;

  /**
   * Handle cancelled checkout return
   */
  handleCancel(): Promise<void>;

  /**
   * Validate checkout configuration
   */
  validateConfig(config: CheckoutConfig): boolean;

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): string[];

  /**
   * Check if user can proceed with checkout
   */
  canProceedWithCheckout(userId: string, priceId: string): Promise<boolean>;
}

/**
 * Checkout Hook Interface
 *
 * Defines the contract for React hooks that manage checkout state
 */
export interface ICheckoutHook {
  /**
   * Current checkout state
   */
  state: CheckoutState;

  /**
   * Create checkout session
   */
  createSession: (request: CheckoutSessionRequest) => Promise<void>;

  /**
   * Redirect to checkout
   */
  redirectToCheckout: (sessionId: string) => Promise<void>;

  /**
   * Handle success callback
   */
  handleSuccess: (sessionId: string) => Promise<void>;

  /**
   * Handle cancel callback
   */
  handleCancel: () => void;

  /**
   * Reset checkout state
   */
  reset: () => void;
}

export type CheckoutState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'creating_session' }
  | { status: 'redirecting' }
  | { status: 'success'; session: CheckoutSessionResponse }
  | { status: 'cancelled' }
  | { status: 'error'; error: CheckoutError };

/**
 * Pricing Display Component Interface
 *
 * Defines the contract for pricing display components
 */
export interface IPricingDisplayComponent {
  /**
   * List of available prices
   */
  prices: PriceData[];

  /**
   * Currently selected price ID
   */
  selectedPriceId?: string;

  /**
   * Callback when price is selected
   */
  onPriceSelect?: (priceId: string) => void;

  /**
   * Callback when checkout is initiated
   */
  onCheckout?: (price: PriceData) => void;

  /**
   * Whether to show annual pricing
   */
  showAnnualPricing?: boolean;

  /**
   * Whether to highlight popular plans
   */
  highlightPopular?: boolean;

  /**
   * Custom styling theme
   */
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Subscription Status Component Interface
 *
 * Defines the contract for displaying current subscription status
 */
export interface ISubscriptionStatusComponent {
  /**
   * Current user subscription
   */
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };

  /**
   * Current usage statistics
   */
  usage?: {
    documents: { used: number; limit: number };
    storage: { used: number; limit: number };
    scans: { used: number; limit: number };
  };

  /**
   * Callback to manage subscription
   */
  onManageSubscription?: () => void;

  /**
   * Callback to upgrade plan
   */
  onUpgrade?: () => void;

  /**
   * Callback to cancel subscription
   */
  onCancel?: () => void;

  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * Checkout Error Boundary Interface
 *
 * Defines error boundary for checkout components
 */
export interface ICheckoutErrorBoundary {
  /**
   * Callback when error occurs
   */
  onError: (error: Error, errorInfo: any) => void;

  /**
   * Fallback UI to render on error
   */
  fallback: React.ComponentType<{ error: Error; retry: () => void }>;

  /**
   * Whether to reset error state on location change
   */
  resetOnLocationChange?: boolean;
}

/**
 * Checkout Analytics Interface
 *
 * Defines analytics tracking for checkout events
 */
export interface ICheckoutAnalytics {
  /**
   * Track checkout initiation
   */
  trackCheckoutStart: (price: PriceData, userId: string) => void;

  /**
   * Track successful checkout
   */
  trackCheckoutSuccess: (session: CheckoutSessionResponse, userId: string) => void;

  /**
   * Track checkout cancellation
   */
  trackCheckoutCancel: (userId: string) => void;

  /**
   * Track checkout errors
   */
  trackCheckoutError: (error: CheckoutError, userId: string) => void;

  /**
   * Track pricing page views
   */
  trackPricingView: (prices: PriceData[]) => void;
}

/**
 * Factory function types for creating checkout components
 */
export type CheckoutComponentFactory = (config: CheckoutConfig) => ICheckoutComponent;
export type CheckoutHookFactory = (config: CheckoutConfig) => ICheckoutHook;
export type PricingDisplayFactory = (props: IPricingDisplayComponent) => React.ComponentType;
export type SubscriptionStatusFactory = (props: ISubscriptionStatusComponent) => React.ComponentType;