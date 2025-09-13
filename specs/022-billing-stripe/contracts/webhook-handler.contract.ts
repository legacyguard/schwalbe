/**
 * Webhook Handler Contract
 *
 * Defines the interface for Stripe webhook event processing.
 * Ensures secure and reliable webhook handling with proper validation.
 */

export interface WebhookConfig {
  /** Webhook endpoint secret for signature validation */
  endpointSecret: string;
  /** Tolerance for timestamp validation in seconds */
  tolerance: number;
  /** Maximum number of retry attempts for failed processing */
  maxRetries: number;
}

export interface WebhookEvent {
  /** Unique event identifier */
  id: string;
  /** Event type (e.g., 'checkout.session.completed') */
  type: string;
  /** Event creation timestamp */
  created: number;
  /** Event data containing the object */
  data: {
    object: any;
    previous_attributes?: any;
  };
  /** Whether this is a live mode event */
  livemode: boolean;
  /** Number of attempts to deliver this event */
  attempt: number;
  /** Event metadata */
  metadata?: Record<string, any>;
}

export interface WebhookProcessingResult {
  /** Whether processing was successful */
  success: boolean;
  /** Error message if processing failed */
  error?: string;
  /** Processing duration in milliseconds */
  duration?: number;
  /** Whether this was a duplicate event */
  isDuplicate?: boolean;
  /** Event ID that was processed */
  eventId?: string;
}

export interface ProcessedEventRecord {
  /** Event ID */
  eventId: string;
  /** Event type */
  eventType: string;
  /** Processing timestamp */
  processedAt: string;
  /** Processing result */
  result: WebhookProcessingResult;
  /** Raw event data (for debugging) */
  rawEvent?: string;
}

/**
 * Webhook Handler Interface
 *
 * Defines the contract for processing Stripe webhook events
 */
export interface IWebhookHandler {
  /**
   * Process a raw webhook request
   */
  processWebhook(
    rawBody: string,
    signature: string,
    headers?: Record<string, string>
  ): Promise<WebhookProcessingResult>;

  /**
   * Validate webhook signature
   */
  validateSignature(
    payload: string,
    signature: string,
    secret: string,
    tolerance?: number
  ): boolean;

  /**
   * Check if event has already been processed
   */
  isEventProcessed(eventId: string): Promise<boolean>;

  /**
   * Mark event as processed
   */
  markEventProcessed(event: WebhookEvent, result: WebhookProcessingResult): Promise<void>;

  /**
   * Handle specific event types
   */
  handleCheckoutSessionCompleted(event: WebhookEvent): Promise<WebhookProcessingResult>;
  handleCustomerSubscriptionCreated(event: WebhookEvent): Promise<WebhookProcessingResult>;
  handleCustomerSubscriptionUpdated(event: WebhookEvent): Promise<WebhookProcessingResult>;
  handleCustomerSubscriptionDeleted(event: WebhookEvent): Promise<WebhookProcessingResult>;
  handleInvoicePaymentSucceeded(event: WebhookEvent): Promise<WebhookProcessingResult>;
  handleInvoicePaymentFailed(event: WebhookEvent): Promise<WebhookProcessingResult>;

  /**
   * Get processing statistics
   */
  getProcessingStats(): Promise<{
    totalProcessed: number;
    totalFailed: number;
    averageProcessingTime: number;
    recentEvents: ProcessedEventRecord[];
  }>;

  /**
   * Retry failed event processing
   */
  retryFailedEvent(eventId: string): Promise<WebhookProcessingResult>;
}

/**
 * Webhook Event Handlers
 *
 * Individual handler functions for specific event types
 */
export interface WebhookEventHandlers {
  'checkout.session.completed': (event: WebhookEvent) => Promise<WebhookProcessingResult>;
  'customer.subscription.created': (event: WebhookEvent) => Promise<WebhookProcessingResult>;
  'customer.subscription.updated': (event: WebhookEvent) => Promise<WebhookProcessingResult>;
  'customer.subscription.deleted': (event: WebhookEvent) => Promise<WebhookProcessingResult>;
  'invoice.payment_succeeded': (event: WebhookEvent) => Promise<WebhookProcessingResult>;
  'invoice.payment_failed': (event: WebhookEvent) => Promise<WebhookProcessingResult>;
  'customer.subscription.trial_will_end': (event: WebhookEvent) => Promise<WebhookProcessingResult>;
  'invoice.payment_action_required': (event: WebhookEvent) => Promise<WebhookProcessingResult>;
}

/**
 * Webhook Processing Context
 *
 * Context information passed to event handlers
 */
export interface WebhookProcessingContext {
  /** Event being processed */
  event: WebhookEvent;
  /** Processing attempt number */
  attempt: number;
  /** Start time of processing */
  startTime: number;
  /** Configuration */
  config: WebhookConfig;
  /** Logger instance */
  logger: {
    info: (message: string, meta?: any) => void;
    error: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
  };
}

/**
 * Webhook Error Types
 */
export class WebhookError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_SIGNATURE' | 'INVALID_PAYLOAD' | 'DUPLICATE_EVENT' | 'PROCESSING_FAILED' | 'UNKNOWN_EVENT_TYPE',
    public statusCode: number = 400,
    public eventId?: string
  ) {
    super(message);
    this.name = 'WebhookError';
  }
}

export class WebhookSignatureError extends WebhookError {
  constructor(message: string, eventId?: string) {
    super(message, 'INVALID_SIGNATURE', 401, eventId);
    this.name = 'WebhookSignatureError';
  }
}

export class DuplicateEventError extends WebhookError {
  constructor(eventId: string) {
    super(`Event ${eventId} has already been processed`, 'DUPLICATE_EVENT', 200, eventId);
    this.name = 'DuplicateEventError';
  }
}

/**
 * Webhook Middleware Interface
 *
 * Defines middleware for webhook processing pipeline
 */
export interface IWebhookMiddleware {
  /**
   * Process webhook before main handler
   */
  beforeProcess(context: WebhookProcessingContext): Promise<void>;

  /**
   * Process webhook after main handler
   */
  afterProcess(context: WebhookProcessingContext, result: WebhookProcessingResult): Promise<void>;

  /**
   * Handle processing errors
   */
  onError(context: WebhookProcessingContext, error: Error): Promise<void>;
}

/**
 * Webhook Queue Interface
 *
 * Defines interface for queuing webhook events for processing
 */
export interface IWebhookQueue {
  /**
   * Add event to processing queue
   */
  enqueue(event: WebhookEvent): Promise<void>;

  /**
   * Process next event in queue
   */
  processNext(): Promise<WebhookProcessingResult | null>;

  /**
   * Get queue statistics
   */
  getStats(): Promise<{
    queued: number;
    processing: number;
    failed: number;
    completed: number;
  }>;
}

/**
 * Factory function type for creating webhook handler instances
 */
export type WebhookHandlerFactory = (config: WebhookConfig) => IWebhookHandler;