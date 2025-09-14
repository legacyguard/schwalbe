/**
 * Stripe Integration Types for Pricing & Conversion System
 * 
 * This file contains TypeScript types and interfaces for Stripe integration,
 * including products, customers, subscriptions, payments, and webhooks.
 */

// ============================================================================
// Stripe Product and Price Types
// ============================================================================

export interface StripeProduct {
  id: string;
  object: 'product';
  active: boolean;
  attributes: string[];
  created: number;
  default_price?: string;
  description?: string;
  images: string[];
  livemode: boolean;
  metadata: Record<string, string>;
  name: string;
  package_dimensions?: StripePackageDimensions;
  shippable?: boolean;
  statement_descriptor?: string;
  tax_code?: string;
  type: 'good' | 'service';
  unit_label?: string;
  updated: number;
  url?: string;
}

export interface StripePrice {
  id: string;
  object: 'price';
  active: boolean;
  billing_scheme: 'per_unit' | 'tiered';
  created: number;
  currency: string;
  custom_unit_amount?: StripeCustomUnitAmount;
  livemode: boolean;
  lookup_key?: string;
  metadata: Record<string, string>;
  nickname?: string;
  product: string | StripeProduct;
  recurring?: StripeRecurring;
  tax_behavior: 'inclusive' | 'exclusive' | 'unspecified';
  tiers?: StripePriceTier[];
  tiers_mode?: 'graduated' | 'volume';
  transform_quantity?: StripeTransformQuantity;
  type: 'one_time' | 'recurring';
  unit_amount?: number;
  unit_amount_decimal?: string;
}

export interface StripePackageDimensions {
  height: number;
  length: number;
  weight: number;
  width: number;
}

export interface StripeCustomUnitAmount {
  enabled: boolean;
  maximum?: number;
  minimum?: number;
  preset?: number;
}

export interface StripeRecurring {
  aggregate_usage?: 'last_during_period' | 'last_ever' | 'max' | 'sum';
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  trial_period_days?: number;
  usage_type: 'licensed' | 'metered';
}

export interface StripePriceTier {
  flat_amount?: number;
  flat_amount_decimal?: string;
  unit_amount?: number;
  unit_amount_decimal?: string;
  up_to?: number;
}

export interface StripeTransformQuantity {
  divide_by: number;
  round: 'up' | 'down';
}

// ============================================================================
// Stripe Customer Types
// ============================================================================

export interface StripeCustomer {
  id: string;
  object: 'customer';
  address?: StripeAddress;
  balance: number;
  created: number;
  currency?: string;
  default_source?: string | StripePaymentSource;
  delinquent?: boolean;
  description?: string;
  discount?: StripeDiscount;
  email?: string;
  invoice_prefix?: string;
  invoice_settings?: StripeInvoiceSettings;
  livemode: boolean;
  metadata: Record<string, string>;
  name?: string;
  next_invoice_sequence?: number;
  phone?: string;
  preferred_locales: string[];
  shipping?: StripeShipping;
  tax_exempt?: 'none' | 'exempt' | 'reverse';
  test_clock?: string;
}

export interface StripeAddress {
  city?: string;
  country?: string;
  line1?: string;
  line2?: string;
  postal_code?: string;
  state?: string;
}

export interface StripeInvoiceSettings {
  custom_fields?: StripeInvoiceCustomField[];
  default_payment_method?: string;
  footer?: string;
  rendering_options?: StripeInvoiceRenderingOptions;
}

export interface StripeInvoiceCustomField {
  name: string;
  value: string;
}

export interface StripeInvoiceRenderingOptions {
  amount_tax_display?: string;
}

export interface StripeShipping {
  address: StripeAddress;
  carrier?: string;
  name: string;
  phone?: string;
  tracking_number?: string;
}

export interface StripeDiscount {
  coupon: StripeCoupon;
  customer?: string;
  end?: number;
  id: string;
  invoice?: string;
  invoice_item?: string;
  promotion_code?: string;
  start: number;
  subscription?: string;
}

export interface StripeCoupon {
  id: string;
  object: 'coupon';
  amount_off?: number;
  applies_to?: StripeCouponAppliesTo;
  created: number;
  currency?: string;
  duration: 'forever' | 'once' | 'repeating';
  duration_in_months?: number;
  livemode: boolean;
  max_redemptions?: number;
  metadata: Record<string, string>;
  name?: string;
  percent_off?: number;
  redeem_by?: number;
  times_redeemed: number;
  valid: boolean;
}

export interface StripeCouponAppliesTo {
  products: string[];
}

// ============================================================================
// Stripe Subscription Types
// ============================================================================

