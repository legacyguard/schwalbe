# Storybook Cheat Sheet - Rýchly prehľad príkazov

## Spustenie a Build

```bash
# Spustenie vývojového servera
npm run storybook

# Build pre produkciu
npm run build-storybook

# Spustenie na konkrétnom porte
npm run storybook -- --port 6007
```

## Štruktúra Story súborov

```typescript
// Component.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';

const meta: Meta<typeof Component> = {
  title: 'Kategória/Component',
  component: Component,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button text',
    variant: 'primary',
  },
};
```

## Konfigurácia Controls

```typescript
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline'],
  },
  size: {
    control: 'radio',
    options: ['small', 'medium', 'large'],
  },
  disabled: {
    control: 'boolean',
  },
}
```

## Dekorátory (Wrappers)

```typescript
decorators: [
  (Story) => (
    <TamaguiProvider config={config}>
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    </TamaguiProvider>
  ),
],
```

## Parameters

```typescript
parameters: {
  layout: 'centered', // 'fullscreen', 'padded'
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#ffffff' },
      { name: 'dark', value: '#1a1a1a' },
    ],
  },
}
```

## Príklady stories

```typescript
// Variants
export const Primary = { args: { variant: 'primary' } };
export const Secondary = { args: { variant: 'secondary' } };

// Sizes
export const Small = { args: { size: 'small' } };
export const Large = { args: { size: 'large' } };

// Interactive
export const Interactive = {
  args: { children: 'Click me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
  },
};
