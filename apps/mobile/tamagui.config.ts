import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'
import { tamaguiEmotionalTokens } from './src/temp-emotional-sync/theme/colors'

const tamaguiConfig = createTamagui({
  ...config,
  themeClassNameOnRoot: false,
  
  // Add emotional tokens to the main config
  tokens: {
    ...config.tokens,
    color: {
      ...config.tokens.color,
      ...tamaguiEmotionalTokens,
    },
  },

  // Add emotional themes
  themes: {
    ...config.themes,
    
    // Emotional dark theme (primary)
    emotionalDark: {
      ...config.themes.dark,
      background: '$backgroundEmotionalPrimary',
      backgroundHover: '$backgroundEmotionalSecondary',
      backgroundPress: '$backgroundEmotionalTertiary',
      color: '$textEmotionalPrimary',
      colorHover: '$textEmotionalSecondary',
      placeholderColor: '$textEmotionalMuted',
    },

    // Sofia firefly theme for special elements
    fireflyTheme: {
      ...config.themes.dark,
      background: '$accentFirefly',
      backgroundHover: '$accentFireflyLight',
      backgroundPress: '$accentFireflyDark',
      color: '$backgroundEmotionalPrimary',
    },
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}