export interface StripeSubscription {
  id: string;
  object: 'subscription';
  application?: string;
  application_fee_percent?: number;
  automatic_tax: StripeAutomaticTax;
  billing_cycle_anchor: number;
  billing_thresholds?: StripeBillingThresholds;
  cancel_at?: number;
  cancel_at_period_end: boolean;
  canceled_at?: number;
  cancellation_details?: StripeCancellationDetails;
  collection_method: 'charge_automatically' | 'send_invoice';
  created: number;
  currency: string;
  current_period_end: number;
  current_period_start: number;
  customer: string | StripeCustomer;
  default_payment_method?: string | StripePaymentMethod;
  default_source?: string | StripePaymentSource;
  default_tax_rates: StripeTaxRate[];
  description?: string;
  discount?: StripeDiscount;
  ended_at?: number;
  items: StripeSubscriptionItemList;
  latest_invoice?: string | StripeInvoice;
  livemode: boolean;
  metadata: Record<string, string>;
  next_pending_invoice_item_invoice?: number;
  on_behalf_of?: string;
  pause_collection?: StripePauseCollection;
  payment_settings?: StripePaymentSettings;
  pending_invoice_item_interval?: StripePendingInvoiceItemInterval;
  pending_setup_intent?: string;
  pending_update?: StripePendingUpdate;
  schedule?: string;
  start_date: number;
  status: StripeSubscriptionStatus;
  test_clock?: string;
  transfer_data?: StripeTransferData;
  trial_end?: number;
  trial_settings?: StripeTrialSettings;
  trial_start?: number;
}

export interface StripeAutomaticTax {
  enabled: boolean;
  liability?: StripeLiability;
}

export interface StripeLiability {
  account?: string;
  type: 'account' | 'self';
}

export interface StripeBillingThresholds {
  amount_gate: number;
  reset_billing_cycle_anchor?: boolean;
}

export interface StripeCancellationDetails {
  comment?: string;
  feedback?: 'too_expensive' | 'missing_features' | 'switched_service' | 'unused' | 'customer_service' | 'too_complex' | 'low_quality' | 'other';
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'abandoned';
}

export interface StripeSubscriptionItemList {
  object: 'list';
  data: StripeSubscriptionItem[];
  has_more: boolean;
  total_count: number;
  url: string;
}

export interface StripeSubscriptionItem {
  id: string;
  object: 'subscription_item';
  billing_thresholds?: StripeBillingThresholds;
  created: number;
  metadata: Record<string, string>;
  price: StripePrice;
  quantity?: number;
  subscription: string;
  tax_rates: StripeTaxRate[];
}

export interface StripePauseCollection {
  behavior: 'keep_as_draft' | 'mark_uncollectible' | 'void';
  resumes_at?: number;
}

export interface StripePaymentSettings {
  payment_method_options?: StripePaymentMethodOptions;
  payment_method_types?: string[];
  save_default_payment_method?: 'off' | 'on_subscription';
}

export interface StripePaymentMethodOptions {
  acss_debit?: StripePaymentMethodOptionsAcssDebit;
  bancontact?: StripePaymentMethodOptionsBancontact;
  card?: StripePaymentMethodOptionsCard;
  customer_balance?: StripePaymentMethodOptionsCustomerBalance;
  konbini?: StripePaymentMethodOptionsKonbini;
  us_bank_account?: StripePaymentMethodOptionsUsBankAccount;
}

export interface StripePaymentMethodOptionsAcssDebit {
  mandate_options?: StripePaymentMethodOptionsAcssDebitMandateOptions;
  verification_method?: 'automatic' | 'instant' | 'microdeposits';
}

export interface StripePaymentMethodOptionsAcssDebitMandateOptions {
  custom_mandate_url?: string;
  interval_description?: string;
  payment_schedule?: 'combined' | 'interval' | 'sporadic';
  transaction_type?: 'business' | 'personal';
}

export interface StripePaymentMethodOptionsBancontact {
  preferred_language?: 'de' | 'en' | 'fr' | 'nl';
}

export interface StripePaymentMethodOptionsCard {
  mandate_options?: StripePaymentMethodOptionsCardMandateOptions;
  network?: 'amex' | 'cartes_bancaires' | 'diners' | 'discover' | 'interac' | 'jcb' | 'unionpay' | 'unknown' | 'visa';
  request_three_d_secure?: 'any' | 'automatic';
}

export interface StripePaymentMethodOptionsCardMandateOptions {
  amount?: number;
  amount_type?: 'fixed' | 'maximum';
  description?: string;
  end_date?: number;
  interval?: 'day' | 'month' | 'sporadic' | 'week' | 'year';
  interval_count?: number;
  reference?: string;
  start_date?: number;
  supported_types?: 'india';
}

export interface StripePaymentMethodOptionsCustomerBalance {
  bank_transfer?: StripePaymentMethodOptionsCustomerBalanceBankTransfer;
  funding_type?: 'bank_transfer';
}

export interface StripePaymentMethodOptionsCustomerBalanceBankTransfer {
  eu_bank_transfer?: StripePaymentMethodOptionsCustomerBalanceEuBankTransfer;
  type?: 'eu_bank_transfer' | 'gb_bank_transfer' | 'jp_bank_transfer' | 'mx_bank_transfer' | 'us_bank_transfer';
}

export interface StripePaymentMethodOptionsCustomerBalanceEuBankTransfer {
  country: string;
}

export interface StripePaymentMethodOptionsKonbini {
  confirmation_method?: 'automatic' | 'manual';
}

export interface StripePaymentMethodOptionsUsBankAccount {
  financial_connections?: StripePaymentMethodOptionsUsBankAccountFinancialConnections;
  verification_method?: 'automatic' | 'instant' | 'microdeposits';
}

export interface StripePaymentMethodOptionsUsBankAccountFinancialConnections {
  permissions: string[];
  prefetch?: string[];
}

export interface StripePendingInvoiceItemInterval {
  interval: 'day' | 'month' | 'week' | 'year';
  interval_count: number;
}

export interface StripePendingUpdate {
  billing_cycle_anchor?: number;
  expires_at: number;
  subscription_items: StripeSubscriptionItem[];
  trial_from_plan?: boolean;
}

export interface StripeTransferData {
  amount?: number;
  destination: string;
}

export interface StripeTrialSettings {
  end_behavior: StripeTrialSettingsEndBehavior;
}

export interface StripeTrialSettingsEndBehavior {
  missing_payment_method: 'create_invoice' | 'pause';
}

export type StripeSubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

// ============================================================================
// Stripe Payment Types
// ============================================================================

export interface StripePaymentMethod {
  id: string;
  object: 'payment_method';
  acss_debit?: StripePaymentMethodOptionsAcssDebit;
  affirm?: StripePaymentMethod;
  afterpay_clearpay?: StripePaymentMethodAfterpayClearpay;
  alipay?: StripePaymentMethod;
  au_becs_debit?: StripePaymentMethodOptionsAcssDebit;
  bacs_debit?: StripePaymentMethod;
  bancontact?: StripePaymentMethodOptionsBancontact;
  billing_details: StripeBillingDetails;
  blik?: StripePaymentMethod;
  boleto?: StripePaymentMethod;
  card?: StripePaymentMethodCard;
  card_present?: StripePaymentMethodCardPresent;
  cashapp?: StripePaymentMethod;
  customer?: string;
  customer_balance?: StripePaymentMethodCustomerBalance;
  eps?: StripePaymentMethodEps;
  fpx?: StripePaymentMethodFpx;
  giropay?: StripePaymentMethodGiropay;
  grabpay?: StripePaymentMethodGrabpay;
  ideal?: StripePaymentMethodIdeal;
  interac_present?: StripePaymentMethodInteracPresent;
  klarna?: StripePaymentMethodKlarna;
  konbini?: StripePaymentMethodKonbini;
  link?: StripePaymentMethodLink;
  livemode: boolean;
  metadata: Record<string, string>;
  oxxo?: StripePaymentMethodOxxo;
  p24?: StripePaymentMethodP24;
  paynow?: StripePaymentMethodPaynow;
  paypal?: StripePaymentMethodPaypal;
  pix?: StripePaymentMethodPix;
  promptpay?: StripePaymentMethodPromptpay;
  radar_options?: StripeRadarOptions;
  sepa_debit?: StripePaymentMethodSepaDebit;
  sofort?: StripePaymentMethodSofort;
  type: string;
  us_bank_account?: StripePaymentMethodUsBankAccount;
  wechat_pay?: StripePaymentMethodWechatPay;
  zip?: StripePaymentMethodZip;
}

export interface StripeBillingDetails {
  address?: StripeAddress;
  email?: string;
  name?: string;
  phone?: string;
}

export interface StripePaymentMethodCard {
  brand: string;
  checks?: StripePaymentMethodCardChecks;
  country?: string;
  exp_month: number;
  exp_year: number;
  fingerprint?: string;
  funding?: string;
  generated_from?: StripePaymentMethodCardGeneratedFrom;
  last4: string;
  networks?: StripePaymentMethodCardNetworks;
  three_d_secure_usage?: StripePaymentMethodCardThreeDSecureUsage;
  wallet?: StripePaymentMethodCardWallet;
}

export interface StripePaymentMethodCardChecks {
  address_line1_check?: string;
  address_postal_code_check?: string;
  cvc_check?: string;
}

export interface StripePaymentMethodCardGeneratedFrom {
  charge?: string;
  payment_method_details?: StripePaymentMethodDetails;
  setup_attempt?: string;
}

export interface StripePaymentMethodDetails {
  type: string;
}

export interface StripePaymentMethodCardNetworks {
  available: string[];
  preferred?: string;
}

export interface StripePaymentMethodCardThreeDSecureUsage {
  supported: boolean;
}

export interface StripePaymentMethodCardWallet {
  amex_express_checkout?: StripePaymentMethodCardWalletAmexExpressCheckout;
  apple_pay?: StripePaymentMethodCardWalletApplePay;
  dynamic_last4?: string;
  google_pay?: StripePaymentMethodCardWalletGooglePay;
  masterpass?: StripePaymentMethodCardWalletMasterpass;
  samsung_pay?: StripePaymentMethodCardWalletSamsungPay;
  type: string;
  visa_checkout?: StripePaymentMethodCardWalletVisaCheckout;
}

export interface StripePaymentMethodCardWalletAmexExpressCheckout {
  checkout_session_id?: string;
  external_id?: string;
}

export interface StripePaymentMethodCardWalletApplePay {
  pass?: StripePaymentMethodCardWalletApplePayPass;
  primary_transaction_id?: string;
}

export interface StripePaymentMethodCardWalletApplePayPass {
  id?: string;
  name?: string;
}

export interface StripePaymentMethodCardWalletGooglePay {
  google_transaction_id?: string;
}

export interface StripePaymentMethodCardWalletMasterpass {
  billing_address?: StripeAddress;
  email?: string;
  name?: string;
  shipping_address?: StripeAddress;
}

export interface StripePaymentMethodCardWalletSamsungPay {
  pass?: StripePaymentMethodCardWalletSamsungPayPass;
  transaction_id?: string;
}

export interface StripePaymentMethodCardWalletSamsungPayPass {
  id?: string;
  name?: string;
}

export interface StripePaymentMethodCardWalletVisaCheckout {
  call_id?: string;
}

export interface StripeRadarOptions {
  session?: string;
}

// ============================================================================
// Stripe Invoice Types
// ============================================================================

export interface StripeInvoice {
  id: string;
  object: 'invoice';
  account_country?: string;
  account_name?: string;
  account_tax_ids?: StripeTaxId[];
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  amount_shipping?: number;
  application?: string;
  application_fee_amount?: number;
  attempt_count: number;
  attempted: boolean;
  auto_advance?: boolean;
  automatic_tax: StripeAutomaticTax;
  billing_reason?: StripeInvoiceBillingReason;
  charge?: string | StripeCharge;
  collection_method: 'charge_automatically' | 'send_invoice';
  created: number;
  currency: string;
  custom_fields?: StripeInvoiceCustomField[];
  customer?: string | StripeCustomer;
  customer_address?: StripeAddress;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_shipping?: StripeShipping;
  customer_tax_exempt?: 'none' | 'exempt' | 'reverse';
  default_payment_method?: string | StripePaymentMethod;
  default_source?: string | StripePaymentSource;
  default_tax_rates: StripeTaxRate[];
  description?: string;
  discount?: StripeDiscount;
  due_date?: number;
  ending_balance?: number;
  footer?: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  last_finalization_invoice?: string;
  last_payment_intent?: string | StripePaymentIntent;
  last_payment_intent_id?: string;
  lines: StripeInvoiceLineList;
  livemode: boolean;
  metadata: Record<string, string>;
  next_payment_attempt?: number;
  number?: string;
  on_behalf_of?: string;
  paid: boolean;
  paid_out_of_band: boolean;
  payment_intent?: string | StripePaymentIntent;
  period_end: number;
  period_start: number;
  post_payment_credit_notes_amount: number;
  pre_payment_credit_notes_amount: number;
  quote?: string;
  receipt_number?: string;
  rendering_options?: StripeInvoiceRenderingOptions;
  shipping?: StripeShipping;
  starting_balance: number;
  statement_descriptor?: string;
  status?: StripeInvoiceStatus;
  status_transitions: StripeInvoiceStatusTransitions;
  subscription?: string | StripeSubscription;
  subtotal: number;
  subtotal_excluding_tax?: number;
  tax?: number;
  total: number;
  total_discount_amounts: StripeDiscountAmount[];
  total_tax_amounts: StripeTaxAmount[];
  transfer_data?: StripeTransferData;
  webhooks_delivered_at?: number;
}

export type StripeInvoiceBillingReason = 
  | 'automatic_pending_invoice_item_notification'
  | 'manual'
  | 'subscription'
  | 'subscription_create'
  | 'subscription_cycle'
  | 'subscription_threshold'
  | 'subscription_update'
  | 'upcoming';

export type StripeInvoiceStatus = 
  | 'draft'
  | 'open'
  | 'paid'
  | 'uncollectible'
  | 'void';

export interface StripeInvoiceStatusTransitions {
  finalized_at?: number;
  marked_uncollectible_at?: number;
  paid_at?: number;
  voided_at?: number;
}

export interface StripeInvoiceLineList {
  object: 'list';
  data: StripeInvoiceLine[];
  has_more: boolean;
  total_count: number;
  url: string;
}

export interface StripeInvoiceLine {
  id: string;
  object: 'line_item';
  amount: number;
  amount_excluding_tax?: number;
  currency: string;
  description?: string;
  discount_amounts: StripeDiscountAmount[];
  discountable: boolean;
  discounts: StripeDiscount[];
  livemode: boolean;
  metadata: Record<string, string>;
  period: StripePeriod;
  plan?: StripePlan;
  price?: StripePrice;
  proration: boolean;
  proration_details?: StripeProrationDetails;
  quantity: number;
  subscription?: string;
  subscription_item?: string;
  tax_amounts: StripeTaxAmount[];
  tax_rates: StripeTaxRate[];
  type: 'invoiceitem' | 'subscription';
  unit_amount_excluding_tax?: number;
}

export interface StripeDiscountAmount {
  amount: number;
  discount: string | StripeDiscount;
}

export interface StripeTaxAmount {
  amount: number;
  inclusive: boolean;
  tax_rate: string | StripeTaxRate;
}

export interface StripePeriod {
  end: number;
  start: number;
}

export interface StripePlan {
  id: string;
  object: 'plan';
  active: boolean;
  aggregate_usage?: string;
  amount: number;
  amount_decimal: string;
  billing_scheme: 'per_unit' | 'tiered';
  created: number;
  currency: string;
  interval: 'day' | 'month' | 'week' | 'year';
  interval_count: number;
  livemode: boolean;
  metadata: Record<string, string>;
  nickname?: string;
  product: string | StripeProduct;
  tiers?: StripePlanTier[];
  tiers_mode?: 'graduated' | 'volume';
  transform_usage?: StripeTransformUsage;
  trial_period_days?: number;
  usage_type: 'licensed' | 'metered';
}

