
/// <reference types="cypress" />

describe('LegacyGuard App Basic Loading', () => {
  it('loads the landing page without errors', () => {
    cy.visit('/');

    // Check that the page loads and contains expected elements
    cy.get('body').should('be.visible');

    // Look for any critical JavaScript errors
    cy.window().then(win => {
      // Add event listener for unhandled errors
      win.addEventListener('error', e => {
        throw new Error(`JavaScript error: ${e.error.message}`);
      });
    });

    // Wait a moment for the app to initialize
    cy.wait(3000);

    // Check if React app mounted successfully
    cy.get('#root').should('exist');

    // Check for common error indicators
    cy.get('body').should('not.contain', 'Something went wrong');
    cy.get('body').should('not.contain', 'Error:');
    cy.get('body').should('not.contain', 'Failed to load');
  });

  it('handles routing to different pages', () => {
    cy.visit('/');

    // Try visiting different routes to check for errors
    cy.visit('/terms', { failOnStatusCode: false });
    cy.get('body').should('be.visible');

    cy.visit('/privacy', { failOnStatusCode: false });
    cy.get('body').should('be.visible');

    cy.visit('/blog', { failOnStatusCode: false });
    cy.get('body').should('be.visible');
  });

  it('loads protected routes correctly (should redirect to auth)', () => {
    cy.visit('/dashboard', { failOnStatusCode: false });

    // Should either show auth form or redirect
    cy.url().should('satisfy', url => {
      return (
        url.includes('/sign-in') ||
        url.includes('clerk') ||
        url.includes('auth')
      );
    });
  });
});
