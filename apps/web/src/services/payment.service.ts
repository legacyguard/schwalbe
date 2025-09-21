import { sofiaAIService } from './sofia-ai.service';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'paypal' | 'apple_pay' | 'google_pay';
  lastFour?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  holderName?: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
  paymentMethodId?: string;
  customerId?: string;
  consultationId?: string;
  subscriptionId?: string;
}

export interface PaymentResult {
  id: string;
  status: 'succeeded' | 'failed' | 'pending' | 'cancelled' | 'requires_action';
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  clientSecret?: string;
  nextAction?: {
    type: 'redirect_to_url' | 'use_stripe_sdk';
    redirectUrl?: string;
  };
  receiptUrl?: string;
  errorMessage?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  recommended?: boolean;
  popular?: boolean;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  downloadUrl?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  consultationId?: string;
  subscriptionId?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number; // Partial refund if specified
  reason: 'requested_by_customer' | 'duplicate' | 'fraudulent' | 'subscription_canceled';
  metadata?: Record<string, any>;
}

export interface RefundResult {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  reason: string;
  createdAt: Date;
}

class PaymentService {
  private apiKey: string;
  private baseUrl: string;
  private sofiaAI: typeof sofiaAIService;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    this.sofiaAI = sofiaAIService;
  }

  async initializePayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Log payment initiation for analytics
      // TODO: Implement logInteraction method in SofiaAIService
      console.log('Payment initiated:', {
        type: 'payment_initiated',
        context: 'professional_services',
        metadata: {
          amount: request.amount,
          currency: request.currency,
          consultationId: request.consultationId
        }
      });

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Payment initialization failed: ${response.statusText}`);
      }

      const result: PaymentResult = await response.json();

      // Provide Sofia AI context about payment for future recommendations
      // TODO: Implement updateContext method in SofiaAIService
      console.log('Payment context update:', {
        paymentHistory: {
          lastPayment: result,
          professionalServicesUsage: true
        }
      });

      return result;
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw new Error('Failed to initialize payment. Please try again.');
    }
  }

  async confirmPayment(paymentId: string, paymentMethodId?: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ paymentMethodId })
      });

      if (!response.ok) {
        throw new Error(`Payment confirmation failed: ${response.statusText}`);
      }

      const result: PaymentResult = await response.json();

      if (result.status === 'succeeded') {
        // Notify Sofia AI of successful payment for experience personalization
        await this.sofiaAI.logInteraction({
          type: 'payment_succeeded',
          context: 'professional_services',
          metadata: {
            paymentId: result.id,
            amount: result.amount,
            consultationBooked: !!result.paymentMethod
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw new Error('Failed to confirm payment. Please try again.');
    }
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve payment methods');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  async addPaymentMethod(customerId: string, paymentMethodData: any): Promise<PaymentMethod> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(paymentMethodData)
      });

      if (!response.ok) {
        throw new Error('Failed to add payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw new Error('Failed to add payment method. Please check your card details.');
    }
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove payment method');
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw new Error('Failed to remove payment method. Please try again.');
    }
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}/default-payment-method`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ paymentMethodId })
      });

      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method. Please try again.');
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription-plans`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve subscription plans');
      }

      const plans: SubscriptionPlan[] = await response.json();

      // Use Sofia AI to recommend plans based on user profile
      const recommendations = await this.sofiaAI.generateRecommendations({
        type: 'subscription_plan',
        context: 'professional_services',
        availableOptions: plans
      });

      // Mark recommended plans
      return plans.map(plan => ({
        ...plan,
        recommended: recommendations.some((rec: any) => rec.planId === plan.id)
      }));
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return this.getDefaultSubscriptionPlans();
    }
  }

  private getDefaultSubscriptionPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic',
        name: 'Basic Protection',
        description: 'Essential estate planning tools and document storage',
        price: 9.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Will creation wizard',
          'Document storage (5GB)',
          'Basic family tree',
          'Emergency contacts',
          'Email support'
        ]
      },
      {
        id: 'family',
        name: 'Family Guardian',
        description: 'Complete family protection with professional consultation',
        price: 29.99,
        currency: 'USD',
        interval: 'monthly',
        popular: true,
        features: [
          'Everything in Basic',
          'Unlimited document storage',
          'Video time capsules',
          'Professional consultations (2/month)',
          'Priority support',
          'Advanced guardian management'
        ]
      },
      {
        id: 'enterprise',
        name: 'Legacy Complete',
        description: 'Comprehensive estate planning with unlimited access',
        price: 99.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Everything in Family Guardian',
          'Unlimited professional consultations',
          'Personal estate planning advisor',
          'Tax optimization tools',
          'Multi-generational planning',
          'White-glove service'
        ]
      }
    ];
  }

  async createSubscription(customerId: string, planId: string, paymentMethodId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          customerId,
          planId,
          paymentMethodId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const subscription = await response.json();

      // Notify Sofia AI of subscription for experience customization
      await this.sofiaAI.logInteraction({
        type: 'subscription_created',
        context: 'professional_services',
        metadata: {
          planId,
          subscriptionId: subscription.id
        }
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription. Please try again.');
    }
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Log cancellation for Sofia AI to understand user journey
      await this.sofiaAI.logInteraction({
        type: 'subscription_cancelled',
        context: 'professional_services',
        metadata: { subscriptionId, reason }
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription. Please contact support.');
    }
  }

  async getInvoices(customerId: string): Promise<Invoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}/invoices`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve invoices');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  async downloadInvoice(invoiceId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}/download`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw new Error('Failed to download invoice. Please try again.');
    }
  }

  async requestRefund(refundRequest: RefundRequest): Promise<RefundResult> {
    try {
      const response = await fetch(`${this.baseUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(refundRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to process refund request');
      }

      const result: RefundResult = await response.json();

      // Log refund for Sofia AI to understand service quality
      await this.sofiaAI.logInteraction({
        type: 'refund_requested',
        context: 'professional_services',
        metadata: {
          paymentId: refundRequest.paymentId,
          reason: refundRequest.reason,
          amount: refundRequest.amount
        }
      });

      return result;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund. Please contact support.');
    }
  }

  async validatePaymentMethod(paymentMethodData: any): Promise<boolean> {
    try {
      // Basic client-side validation
      if (paymentMethodData.type === 'card') {
        const { cardNumber, expiryMonth, expiryYear, cvc } = paymentMethodData;

        // Validate card number (basic Luhn algorithm)
        if (!this.validateCardNumber(cardNumber)) {
          return false;
        }

        // Validate expiry date
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
          return false;
        }

        // Validate CVC
        if (!cvc || cvc.length < 3 || cvc.length > 4) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Payment method validation error:', error);
      return false;
    }
  }

  private validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');

    // Check if it's all digits
    if (!/^\d+$/.test(cleanNumber)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  async getPaymentAnalytics(customerId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}/payment-analytics`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve payment analytics');
      }

      const analytics = await response.json();

      // Enhance analytics with Sofia AI insights
      const insights = await this.sofiaAI.analyzeUserBehavior({
        paymentHistory: analytics,
        context: 'professional_services'
      });

      return {
        ...analytics,
        aiInsights: insights
      };
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      return null;
    }
  }

  async calculateConsultationPrice(
    consultationType: string,
    duration: number,
    attorneyRate: number,
    urgent: boolean = false
  ): Promise<number> {
    try {
      let basePrice = (duration / 60) * attorneyRate;

      // Apply consultation type modifiers
      const typeModifiers = {
        'initial_consultation': 1.0,
        'follow_up': 0.8,
        'document_review': 0.7,
        'urgent': 1.5
      };

      const modifier = typeModifiers[consultationType as keyof typeof typeModifiers] || 1.0;
      basePrice *= modifier;

      // Apply urgent surcharge
      if (urgent) {
        basePrice *= 1.5;
      }

      // Round to nearest dollar
      return Math.round(basePrice);
    } catch (error) {
      console.error('Error calculating consultation price:', error);
      return 0;
    }
  }

  async getPaymentHistory(customerId: string, limit: number = 10): Promise<PaymentResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}/payments?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve payment history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  async setupPaymentMethodForFutureUse(customerId: string): Promise<{ clientSecret: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/setup-intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ customerId })
      });

      if (!response.ok) {
        throw new Error('Failed to setup payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Error setting up payment method:', error);
      throw new Error('Failed to setup payment method. Please try again.');
    }
  }
}

export const paymentService = new PaymentService();
export default PaymentService;