export interface StripePlanTier {
  flat_amount?: number;
  flat_amount_decimal?: string;
  unit_amount?: number;
  unit_amount_decimal?: string;
  up_to?: number;
}

export interface StripeTransformUsage {
  divide_by: number;
  round: 'up' | 'down';
}

export interface StripeProrationDetails {
  credited_items?: StripeCreditedItems;
}

export interface StripeCreditedItems {
  invoice: string;
  invoice_line_items: string[];
}

// ============================================================================
// Stripe Payment Intent Types
// ============================================================================

export interface StripePaymentIntent {
  id: string;
  object: 'payment_intent';
  amount: number;
  amount_capturable: number;
  amount_details?: StripePaymentIntentAmountDetails;
  amount_received: number;
  application?: string;
  application_fee_amount?: number;
  automatic_payment_methods?: StripeAutomaticPaymentMethods;
  canceled_at?: number;
  cancellation_reason?: StripePaymentIntentCancellationReason;
  capture_method: 'automatic' | 'manual';
  charges: StripeChargeList;
  client_secret: string;
  confirmation_method: 'automatic' | 'manual';
  created: number;
  currency: string;
  customer?: string;
  description?: string;
  invoice?: string;
  last_payment_error?: StripePaymentIntentLastPaymentError;
  latest_charge?: string | StripeCharge;
  livemode: boolean;
  metadata: Record<string, string>;
  next_action?: StripePaymentIntentNextAction;
  on_behalf_of?: string;
  payment_method?: string | StripePaymentMethod;
  payment_method_options?: StripePaymentMethodOptions;
  payment_method_types: string[];
  processing?: StripePaymentIntentProcessing;
  receipt_email?: string;
  review?: string;
  setup_future_usage?: StripePaymentIntentSetupFutureUsage;
  shipping?: StripeShipping;
  statement_descriptor?: string;
  statement_descriptor_suffix?: string;
  status: StripePaymentIntentStatus;
  transfer_data?: StripeTransferData;
  transfer_group?: string;
}

export interface StripePaymentIntentAmountDetails {
  tip?: StripePaymentIntentAmountDetailsTip;
}

export interface StripePaymentIntentAmountDetailsTip {
  amount: number;
}

export interface StripeAutomaticPaymentMethods {
  enabled: boolean;
  allow_redirects?: 'always' | 'never';
}

export type StripePaymentIntentCancellationReason = 
  | 'abandoned'
  | 'duplicate'
  | 'failed_invoice'
  | 'fraudulent'
  | 'requested_by_customer'
  | 'void_invoice';

export interface StripeChargeList {
  object: 'list';
  data: StripeCharge[];
  has_more: boolean;
  total_count: number;
  url: string;
}

export interface StripeCharge {
  id: string;
  object: 'charge';
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  application?: string;
  application_fee?: string;
  application_fee_amount?: number;
  balance_transaction?: string | StripeBalanceTransaction;
  billing_details: StripeBillingDetails;
  calculated_statement_descriptor?: string;
  captured: boolean;
  created: number;
  currency: string;
  customer?: string;
  description?: string;
  destination?: string;
  dispute?: string;
  disputed: boolean;
  failure_code?: string;
  failure_message?: string;
  fraud_details?: StripeFraudDetails;
  invoice?: string;
  livemode: boolean;
  metadata: Record<string, string>;
  on_behalf_of?: string;
  outcome?: StripeOutcome;
  paid: boolean;
  payment_intent?: string;
  payment_method?: string | StripePaymentMethod;
  payment_method_details?: StripePaymentMethodDetails;
  receipt_email?: string;
  receipt_number?: string;
  receipt_url?: string;
  refunded: boolean;
  refunds: StripeRefundList;
  review?: string;
  shipping?: StripeShipping;
  source?: StripePaymentSource;
  source_transfer?: string;
  statement_descriptor?: string;
  statement_descriptor_suffix?: string;
  status: StripeChargeStatus;
  transfer_data?: StripeTransferData;
  transfer_group?: string;
}

export type StripeChargeStatus = 'pending' | 'succeeded' | 'failed';

export interface StripeBalanceTransaction {
  id: string;
  object: 'balance_transaction';
  amount: number;
  available_on: number;
  created: number;
  currency: string;
  description?: string;
  exchange_rate?: number;
  fee: number;
  fee_details: StripeFeeDetail[];
  net: number;
  reporting_category: string;
  source?: string;
  status: 'available' | 'pending';
  type: string;
}

export interface StripeFeeDetail {
  amount: number;
  application?: string;
  currency: string;
  description?: string;
  type: string;
}

export interface StripeFraudDetails {
  user_report?: 'safe' | 'fraudulent';
  stripe_report?: 'fraudulent';
}

export interface StripeOutcome {
  network_status?: 'approved_by_network' | 'declined_by_network' | 'not_sent_to_network' | 'reversed_after_approval';
  reason?: string;
  risk_level?: 'normal' | 'elevated' | 'highest' | 'not_assessed' | 'unknown';
  risk_score?: number;
  seller_message?: string;
  type: 'authorized' | 'manual_review' | 'issuer_declined' | 'blocked' | 'invalid';
}

