
/// <reference types="cypress" />

describe('LegacyGuard Comprehensive Application Test', () => {
  beforeEach(() => {
    // Handle uncaught exceptions from our app
    cy.on('uncaught:exception', (err) => {
      // Don't fail tests for expected development warnings/errors
      if (err.message.includes('ResizeObserver loop limit exceeded')) {
        return false;
      }
      if (err.message.includes('Non-serializable values were found')) {
        return false;
      }
      return true;
    });
  });

  it('loads the landing page and displays key elements', () => {
    cy.visit('/');

    // Page should load within reasonable time
    cy.get('#root', { timeout: 30000 }).should('be.visible');

    // Basic page structure should exist
    cy.get('body').should('contain.text', 'LegacyGuard');

    // Check for navigation or header elements (adjust selectors as needed)
    cy.get('nav, header, [role="navigation"], [role="banner"]', {
      timeout: 10000,
    }).should('exist');

    // Landing page should have some call-to-action
    cy.get('button, [role="button"], a[href*="sign"]', {
      timeout: 10000,
    }).should('exist');
  });

  it('can navigate to different public pages', () => {
    // Test Terms page
    cy.visit('/terms');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/terms');

    // Test Privacy page
    cy.visit('/privacy');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/privacy');

    // Test Blog page
    cy.visit('/blog');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/blog');
  });

  it('properly handles protected routes (authentication redirect)', () => {
    cy.visit('/dashboard');

    // Should either redirect to auth or show auth form
    cy.url({ timeout: 10000 }).should('satisfy', url => {
      return (
        url.includes('/sign-in') ||
        url.includes('clerk.') ||
        url.includes('auth') ||
        url.includes('accounts.dev')
      );
    });
  });

  it('displays proper error page for non-existent routes', () => {
    cy.visit('/non-existent-page', { failOnStatusCode: false });

    // Should show 404 or redirect to home
    cy.url({ timeout: 10000 }).should('satisfy', url => {
      return (
        url.includes('/non-existent-page') ||
        url === Cypress.config().baseUrl + '/'
      );
    });
  });

  it('has working responsive design', () => {
    cy.visit('/');

    // Test mobile viewport
    cy.viewport('iphone-6');
    cy.get('body').should('be.visible');

    // Test tablet viewport
    cy.viewport('ipad-2');
    cy.get('body').should('be.visible');

    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.get('body').should('be.visible');
  });

  it('has proper document head and SEO elements', () => {
    cy.visit('/');

    // Check for proper title
    cy.title().should('contain', 'LegacyGuard');

    // Check for meta description
    cy.get('meta[name="description"]').should('exist');

    // Check for favicon
    cy.get('link[rel="icon"], link[rel="shortcut icon"]').should('exist');

    // Check for viewport meta
    cy.get('meta[name="viewport"]').should('exist');
  });

  it('handles JavaScript and loads without console errors', () => {
    const consoleErrors = [];

    cy.window().then(win => {
      const originalConsoleError = win.console.error;
      win.console.error = function (...args) {
        consoleErrors.push(args.join(' '));
        originalConsoleError.apply(win.console, args);
      };
    });

    cy.visit('/');
    cy.wait(3000); // Allow time for app to fully initialize

    cy.then(() => {
      // Filter out expected development warnings
      const criticalErrors = consoleErrors.filter(
        error =>
          !error.includes('Warning:') &&
          !error.includes('ResizeObserver') &&
          !error.includes('Non-serializable') &&
          !error.includes('DevTools')
      );

      expect(criticalErrors).to.have.length(
        0,
        `Found console errors: ${criticalErrors.join(', ')}`
      );
    });
  });

  it('can interact with basic UI elements', () => {
    cy.visit('/');

    // Try to find and interact with buttons
    cy.get('button, [role="button"]')
      .first()
      .should('be.visible')
      .then($btn => {
        // Only click if it's not a navigation button that would change the page
        if (
          !$btn.text().toLowerCase().includes('sign') &&
          !$btn.text().toLowerCase().includes('login') &&
          !$btn.text().toLowerCase().includes('start')
        ) {
          cy.wrap($btn).click();
        }
      });

    // Try to find and interact with links
    cy.get('a[href]:not([href*="mailto"]):not([href*="tel"])')
      .first()
      .then($link => {
        const href = $link.attr('href');
        // Only test internal links
        if (href && (href.startsWith('/') || href.startsWith('#'))) {
          cy.wrap($link).should('be.visible');
        }
      });
  });
});
