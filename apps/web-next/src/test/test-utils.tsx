import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  'en': {
    'reminders': {
      'form': {
        'title': {
          'label': 'Title',
          'placeholder': 'Enter reminder title'
        },
        'when': {
          'label': 'When'
        },
        'saving': 'Saving...',
        'create': 'Create Reminder'
      },
      'dashboard': {
        'title': 'Reminders',
        'upcoming': 'Upcoming Reminders',
        'loading': 'Loading reminders...',
        'empty': 'No reminders yet'
      }
    }
  }
};

function render(ui: React.ReactElement, options = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <NextIntlClientProvider messages={messages} locale="en">
        {children}
      </NextIntlClientProvider>
    );
  }

  return rtlRender(ui, {
    wrapper: Wrapper,
    ...options
  });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };