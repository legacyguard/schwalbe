
import React from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';

// Get Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not defined');
}

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  if (!clerkPubKey) {
    return <div>Missing Clerk configuration</div>;
  }

  return (
    <BaseClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        // Remove dark theme - use light theme matching your design
        // baseTheme: undefined, // Remove dark theme

        // Layout configuration
        layout: {
          helpPageUrl: 'https://help.legacyguard.com',
          logoImageUrl: '/shield-icon.svg',
          logoPlacement: 'inside',
          privacyPageUrl: 'https://legacyguard.com/privacy',
          showOptionalFields: false,
          socialButtonsPlacement: 'bottom',
          socialButtonsVariant: 'iconButton',
          termsPageUrl: 'https://legacyguard.com/terms',
        },

        // Custom elements with your Tailwind classes
        elements: {
          // Forms and buttons
          formButtonPrimary:
            'bg-primary hover:bg-primary-hover text-primary-foreground shadow-md transition-all duration-200',
          formButtonReset: 'text-muted-foreground hover:text-foreground',

          // Cards and containers
          card: 'bg-content-background shadow-lg border border-card-border rounded-xl',
          modalContent: 'bg-content-background',

          // Headers and text
          headerTitle: 'text-foreground font-semibold',
          headerSubtitle: 'text-muted-foreground',

          // Form fields
          formFieldLabel: 'text-foreground font-medium',
          formFieldInput:
            'bg-white border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary',
          formFieldInputShowPasswordButton:
            'text-muted-foreground hover:text-foreground',

          // Social buttons
          socialButtonsBlockButton:
            'bg-white border-border hover:bg-muted text-foreground transition-colors',
          socialButtonsBlockButtonText: 'text-foreground font-medium',

          // Links
          footerActionLink:
            'text-primary hover:text-primary-hover underline-offset-4 hover:underline',
          identityPreviewEditButton: 'text-primary hover:text-primary-hover',

          // Avatars
          avatarBox: 'rounded-full',
          avatarImageBox: 'rounded-full',

          // Alerts and messages
          alert: 'text-foreground',
          alertText: 'text-foreground',

          // Other elements
          dividerLine: 'bg-border',
          dividerText: 'text-muted-foreground',
          footer: 'text-muted-foreground',
          formHeaderTitle: 'text-foreground',
          formHeaderSubtitle: 'text-muted-foreground',
          otpCodeFieldInput: 'bg-white border-border text-foreground',
          profileSectionTitle: 'text-foreground',
          selectButton: 'bg-white border-border text-foreground',
          userButtonPopoverCard: 'bg-content-background border-border',
          userButtonPopoverFooter: 'bg-muted',
          navbar: 'bg-content-background',
          navbarButton: 'text-foreground hover:text-primary',
        },

        // Custom CSS variables matching your design system
        variables: {
          // Use your design system colors
          colorPrimary: 'hsl(95 35% 42%)', // Your primary green
          colorDanger: 'hsl(0 65% 55%)', // Your destructive color
          colorSuccess: 'hsl(142 51% 45%)', // Your success color
          colorWarning: 'hsl(45 93% 58%)', // Your warning color
          colorNeutral: 'hsl(30 15% 55%)', // Muted foreground

          // Backgrounds
          colorBackground: 'hsl(42 33% 98%)', // Your warm off-white background
          colorInputBackground: 'hsl(0 0% 100%)', // Pure white for inputs
          colorShimmer: 'hsl(30 15% 96%)',

          // Text colors
          colorText: 'hsl(30 25% 15%)', // Your deep earthy text
          colorTextOnPrimaryBackground: 'hsl(42 33% 98%)', // Light text on primary
          colorTextSecondary: 'hsl(30 15% 55%)', // Muted text
          colorInputText: 'hsl(30 25% 15%)', // Dark text in inputs

          // Border radius matching your design
          borderRadius: '0.75rem', // 12px from your --radius

          // Font family
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontFamilyButtons:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

          // Font sizes
          fontSize: '1rem',

          // Font weights
          fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
          },

          // Spacing
          spacingUnit: '0.25rem', // 4px base
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}
