import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { TamaguiProvider } from 'tamagui';
import config from '../src/tamagui.config';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
  },
  decorators: [
    (Story) => (
      <TamaguiProvider config={config} defaultTheme="light">
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </TamaguiProvider>
    ),
  ],
};

export default preview;