export interface StripeRefundList {
  object: 'list';
  data: StripeRefund[];
  has_more: boolean;
  total_count: number;
  url: string;
}

export interface StripeRefund {
  id: string;
  object: 'refund';
  amount: number;
  charge: string | StripeCharge;
  created: number;
  currency: string;
  metadata: Record<string, string>;
  payment_intent?: string;
  reason?: StripeRefundReason;
  receipt_number?: string;
  status: StripeRefundStatus;
}

export type StripeRefundReason = 
  | 'duplicate'
  | 'fraudulent'
  | 'requested_by_customer';

export type StripeRefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

export interface StripePaymentIntentLastPaymentError {
  charge?: string;
  code?: string;
  decline_code?: string;
  doc_url?: string;
  message?: string;
  param?: string;
  payment_method?: StripePaymentMethod;
  type: string;
}

export interface StripePaymentIntentNextAction {
  type: string;
  redirect_to_url?: StripePaymentIntentNextActionRedirectToUrl;
  use_stripe_sdk?: StripePaymentIntentNextActionUseStripeSdk;
  verify_with_microdeposits?: StripePaymentIntentNextActionVerifyWithMicrodeposits;
  wechat_pay_display_qr_code?: StripePaymentIntentNextActionWechatPayDisplayQrCode;
  wechat_pay_redirect_to_android_app?: StripePaymentIntentNextActionWechatPayRedirectToAndroidApp;
  wechat_pay_redirect_to_ios_app?: StripePaymentIntentNextActionWechatPayRedirectToIosApp;
}

export interface StripePaymentIntentNextActionRedirectToUrl {
  return_url: string;
  url: string;
}

export interface StripePaymentIntentNextActionUseStripeSdk {
  type: string;
}

export interface StripePaymentIntentNextActionVerifyWithMicrodeposits {
  arrival_date: number;
  hosted_verification_url: string;
}

export interface StripePaymentIntentNextActionWechatPayDisplayQrCode {
  data: string;
  image_data_url: string;
}

export interface StripePaymentIntentNextActionWechatPayRedirectToAndroidApp {
  app_id: string;
  native_url: string;
}

export interface StripePaymentIntentNextActionWechatPayRedirectToIosApp {
  native_url: string;
}

export interface StripePaymentIntentProcessing {
  card?: StripePaymentIntentProcessingCard;
  type: string;
}

export interface StripePaymentIntentProcessingCard {
  customer_notification?: StripePaymentIntentProcessingCardCustomerNotification;
}

export interface StripePaymentIntentProcessingCardCustomerNotification {
  approval_requested?: boolean;
  completes_at?: number;
}

export type StripePaymentIntentSetupFutureUsage = 
  | 'off_session'
  | 'on_session';

export type StripePaymentIntentStatus = 
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

// ============================================================================
// Stripe Webhook Types
// ============================================================================

export interface StripeWebhookEvent {
  id: string;
  object: 'event';
  api_version?: string;
  created: number;
  data: StripeWebhookEventData;
  livemode: boolean;
  pending_webhooks: number;
  request?: StripeWebhookEventRequest;
  type: string;
}

export interface StripeWebhookEventData {
  object: any;
  previous_attributes?: any;
}

export interface StripeWebhookEventRequest {
  id?: string;
  idempotency_key?: string;
}

// ============================================================================
// Stripe Tax Types
// ============================================================================

export interface StripeTaxRate {
  id: string;
  object: 'tax_rate';
  active: boolean;
  country?: string;
  created: number;
  description?: string;
  display_name: string;
  inclusive: boolean;
  jurisdiction?: string;
  livemode: boolean;
  metadata: Record<string, string>;
  percentage: number;
  state?: string;
  tax_type?: 'gst' | 'hst' | 'jct' | 'pst' | 'qst' | 'rst' | 'sales_tax' | 'vat';
}

export interface StripeTaxId {
  id: string;
  object: 'tax_id';
  country?: string;
  created: number;
  customer?: string;
  livemode: boolean;
  type: StripeTaxIdType;
  value: string;
  verification?: StripeTaxIdVerification;
}

export type StripeTaxIdType = 
  | 'au_abn'
  | 'au_arn'
  | 'br_cnpj'
  | 'br_cpf'
  | 'ca_bn'
  | 'ca_gst_hst'
  | 'ca_pst_bc'
  | 'ca_pst_mb'
  | 'ca_pst_sk'
  | 'ca_qst'
  | 'ch_vat'
  | 'cl_tin'
  | 'es_cif'
  | 'eu_vat'
  | 'gb_vat'
  | 'ge_vat'
  | 'hk_br'
  | 'id_npwp'
  | 'il_vat'
  | 'in_gst'
  | 'is_vat'
  | 'jp_cn'
  | 'jp_rn'
  | 'kr_brn'
  | 'li_uid'
  | 'mx_rfc'
  | 'my_frp'
  | 'my_itn'
  | 'my_sst'
  | 'no_vat'
  | 'nz_gst'
  | 'ru_inn'
  | 'ru_kpp'
  | 'sa_vat'
  | 'sg_gst'
  | 'sg_uen'
  | 'th_vat'
  | 'tw_vat'
  | 'ua_vat'
  | 'us_ein'
  | 'za_vat';

