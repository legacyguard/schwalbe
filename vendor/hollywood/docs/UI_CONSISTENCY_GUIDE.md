# LegacyGuard UI Consistency Guide

## Overview

This guide documents the implementation of UI consistency between the web and mobile applications using the Tamagui design system. Both platforms share the same component library, theme tokens, and design patterns to ensure a cohesive user experience.

## Architecture

### Shared UI Package (`@legacyguard/ui`)

The monorepo structure includes a shared UI package that exports cross-platform components:

```text
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button.tsx         # Button components
│   │   ├── Card.tsx           # Card components
│   │   ├── Input.tsx          # Input components
│   │   ├── Layout.tsx         # Layout components
│   │   ├── Typography.tsx     # Typography components
│   │   ├── PillarCard.tsx     # Custom pillar card component
│   │   └── ProgressBar.tsx    # Progress indicators
│   ├── tamagui.config.ts      # Theme configuration
│   └── index.ts               # Package exports
```

### Theme Configuration

The Tamagui configuration defines our design tokens:

```typescript
// packages/ui/src/tamagui.config.ts

const legacyGuardColors = {
  // Primary Blue - trust and reliability
  primaryBlue: '#1e40af',
  primaryBlueLight: '#3b82f6',
  primaryBlueDark: '#1e3a8a',
  
  // Primary Green - success and confirmation
  primaryGreen: '#16a34a',
  primaryGreenLight: '#22c55e',
  primaryGreenDark: '#15803d',
  
  // Accent Gold - premium features
  accentGold: '#f59e0b',
  accentGoldLight: '#fbbf24',
  accentGoldDark: '#d97706',
  
  // ... other colors
}
```

## Component Usage

### 1. Basic Components

All basic UI components are available from `@legacyguard/ui`:

```tsx
import { 
  Button, 
  Card, 
  Input, 
  H1, 
  Paragraph,
  Stack,
  Row 
} from '@legacyguard/ui';

// Usage is identical on web and mobile
<Card variant="elevated" padding="medium">
  <Stack space="medium">
    <H1>Welcome</H1>
    <Paragraph>This works on both platforms!</Paragraph>
    <Button variant="primary" onPress={handlePress}>
      Continue
    </Button>
  </Stack>
</Card>
```

### 2. Custom Components

#### PillarCard Component

A specialized card component for feature sections:

```tsx
import { PillarCard } from '@legacyguard/ui';
import { Shield } from 'lucide-react-native';

<PillarCard
  title="Document Vault"
  subtitle="Securely store your important documents"
  icon={Shield}
  isActive={true}
  actionButton={{
    text: "Open Vault",
    onPress: () => navigation.navigate('Vault')
  }}
>
  {/* Optional content */}
  <Paragraph>24 documents protected</Paragraph>
</PillarCard>
```

#### ProgressBar Components

Three types of progress indicators:

```tsx
import { 
  ProgressBar, 
  CircularProgress, 
  SegmentedProgress 
} from '@legacyguard/ui';

// Linear progress
<ProgressBar 
  value={75} 
  label="Profile Completion" 
  variant="primary" 
/>

// Circular progress
<CircularProgress 
  value={78} 
  size={120} 
  variant="premium" 
/>

// Segmented progress (for multi-step processes)
<SegmentedProgress
  segments={5}
  currentSegment={3}
  labels={['Start', 'Verify', 'Upload', 'Review', 'Complete']}
/>
```

## Theme Management

### Mobile Theme Switching

The mobile app includes a theme context for managing dark/light mode:

```tsx
// mobile/src/contexts/ThemeContext.tsx

import { useAppTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { themeMode, actualTheme, setThemeMode } = useAppTheme();
  
  // Switch theme
  await setThemeMode('dark'); // 'light' | 'dark' | 'system'
}
```

### Web Theme Switching

On web, theme switching is handled through Tamagui's built-in theme system:

```tsx
import { useTheme } from '@legacyguard/ui';

function MyComponent() {
  const theme = useTheme();
  
  // Access theme tokens
  const primaryColor = theme.primaryBlue.val;
}
```

## Navigation Styling

### Mobile Navigation

The mobile navigation uses Tamagui theme tokens:

```tsx
// mobile/src/navigation/MainTabs.tsx

const theme = useTheme();

<Tab.Navigator
  screenOptions={{
    tabBarActiveTintColor: theme.primaryBlue.val,
    tabBarInactiveTintColor: theme.gray5.val,
    tabBarStyle: {
      backgroundColor: theme.background.val,
      borderTopColor: theme.borderColor.val,
      // ...
    }
  }}
>
```

## Responsive Design

### Using Media Queries

Tamagui provides responsive utilities:

```tsx
import { useMedia } from '@legacyguard/ui';

function ResponsiveComponent() {
  const media = useMedia();
  
  return (
    <Stack
      flexDirection={media.sm ? 'column' : 'row'}
      padding={media.xs ? '$3' : '$5'}
    >
      {/* Content adapts to screen size */}
    </Stack>
  );
}
```

