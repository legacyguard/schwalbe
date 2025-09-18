# Temp Emotional Sync Components

**Účel:** Oddelený priestor pre vývoj nových emotívnych komponentov pred integráciou
**Feature Flag:** `EXPO_PUBLIC_EMOTIONAL_SYNC_ENABLED`

## Štruktúra

```
temp-emotional-sync/
├── theme/              # Nové farby, typografia, Tamagui config
├── components/         # Nové React komponenty
│   ├── sofia-firefly/  # Touch-based Sofia firefly
│   ├── animations/     # Emotívne animácie
│   ├── messaging/      # Emotívny messaging systém
│   ├── onboarding/     # Prepracovaný onboarding
│   ├── achievements/   # Achievement celebrations
│   └── haptics/        # Haptic feedback systém
├── hooks/              # Custom hooks pre emotívne features
└── utils/              # Utility funkcie
```

## Zásady

- Zachovať spätnú kompatibilitu
- Používať feature flagy
- Nezasahovať do packages/ bez nutnosti
- Dodržať mobile-first approach