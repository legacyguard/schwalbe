
describe('Payment Flow E2E Tests', () => {
  beforeEach(() => {
    // Reset database state
    cy.task('db:seed');

    // Visit the app
    cy.visit('/');
  });

  describe('Subscription Purchase Flow', () => {
    it('should allow user to purchase Essential plan', () => {
      // Sign up new user
      cy.visit('/signup');
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('Test123456!');
      cy.get('[data-cy=confirm-password-input]').type('Test123456!');
      cy.get('[data-cy=signup-button]').click();

      // Wait for redirect to dashboard
      cy.url().should('include', '/dashboard');

      // Navigate to pricing page
      cy.visit('/pricing');

      // Select Essential plan
      cy.get('[data-cy=plan-essential]').within(() => {
        cy.get('[data-cy=subscribe-button]').click();
      });

      // Should redirect to Stripe Checkout
      cy.origin('https://checkout.stripe.com', () => {
        // Fill in test card details
        cy.get('input[name="cardNumber"]').type('4242424242424242');
        cy.get('input[name="cardExpiry"]').type('1234'); // MM/YY
        cy.get('input[name="cardCvc"]').type('123');
        cy.get('input[name="billingName"]').type('Test User');
        cy.get('input[name="billingPostalCode"]').type('12345');

        // Submit payment
        cy.get('button[type="submit"]').click();
      });

      // Should redirect back to success page
      cy.url().should('include', '/subscription/success');
      cy.contains('Payment Successful').should('be.visible');

      // Verify subscription is active
      cy.visit('/account');
      cy.get('[data-cy=current-plan]').should('contain', 'Essential');
      cy.get('[data-cy=subscription-status]').should('contain', 'Active');
    });

    it('should handle 3D Secure authentication', () => {
      cy.visit('/signup');
      cy.get('[data-cy=email-input]').type('test3ds@example.com');
      cy.get('[data-cy=password-input]').type('Test123456!');
      cy.get('[data-cy=confirm-password-input]').type('Test123456!');
      cy.get('[data-cy=signup-button]').click();

      cy.visit('/pricing');
      cy.get('[data-cy=plan-family]').within(() => {
        cy.get('[data-cy=subscribe-button]').click();
      });

      cy.origin('https://checkout.stripe.com', () => {
        // Use 3D Secure test card
        cy.get('input[name="cardNumber"]').type('4000002500003155');
        cy.get('input[name="cardExpiry"]').type('1234');
        cy.get('input[name="cardCvc"]').type('123');
        cy.get('input[name="billingName"]').type('Test User');
        cy.get('input[name="billingPostalCode"]').type('12345');
        cy.get('button[type="submit"]').click();

        // Handle 3D Secure modal
        cy.get('iframe[name*="stripe"]').then($iframe => {
          const $body = $iframe.contents().find('body');
          cy.wrap($body)
            .find('button[data-test="complete-authentication"]')
            .click();
        });
      });

      cy.url().should('include', '/subscription/success');
    });

    it('should handle declined card', () => {
      cy.visit('/signup');
      cy.get('[data-cy=email-input]').type('testdeclined@example.com');
      cy.get('[data-cy=password-input]').type('Test123456!');
      cy.get('[data-cy=confirm-password-input]').type('Test123456!');
      cy.get('[data-cy=signup-button]').click();

      cy.visit('/pricing');
      cy.get('[data-cy=plan-premium]').within(() => {
        cy.get('[data-cy=subscribe-button]').click();
      });

      cy.origin('https://checkout.stripe.com', () => {
        // Use declined test card
        cy.get('input[name="cardNumber"]').type('4000000000000002');
        cy.get('input[name="cardExpiry"]').type('1234');
        cy.get('input[name="cardCvc"]').type('123');
        cy.get('input[name="billingName"]').type('Test User');
        cy.get('input[name="billingPostalCode"]').type('12345');
        cy.get('button[type="submit"]').click();

        // Should show error message
        cy.contains('Your card was declined').should('be.visible');
      });
    });
  });

  describe('Subscription Management', () => {
    beforeEach(() => {
      // Login as user with active subscription
      cy.login('subscriber@example.com', 'Test123456!');
    });

    it('should allow user to upgrade plan', () => {
      cy.visit('/account');
      cy.get('[data-cy=current-plan]').should('contain', 'Essential');

      cy.get('[data-cy=upgrade-button]').click();
      cy.url().should('include', '/pricing');

      // Upgrade to Family plan
      cy.get('[data-cy=plan-family]').within(() => {
        cy.get('[data-cy=subscribe-button]').click();
      });

      // Complete upgrade in Stripe
      cy.origin('https://checkout.stripe.com', () => {
        cy.get('button[type="submit"]').click();
      });

      cy.url().should('include', '/subscription/success');
      cy.visit('/account');
      cy.get('[data-cy=current-plan]').should('contain', 'Family');
    });

    it('should allow user to cancel subscription', () => {
      cy.visit('/account');
      cy.get('[data-cy=manage-subscription-button]').click();

      // Should open Stripe Customer Portal
      cy.origin('https://billing.stripe.com', () => {
        cy.get('[data-cy=cancel-plan-button]').click();
        cy.get('[data-cy=confirm-cancellation]').click();

        // Confirm cancellation
        cy.contains('Subscription cancelled').should('be.visible');
      });

      // Return to app
      cy.visit('/account');
      cy.get('[data-cy=subscription-status]').should('contain', 'Cancelled');
      cy.get('[data-cy=subscription-end-date]').should('be.visible');
    });

    it('should show usage limits and warnings', () => {
      cy.visit('/dashboard');

      // Check usage indicators
      cy.get('[data-cy=document-usage]').should('be.visible');
      cy.get('[data-cy=storage-usage]').should('be.visible');

      // Upload documents to reach limit
      for (let i = 0; i < 10; i++) {
        cy.get('[data-cy=upload-button]').click();
        cy.get('input[type="file"]').selectFile(
          'cypress/fixtures/test-document.pdf'
        );
        cy.wait(500);
      }

      // Should show usage warning
      cy.get('[data-cy=usage-warning]').should('be.visible');
      cy.get('[data-cy=usage-warning]').should(
        'contain',
        '90% of limit reached'
      );

      // Try to upload another document
      cy.get('[data-cy=upload-button]').click();
      cy.get('[data-cy=limit-reached-modal]').should('be.visible');
      cy.get('[data-cy=upgrade-prompt]').should('be.visible');
    });
  });

  describe('Webhook Processing', () => {
    it('should process successful payment webhook', () => {
      // Simulate webhook event
      cy.task('stripe:webhook', {
        type: 'checkout.session.completed',
        data: {
          customer: 'cus_test123',
          subscription: 'sub_test123',
          metadata: {
            user_id: 'test-user-id',
          },
        },
      });

      // Wait for webhook processing
      cy.wait(2000);

      // Check database state
      cy.task('db:query', {
        query:
          "SELECT * FROM user_subscriptions WHERE user_id = 'test-user-id'",
      }).then((result: { status: string; stripe_subscription_id: string }[]) => {
        expect(result[0].status).to.equal('active');
        expect(result[0].stripe_subscription_id).to.equal('sub_test123');
      });
    });

    it('should handle failed payment webhook', () => {
      cy.task('stripe:webhook', {
        type: 'invoice.payment_failed',
        data: {
          customer: 'cus_test123',
          subscription: 'sub_test123',
        },
      });

      cy.wait(2000);

      cy.task('db:query', {
        query:
          "SELECT * FROM user_subscriptions WHERE stripe_subscription_id = 'sub_test123'",
      }).then((result: unknown) => {
        expect((result as Array<{ status: string }>)[0].status).to.equal('past_due');
      });

      // Check if email was queued
      cy.task('db:query', {
        query: "SELECT * FROM email_logs WHERE subject LIKE '%Payment Failed%'",
      }).then((result: unknown) => {
        expect((result as unknown[]).length).to.be.greaterThan(0);
      });
    });
  });

  describe('Billing Cycle Management', () => {
    it('should handle monthly to yearly switch', () => {
      cy.login('monthly@example.com', 'Test123456!');
      cy.visit('/account');

      cy.get('[data-cy=billing-cycle]').should('contain', 'Monthly');
      cy.get('[data-cy=switch-to-yearly]').click();

      // Confirm switch
      cy.get('[data-cy=confirm-switch]').click();

      // Should process change
      cy.wait(3000);
      cy.get('[data-cy=billing-cycle]').should('contain', 'Yearly');

      // Verify prorated amount
      cy.get('[data-cy=next-payment-amount]').should('be.visible');
    });
  });

  describe('Free Plan Limitations', () => {
    beforeEach(() => {
      cy.login('freeuser@example.com', 'Test123456!');
    });

    it('should enforce document limit for free users', () => {
      cy.visit('/dashboard');

      // Upload documents up to free limit (100)
      cy.get('[data-cy=document-count]').should('contain', '0 / 100');

      // Try to exceed limit
      cy.task('db:seed:documents', { count: 100, userId: 'free-user-id' });
      cy.reload();

      cy.get('[data-cy=document-count]').should('contain', '100 / 100');
      cy.get('[data-cy=upload-button]').should('be.disabled');
      cy.get('[data-cy=upgrade-banner]').should('be.visible');
    });

    it('should block premium features for free users', () => {
      cy.visit('/dashboard');

      // Try to access AI features
      cy.get('[data-cy=ai-analysis-button]').click();
      cy.get('[data-cy=premium-feature-modal]').should('be.visible');
      cy.get('[data-cy=premium-feature-modal]').should(
        'contain',
        'Upgrade to access AI features'
      );

      // Try to enable offline mode
      cy.visit('/settings');
      cy.get('[data-cy=offline-mode-toggle]').should('be.disabled');
      cy.get('[data-cy=offline-mode-label]').should(
        'contain',
        'Premium feature'
      );
    });
  });
});

// Helper commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  cy.url().should('include', '/dashboard');
});

// Type definitions
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

export {};
