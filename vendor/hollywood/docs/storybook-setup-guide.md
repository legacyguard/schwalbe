# Storybook Setup Guide - @legacyguard/ui

## Úvod

Tento dokument popisuje kompletný proces inicializácie a konfigurácie Storybooku pre náš zdieľaný UI balíček `@legacyguard/ui`. Storybook nám poskytuje profesionálne prostredie pre vývoj, testovanie a dokumentáciu UI komponentov.

## Čo je Storybook?

Storybook je open-source nástroj pre vývoj UI komponentov v izolácii. Umožňuje nám:

- Vyvíjať komponenty oddelene od hlavnej aplikácie
- Vytvárať interaktívnu dokumentáciu
- Testovať rôzne stavy komponentov
- Zdieľať komponenty medzi tímom

## Inštalácia a Inicializácia

### Krok 1: Inicializácia Storybooku

```bash
cd packages/ui
npx storybook@latest init
```

Počas inicializácie vyberte:

- **Framework**: React
- **Builder**: Vite
- **TypeScript**: Áno

### Krok 2: Inštalácia závislostí

Storybook automaticky nainštaluje potrebné závislosti:

- `@storybook/react-vite`
- `@storybook/react`
- `@storybook/addon-essentials`
- `@storybook/addon-interactions`
- `@storybook/testing-library`
- `@storybook/jest`

## Konfigurácia

### Hlavná konfigurácia (`.storybook/main.ts`)

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  features: {
    storyStoreV7: true,
  },
};

export default config;
```

### Preview konfigurácia (`.storybook/preview.tsx`)

```typescript
import type { Preview } from '@storybook/react';
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
```

## Štruktúra súborov

```text
packages/ui/
├── .storybook/
│   ├── main.ts          # Hlavná konfigurácia
│   └── preview.tsx      # Preview konfigurácia
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx    # Story pre Button
│   │   ├── Card.tsx
│   │   └── Card.stories.tsx      # Story pre Card
│   └── tamagui.config.ts        # Tamagui konfigurácia
└── package.json
```

## Používanie

### Spustenie Storybooku

```bash
# Vývojový režim
npm run storybook

# Build pre produkciu
npm run build-storybook
```

### Pridanie nového komponentu

1. Vytvorte komponent v `src/components/`
2. Vytvorte súbor `.stories.tsx` pre daný komponent
3. Pridajte rôzne stories pre rôzne stavy komponentu

### Príklad story súboru

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};
```

## Tamagui Integrácia

Storybook je plne integrovaný s Tamagui:

- Používa našu Tamagui konfiguráciu
- Načítava všetky globálne štýly
- Podporuje témy (light/dark)
- Zachováva konzistentný vzhľad s hlavnou aplikáciou

## Troubleshooting

### Bežné problémy a riešenia

#### Port 6006 je obsadený

- Storybook automaticky ponúkne alternatívny port (6008)
- Alebo manuálne zadajte: `npm run storybook -- --port 6007`

#### Chyba s Tamagui konfiguráciou

- Skontrolujte import cesty v `.storybook/preview.tsx`
- Uistite sa, že `tamagui.config.ts` existuje

#### Stories sa nezobrazujú

- Skontrolujte názov súboru - musí končiť na `.stories.tsx`
- Overte cestu v `main.ts` konfigurácii

## Best Practices

### Písanie Stories

- Používajte deskriptívne názvy
- Pokrývajte všetky varianty komponentu
- Pridávajte interaktívne kontroly (controls)
- Dokumentujte props pomocou argTypes

### Organizácia

- Groupujte stories podľa komponentov
- Používajte konzistentné naming konvencie
- Pridávajte kategórie pre lepšiu navigáciu

## Ďalšie zdroje

- [Storybook Documentation](https://storybook.js.org/docs)
- [Tamagui Documentation](https://tamagui.dev/docs)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)

## Zhrnutie

Storybook je teraz plne funkčný a pripravený na použitie. Všetky komponenty sa zobrazujú s kompletnou Tamagui integráciou a môžete začať vytvárať interaktívnu dokumentáciu pre váš UI balíček.
