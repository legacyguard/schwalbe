# Emotional Sync Integration Guide

## Overview

This document describes how to integrate the emotional sync components into the existing mobile application.

## Architecture

```
apps/mobile/src/
├── temp-emotional-sync/           # Complete emotional component library
├── config/featureFlags.ts         # Feature flag configuration
├── components/
│   ├── emotional/                  # Integration wrapper components
│   └── enhanced/                   # Enhanced versions of existing screens
```

## Feature Flags

All emotional sync features are controlled by environment variables:

```bash
# Master switch - all features require this to be enabled
EXPO_PUBLIC_EMOTIONAL_SYNC_ENABLED=1

# Individual feature toggles
EXPO_PUBLIC_SOFIA_FIREFLY_ENABLED=1
EXPO_PUBLIC_EMOTIONAL_MESSAGES_ENABLED=1
EXPO_PUBLIC_ACHIEVEMENTS_ENABLED=1
EXPO_PUBLIC_HAPTIC_FEEDBACK_ENABLED=1
EXPO_PUBLIC_DAILY_CHECKIN_ENABLED=1
EXPO_PUBLIC_FAMILY_PHOTOS_ENABLED=1
EXPO_PUBLIC_EMOTIONAL_ONBOARDING_ENABLED=1
```

## Integration Strategy

### 1. Feature Flag Controlled

All emotional features are behind feature flags and will not affect the existing app unless explicitly enabled.

### 2. Lazy Loading

Components are dynamically imported only when needed, minimizing bundle size impact:

```typescript
const MobileSofiaFirefly = React.lazy(() =>
  import('../../temp-emotional-sync').then(module => ({
    default: module.MobileSofiaFirefly
  }))
);
```

### 3. Backward Compatibility

- Original components remain unchanged
- Enhanced versions are created separately
- Easy rollback capability

## Usage Examples

### Basic Wrapper

```typescript
import { EmotionalWrapper } from '../components/emotional';

function MyScreen() {
  return (
    <EmotionalWrapper enableSofia={true}>
      {/* Your existing content */}
    </EmotionalWrapper>
  );
}
```

### Conditional Features

```typescript
import { ConditionalEmotionalMessage } from '../components/emotional';

function MyComponent() {
  return (
    <>
      {/* Your content */}
      <ConditionalEmotionalMessage
        message={welcomeMessage}
        variant="success"
        onDismiss={() => setMessage(null)}
      />
    </>
  );
}
```

### Enhanced Screen

```typescript
// Replace original import with enhanced version when ready
import { EnhancedHomeScreen } from '../components/enhanced';

export default EnhancedHomeScreen;
```

## Available Components

### Core Components

- **MobileSofiaFirefly**: Touch-interactive firefly with haptic feedback
- **EmotionalMessageCard**: Contextual emotional messages
- **AchievementCelebration**: Milestone celebrations with animations
- **DailyCheckIn**: Personal emotional check-in system
- **FamilyPhotoIntegration**: Visual family motivation
- **EmotionalOnboarding**: Enhanced onboarding flow

### Integration Wrappers

- **EmotionalWrapper**: Screen-level emotional feature wrapper
- **ConditionalEmotionalMessage**: Feature-flagged message component
- **ConditionalAchievement**: Feature-flagged achievement component
- **ConditionalDailyCheckIn**: Feature-flagged check-in component

### Hooks

- **useEmotionalState**: Emotional journey tracking
- **useSofiaMessages**: Contextual AI messages
- **useHapticFeedback**: Emotional haptic patterns

## Theme Integration

Enhanced screens automatically use emotional colors when available:

```typescript
// Fallback to original colors if emotional sync is disabled
const backgroundColor = emotionalFeatures?.emotionalColors?.backgroundPrimary || '#1e293b';
```

## Performance Considerations

1. **Lazy Loading**: Components load only when feature flags are enabled
2. **Code Splitting**: Emotional features are in separate bundle
3. **Memory Management**: Animations use native drivers where possible
4. **Storage**: AsyncStorage used for persistence (React Native compatible)

## Testing

All components maintain existing test compatibility:

```bash
npm --workspace=@schwalbe/mobile run test
npm --workspace=@schwalbe/mobile run typecheck
```

## Rollout Strategy

### Phase 1: Infrastructure
- Deploy with all flags disabled
- Test feature flag system
- Verify no impact on existing functionality

### Phase 2: Gradual Rollout
1. Enable Sofia Firefly for beta users
2. Enable emotional messages
3. Enable achievements and celebrations
4. Enable daily check-ins and personal features

### Phase 3: Full Integration
- Replace original screens with enhanced versions
- Remove feature flags (if desired)
- Clean up temp components

## Monitoring

Key metrics to track:
- **Bundle size impact**: Should be minimal with lazy loading
- **Performance**: No degradation in existing functionality
- **User engagement**: Emotional features usage rates
- **Error rates**: Monitor for any integration issues

## Support

For development questions:
- Check feature flag configuration in `src/config/featureFlags.ts`
- Review component integration examples in `src/components/emotional/`
- Test with enhanced home screen in `src/components/enhanced/`