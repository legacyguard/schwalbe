# 🎨 @legacyguard/ui - Unified Design System

**"One Soul" Design System** pre LegacyGuard aplikácie - jednotný dizajnový jazyk pre web a mobilné aplikácie.

## 📋 Obsah

- [Inštalácia](#installation)
- [Základné použitie](#basic-usage)
- [Komponenty](#components)
- [Dizajnové tokeny](#design-tokens)
- [Princípy](#principles)

## 🚀 Inštalácia {#installation}

```bash
# Pre web aplikáciu
cd apps/web
npm install @legacyguard/ui

# Pre mobilnú aplikáciu
cd mobile
npm install @legacyguard/ui
```

## 💡 Základné použitie {#basic-usage}

### Setup pre web

```tsx
import { TamaguiProvider, tamaguiConfig } from '@legacyguard/ui'

function App() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      {/* Vaša aplikácia */}
    </TamaguiProvider>
  )
}
```

### Setup pre React Native

```tsx
import { TamaguiProvider, tamaguiConfig } from '@legacyguard/ui'

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      {/* Vaša aplikácia */}
    </TamaguiProvider>
  )
}
```

## 🧩 Komponenty {#components}

### Layout komponenty

#### YStack & XStack

Nahrádzajú `<div>` a `<View>` s flexbox layoutom:

```tsx
import { YStack, XStack } from '@legacyguard/ui'

// Vertikálny layout
<YStack space="$4" padding="$4">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</YStack>

// Horizontálny layout
<XStack space="$2" align="center">
  <Icon />
  <Text>With icon</Text>
</XStack>
```

#### Container

Wrapper pre hlavný obsah s responzívnym obmedzením šírky:

```tsx
<Container size="medium" padding="large">
  {/* Obsah */}
</Container>
```

### Typografia

```tsx
import { H1, H2, H3, Paragraph, Caption } from '@legacyguard/ui'

<H1>Hlavný nadpis</H1>
<H2>Podnadpis</H2>
<Paragraph>
  Toto je bežný text paragraf s jednotným štýlom.
</Paragraph>
<Caption>Malý popisný text</Caption>
```

### Tlačidlá

```tsx
import { Button } from '@legacyguard/ui'

<Button variant="primary" size="large" onPress={handlePress}>
  Kliknite sem
</Button>

<Button variant="outline" icon={<Plus />}>
  Pridať položku
</Button>
```

### Formulárové prvky

```tsx
import { Input, Select, Checkbox, Switch } from '@legacyguard/ui'

<Input 
  placeholder="Email" 
  value={email}
  onChangeText={setEmail}
/>

<Select
  options={options}
  value={selected}
  onChange={setSelected}
/>

<Checkbox
  checked={agreed}
  onCheckedChange={setAgreed}
  label="Súhlasím s podmienkami"
/>

<Switch
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

### Karty

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@legacyguard/ui'

<Card>
  <CardHeader>
    <CardTitle>Názov karty</CardTitle>
  </CardHeader>
  <CardContent>
    <Paragraph>Obsah karty</Paragraph>
  </CardContent>
  <CardFooter>
    <Button>Akcia</Button>
  </CardFooter>
</Card>
```

### Feedback komponenty

#### Alert

```tsx
import { AlertBox } from '@legacyguard/ui'

<AlertBox
  variant="success"
  title="Úspech!"
  description="Operácia bola úspešne dokončená."
  closable
/>
```

#### Badge

```tsx
import { Badge, BadgeGroup } from '@legacyguard/ui'

<BadgeGroup>
  <Badge variant="primary">Nové</Badge>
  <Badge variant="success">Aktívne</Badge>
  <Badge variant="warning">Čoskoro</Badge>
</BadgeGroup>
```

#### Skeleton

Pre loading states:

```tsx
import { SkeletonCard, SkeletonText } from '@legacyguard/ui'

{isLoading ? (
  <SkeletonCard />
) : (
  <Card>{/* Skutočný obsah */}</Card>
)}
```

## 🎨 Dizajnové tokeny {#design-tokens}

### Farby

```tsx
// Hlavné farby
$primaryBlue    // #1e40af - Dôveryhodnosť
$primaryGreen   // #16a34a - Úspech
$accentGold     // #f59e0b - Premium

// Neutrálne
$gray1 až $gray10

// Semantic
$success, $warning, $error, $info
```

### Medzery (Space)

```tsx
$space.1  // 4px
$space.2  // 8px
$space.3  // 12px
$space.4  // 16px
$space.6  // 24px
$space.8  // 32px
```

### Zaoblenie (Radius)

```tsx
$radius.1  // 4px - Malé prvky
$radius.2  // 8px - Tlačidlá
$radius.3  // 12px - Karty
$radius.4  // 16px - Modály
```

### Z-Index

```tsx
$zIndex.dropdown  // 1000
$zIndex.modal     // 1050
$zIndex.tooltip   // 1070
$zIndex.toast     // 1080
```

## 🏛️ Princípy "One Soul" {#principles}

### 1. **Jednotná vizuálna identita**

Všetky komponenty zdieľajú rovnaké dizajnové tokeny, animácie a správanie naprieč platformami.

### 2. **Sémantické názvy**

Používame jasné, popisné názvy pre varianty a props:

- ✅ `variant="success"`
- ❌ `type="green"`

### 3. **Kompozícia nad dedičnosťou**

Komponenty sú navrhnuté tak, aby sa dali skladať:

```tsx
<Card>
  <YStack space="$4">
    <XStack align="center">
      <Avatar />
      <H3>Názov</H3>
    </XStack>
    <Paragraph>Popis</Paragraph>
  </YStack>
</Card>
```

### 4. **Responzívny dizajn**

Komponenty automaticky fungujú na všetkých veľkostiach obrazoviek:

```tsx
<Grid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
  {/* Automaticky responzívny grid */}
</Grid>
```

### 5. **Prístupnosť (Accessibility)**

Všetky komponenty majú zabudovanú podporu pre:

- Klávesnicovú navigáciu
- Screen readery
- ARIA atribúty
- Fokusové indikátory

## 🔄 Migrácia z natívnych elementov

### Web (React)

```tsx
// Pred
<div className="flex flex-col gap-4 p-4">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-gray-600">Description</p>
  <button className="px-4 py-2 bg-blue-500 text-white">
    Click me
  </button>
</div>

// Po
<YStack space="$4" padding="$4">
  <H1>Title</H1>
  <Paragraph color="$gray6">Description</Paragraph>
  <Button variant="primary">Click me</Button>
</YStack>
```

### Mobile (React Native)

```tsx
// Pred
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
  <TextInput 
    style={styles.input}
    value={text}
    onChangeText={setText}
  />
</View>

// Po
<YStack space="$4" padding="$4">
  <H1>Title</H1>
  <Input 
    value={text}
    onChangeText={setText}
  />
</YStack>
```

## 🎯 Best Practices

1. **Vždy používajte dizajnové tokeny** namiesto hardcoded hodnôt
2. **Preferujte YStack/XStack** pred div/View
3. **Používajte sémantické komponenty** (H1-H6, Paragraph) pre text
4. **Skladajte komponenty** namiesto vytvárania monolitických štruktúr
5. **Testujte na oboch platformách** (web aj mobile)

## 📚 Ďalšie zdroje

- [Tamagui dokumentácia](https://tamagui.dev)
- Figma dizajnový systém — TODO: pridať link
- Storybook — TODO: nasadiť

## 🤝 Prispievanie

Pri vytváraní nových komponentov:

1. Vytvorte komponent v `packages/ui/src/components/`
2. Exportujte ho v `packages/ui/src/index.ts`
3. Pridajte dokumentáciu a príklady
4. Otestujte na web aj mobile platforme
5. Vytvorte PR s popisom zmien

---

**LegacyGuard UI** - Jednotný dizajn pre dôstojnú digitálnu dedičnosť 🛡️
