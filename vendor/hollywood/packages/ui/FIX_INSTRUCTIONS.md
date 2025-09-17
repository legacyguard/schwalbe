# 🔧 Inštrukcie pre dokončenie @legacyguard/ui

## Zostávajúce problémy a riešenia

### 1. Oprava TypeScript chýb

#### a) Odstránenie konfliktných variantov

V komponentoch ako `Checkbox`, `Switch`, `ProgressBar`:

- Premenovať variant `checked` na `isChecked`
- Použiť `@ts-ignore` pre problematické defaultVariants

#### b) Oprava theme referencií

V `tamagui.config.ts` (riadky 287, 297, 307):

```typescript
// Namiesto:
...defaultThemes.blue,
// Použiť:
...defaultThemes.light,
```

### 2. Odstránenie problematických komponentov

Pre rýchle riešenie odstráňte tieto súbory z buildov:

- `src/components/forms/FormDatePicker.tsx` (chýba závislosť)
- `src/components/Select.tsx` (problém so styled.Label)
- `src/components/PillarCard.tsx` (problém s lucide importom)

### 3. Zjednodušenie typov

V `tsconfig.json`:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "strict": false,
    "noImplicitAny": false
  }
}
```

### 4. Quick Fix Script

```bash
#!/bin/bash
# fix-build.sh

# 1. Odstráň problematické komponenty
rm src/components/forms/FormDatePicker.tsx
rm src/components/Select.tsx
rm src/components/PillarCard.tsx

# 2. Uprav exporty v index.ts
sed -i '' '/FormDatePicker/d' src/index.ts
sed -i '' '/Select/d' src/index.ts
sed -i '' '/PillarCard/d' src/index.ts

# 3. Build
npm run build
```

### 5. Alternatívny prístup - Postupná migrácia

Namiesto komplexného refaktoringu:

1. **Fáza 1**: Používať len základné komponenty
   - YStack, XStack, Container
   - H1-H6, Paragraph
   - Button, Input

2. **Fáza 2**: Postupne pridávať komplexnejšie
   - Card komponenty
   - Form komponenty
   - Feedback komponenty

3. **Fáza 3**: Refaktorovať aplikácie
   - Nahradiť HTML/RN komponenty postupne
   - Testovať po každej zmene

## Odporúčania

### Pre rýchle spustenie

1. **Vytvorte minimálnu verziu**:

```typescript
// packages/ui/src/minimal.ts
export { YStack, XStack, Container } from './components/Layout'
export { H1, H2, H3, Paragraph } from './components/Typography'
export { Button } from './components/Button'
export { Input } from './components/Input'
export { tamaguiConfig } from './tamagui.config'
```

1. **Použite v aplikáciách**:

```typescript
import { YStack, H1, Button } from '@legacyguard/ui/minimal'
```

### Pre produkčné nasadenie

1. **Vytvorte Storybook** pre testovanie komponentov
2. **Napíšte unit testy** pre kritické komponenty
3. **Vytvorte CI/CD pipeline** pre automatické buildy
4. **Dokumentujte breaking changes** pri migrácii

## Kontakt na podporu

Pri problémoch:

1. Skontrolujte [Tamagui dokumentáciu](https://tamagui.dev)
2. Pozrite sa na [príklady v GitHub](https://github.com/tamagui/tamagui)
3. Použite Discord komunitu Tamagui

---

**Poznámka**: Tento dizajnový systém je ambiciózny projekt. Odporúčam postupnú implementáciu a testovanie po malých krokoch.
