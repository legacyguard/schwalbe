# Temp Emotional Sync Components

**Purpose:** Separate space for developing new emotional components before integration
**Feature Flag:** `EXPO_PUBLIC_EMOTIONAL_SYNC_ENABLED`

## Structure

```
temp-emotional-sync/
├── theme/              # New colors, typography, Tamagui config
├── components/         # New React components
│   ├── sofia-firefly/  # Touch-based Sofia firefly
│   ├── animations/     # Emotional animations
│   ├── messaging/      # Emotional messaging system
│   ├── onboarding/     # Redesigned onboarding
│   ├── achievements/   # Achievement celebrations
│   └── haptics/        # Haptic feedback system
├── hooks/              # Custom hooks for emotional features
└── utils/              # Utility functions
```

## Principles

- Maintain backward compatibility
- Use feature flags
- Don't touch packages/ unless necessary
- Follow mobile-first approach