### Platform-Specific Adjustments

When necessary, use platform detection:

```tsx
import { Platform } from 'react-native';

<Button
  size={Platform.OS === 'web' ? 'medium' : 'large'}
  // Mobile buttons are typically larger for touch
>
```

## Animation Consistency

### Shared Animation Configs

Animations are defined in the Tamagui config:

```tsx
// packages/ui/src/tamagui.config.ts

const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  medium: {
    type: 'spring',
    damping: 15,
    stiffness: 120,
  },
  // ...
});
```

### Using Animations

```tsx
<Card
  animation="medium"
  pressStyle={{ scale: 0.98 }}
  hoverStyle={{ borderColor: '$primaryBlueLight' }}
>
  {/* Animated content */}
</Card>
```

## Form Components

### Consistent Form Handling

Use the shared Input components:

```tsx
import { 
  Input, 
  InputGroup, 
  InputLabel, 
  InputError 
} from '@legacyguard/ui';

<InputGroup>
  <InputLabel htmlFor="email">Email</InputLabel>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    value={email}
    onChangeText={setEmail}
  />
  {error && <InputError>{error}</InputError>}
</InputGroup>
```

## Testing UI Consistency

### Visual Regression Testing

1. **Component Screenshots**: Take screenshots of components on both platforms
2. **Compare Differences**: Use tools like Percy or Chromatic
3. **Automated Testing**: Run in CI/CD pipeline

### Manual Testing Checklist

- [ ] Colors match design tokens
- [ ] Typography is consistent
- [ ] Spacing follows the design system
- [ ] Animations are smooth
- [ ] Dark mode works correctly
- [ ] Touch targets are appropriate size (mobile)
- [ ] Hover states work (web)
- [ ] Keyboard navigation works (web)

## Best Practices

### 1. Always Use Theme Tokens

```tsx
// ❌ Bad
<View style={{ backgroundColor: '#1e40af' }}>

// ✅ Good
<View backgroundColor="$primaryBlue">
```

### 2. Leverage Tamagui Props

```tsx
// ❌ Bad
<View style={{ padding: 16, marginTop: 8 }}>

// ✅ Good
<View padding="$4" marginTop="$2">
```

### 3. Create Reusable Components

When you need custom styling, create a reusable component:

```tsx
// packages/ui/src/components/CustomCard.tsx

export const CustomCard = styled(Card, {
  backgroundColor: '$backgroundSecondary',
  borderRadius: '$4',
  padding: '$5',
  // Custom variants
  variants: {
    highlight: {
      true: {
        borderWidth: 2,
        borderColor: '$primaryBlue',
      }
    }
  }
});
```

### 4. Handle Platform Differences Gracefully

```tsx
// Create platform-specific variants when needed
const StyledButton = styled(Button, {
  variants: {
    platform: {
      mobile: {
        height: 56,
        fontSize: '$5',
      },
      web: {
        height: 44,
        fontSize: '$4',
      }
    }
  }
});

// Usage
<StyledButton platform={Platform.OS === 'web' ? 'web' : 'mobile'}>
  Click Me
</StyledButton>
```

## Migration Guide

### Converting Web Components to Shared Components

1. **Identify the component** in the web codebase
2. **Extract styles** to Tamagui tokens
3. **Create cross-platform version** in `packages/ui`
4. **Test on both platforms**
5. **Update imports** in both web and mobile apps

### Converting Mobile Screens to Use Shared Components

1. **Replace React Native components** with Tamagui equivalents:
   - `View` → `Stack`, `Row`, or `Box`
   - `Text` → `Paragraph`, `H1-H6`, or `Label`
   - `TouchableOpacity` → `Button` or clickable `Card`

2. **Update styles** to use theme tokens
3. **Test interactions** on devices

## Troubleshooting

### Common Issues

#### 1. Theme not updating

- Ensure `TamaguiProvider` wraps your app
- Check that theme context is properly initialized
- Verify AsyncStorage permissions (mobile)

#### 2. Components look different on platforms

- Check if platform-specific styles are applied
- Verify font loading on both platforms
- Ensure consistent padding/margins using tokens

#### 3. Animations not working

- Import animations from Tamagui config
- Check that animation prop is applied
- Verify Reanimated is properly installed (mobile)

## Resources

- [Tamagui Documentation](https://tamagui.dev)
- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [LegacyGuard Design System](./DESIGN_SYSTEM.md)

## Next Steps

1. **Complete remaining screens** - Build Family, Guardians, Activity screens
2. **Add i18n support** - Integrate with shared localization
3. **Implement E2E tests** - Ensure UI consistency automatically
4. **Create Storybook** - Document all components
5. **Performance optimization** - Profile and optimize renders