export interface StripeTaxIdVerification {
  status: 'pending' | 'unavailable' | 'unverified' | 'verified';
  verified_address?: string;
  verified_name?: string;
}

// ============================================================================
// Stripe Error Types
// ============================================================================

export interface StripeError {
  type: string;
  code?: string;
  decline_code?: string;
  message?: string;
  param?: string;
  payment_intent?: StripePaymentIntent;
  payment_method?: StripePaymentMethod;
  setup_intent?: StripeSetupIntent;
  source?: StripePaymentSource;
}

export interface StripeSetupIntent {
  id: string;
  object: 'setup_intent';
  application?: string;
  automatic_payment_methods?: StripeAutomaticPaymentMethods;
  cancellation_reason?: StripeSetupIntentCancellationReason;
  client_secret: string;
  created: number;
  customer?: string;
  description?: string;
  last_payment_error?: StripePaymentIntentLastPaymentError;
  latest_attempt?: string;
  livemode: boolean;
  metadata: Record<string, string>;
  next_action?: StripePaymentIntentNextAction;
  on_behalf_of?: string;
  payment_method?: string | StripePaymentMethod;
  payment_method_options?: StripePaymentMethodOptions;
  payment_method_types: string[];
  single_use_mandate?: string;
  status: StripeSetupIntentStatus;
  usage: StripeSetupIntentUsage;
}

export type StripeSetupIntentCancellationReason = 
  | 'abandoned'
  | 'duplicate'
  | 'requested_by_customer';

export type StripeSetupIntentStatus = 
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'canceled'
  | 'succeeded';

export type StripeSetupIntentUsage = 'off_session' | 'on_session';

// ============================================================================
// Stripe Payment Source Types
// ============================================================================

export type StripePaymentSource = 
  | StripePaymentMethod
  | StripeSource;

export interface StripeSource {
  id: string;
  object: 'source';
  amount?: number;
  client_secret: string;
  created: number;
  currency?: string;
  flow: 'redirect' | 'receiver' | 'code_verification' | 'none';
  livemode: boolean;
  metadata: Record<string, string>;
  owner?: StripeSourceOwner;
  receiver?: StripeSourceReceiver;
  redirect?: StripeSourceRedirect;
  statement_descriptor?: string;
  status: StripeSourceStatus;
  type: string;
  usage: StripeSourceUsage;
}

export interface StripeSourceOwner {
  address?: StripeAddress;
  email?: string;
  name?: string;
  phone?: string;
  verified_address?: StripeAddress;
  verified_email?: string;
  verified_name?: string;
  verified_phone?: string;
}

export interface StripeSourceReceiver {
  address?: string;
  amount_charged: number;
  amount_received: number;
  amount_returned: number;
  refund_attributes_method?: string;
  refund_attributes_status?: string;
}

export interface StripeSourceRedirect {
  failure_reason?: string;
  return_url: string;
  status: 'pending' | 'succeeded' | 'failed';
  url: string;
}

export type StripeSourceStatus = 
  | 'canceled'
  | 'chargeable'
  | 'consumed'
  | 'failed'
  | 'pending';

export type StripeSourceUsage = 'reusable' | 'single_use';

// ============================================================================
// Additional Stripe Types
// ============================================================================

export interface StripeAcssDebit {
  account_number: string;
  bank_number: string;
  fingerprint: string;
  institution_number: string;
  last4: string;
  transit_number: string;
}

export interface StripeAffirm {
  checkout_session_id?: string;
}

export interface StripeAfterpayClearpay {
  order_id?: string;
  reference?: string;
}

export interface StripeAlipay {
  buyer_id?: string;
  fingerprint?: string;
  transaction_id?: string;
}

export interface StripeAuBecsDebit {
  bsb_number: string;
  fingerprint: string;
  last4: string;
}

export interface StripeBacsDebit {
  fingerprint: string;
  last4: string;
  sort_code: string;
}

export interface StripeBancontact {
  preferred_language?: string;
}

export interface StripeBlik {
  bank_code?: string;
  bank_name?: string;
  bic?: string;
  iban_last4?: string;
  preferred_language?: string;
}

export interface StripeBoleto {
  tax_id: string;
}

export interface StripeCashapp {
  buyer_id?: string;
  cashtag?: string;
}

export interface StripeCustomerBalance {
  funding_type?: string;
}

export interface StripeEps {
  bank?: string;
}

export interface StripeFpx {
  bank: string;
  transaction_id?: string;
}

export interface StripeGiropay {
  bank_code?: string;
  bank_name?: string;
  bic?: string;
}

export interface StripeGrabpay {
  transaction_id?: string;
}

export interface StripeIdeal {
  bank?: string;
  bic?: string;
  iban_last4?: string;
}

export interface StripeInteracPresent {
  brand?: string;
  card_present?: StripePaymentMethodCardPresent;
  country?: string;
  exp_month?: number;
  exp_year?: number;
  fingerprint?: string;
  funding?: string;
  last4?: string;
  networks?: StripePaymentMethodCardNetworks;
  preferred_locales?: string[];
  receipt?: StripePaymentMethodCardPresentReceipt;
}

export interface StripePaymentMethodCardPresent {
  brand?: string;
  country?: string;
  exp_month?: number;
  exp_year?: number;
  fingerprint?: string;
  funding?: string;
  generated_from?: StripePaymentMethodCardGeneratedFrom;
  last4?: string;
  networks?: StripePaymentMethodCardNetworks;
  preferred_locales?: string[];
  receipt?: StripePaymentMethodCardPresentReceipt;
}

export interface StripePaymentMethodCardPresentReceipt {
  account_type?: string;
  application_cryptogram?: string;
  application_preferred_name?: string;
  authorization_code?: string;
  authorization_response_code?: string;
  cardholder_verification_method?: string;
  dedicated_file_name?: string;
  terminal_verification_results?: string;
  transaction_status_information?: string;
}

export interface StripeKlarna {
  payment_method_category?: string;
  preferred_locale?: string;
}

export interface StripeKonbini {
  confirmation_number?: string;
  store?: StripeKonbiniStore;
}

export interface StripeKonbiniStore {
  chain?: string;
  name?: string;
}

export interface StripeLink {
  email?: string;
  persistent_token?: string;
}

export interface StripeOxxo {
  number?: string;
}

export interface StripeP24 {
  bank?: string;
  reference?: string;
  verified_name?: string;
}

export interface StripePaynow {
  reference?: string;
}

export interface StripePaypal {
  payer_email?: string;
  payer_id?: string;
  reference?: string;
  seller_protection?: StripePaypalSellerProtection;
  shipping_address?: StripeAddress;
  transaction_id?: string;
}

export interface StripePaypalSellerProtection {
  dispute_categories?: string[];
  status: 'eligible' | 'partially_eligible' | 'not_eligible';
}

export interface StripePix {
  bank_code?: string;
  bank_name?: string;
  fingerprint?: string;
  iban_last4?: string;
  preferred_language?: string;
}

export interface StripePromptpay {
  reference?: string;
}

export interface StripeSepaDebit {
  bank_code?: string;
  branch_code?: string;
  country?: string;
  fingerprint?: string;
  last4?: string;
  mandate?: string;
}

export interface StripeSofort {
  country?: string;
  bank_code?: string;
  bank_name?: string;
  bic?: string;
  iban_last4?: string;
  preferred_language?: string;
}

export interface StripeUsBankAccount {
  account_holder_type?: 'company' | 'individual';
  account_type?: 'checking' | 'savings';
  bank_name?: string;
  fingerprint?: string;
  last4?: string;
  routing_number?: string;
}

export interface StripeWechatPay {
  fingerprint?: string;
  transaction_id?: string;
}

export interface StripeZip {
  reference?: string;
}

// ============================================================================
// Missing Payment Method Types
// ============================================================================

export interface StripePaymentMethodAfterpayClearpay {
  reference?: string;
}

export interface StripePaymentMethodCustomerBalance {
  // Customer balance payment method details
  [key: string]: any;
}

export interface StripePaymentMethodEps {
  bank?: string;
}

export interface StripePaymentMethodFpx {
  bank?: string;
  transaction_id?: string;
}

export interface StripePaymentMethodGiropay {
  bank_code?: string;
  bank_name?: string;
  bic?: string;
}

export interface StripePaymentMethodGrabpay {
  transaction_id?: string;
}

export interface StripePaymentMethodIdeal {
  bank?: string;
  bic?: string;
}

export interface StripePaymentMethodInteracPresent {
  brand?: string;
  country?: string;
  exp_month?: number;
  exp_year?: number;
  fingerprint?: string;
  funding?: string;
  last4?: string;
  receipt?: StripePaymentMethodCardPresentReceipt;
}

export interface StripePaymentMethodKlarna {
  payment_method_category?: string;
  preferred_locale?: string;
}

export interface StripePaymentMethodKonbini {
  store?: StripePaymentMethodOptionsKonbini;
}

export interface StripePaymentMethodLink {
  email?: string;
  persistent_token?: string;
}

export interface StripePaymentMethodOxxo {
  number?: string;
}

export interface StripePaymentMethodP24 {
  bank?: string;
  reference?: string;
}

export interface StripePaymentMethodPaynow {
  reference?: string;
}

export interface StripePaymentMethodPaypal {
  payer_email?: string;
  payer_id?: string;
  reference?: string;
}

export interface StripePaymentMethodPix {
  reference?: string;
}

export interface StripePaymentMethodPromptpay {
  reference?: string;
}

export interface StripePaymentMethodSepaDebit {
  bank_code?: string;
  branch_code?: string;
  country?: string;
  fingerprint?: string;
  last4?: string;
  mandate?: string;
}

export interface StripePaymentMethodSofort {
  country?: string;
  bank_code?: string;
  bank_name?: string;
  bic?: string;
  iban_last4?: string;
  preferred_language?: string;
  statement_descriptor?: string;
}

export interface StripePaymentMethodUsBankAccount {
  account_holder_type?: string;
  account_type?: string;
  bank_name?: string;
  fingerprint?: string;
  last4?: string;
  routing_number?: string;
}

export interface StripePaymentMethodWechatPay {
  fingerprint?: string;
  transaction_id?: string;
}

export interface StripePaymentMethodZip {
  reference?: string;
}
