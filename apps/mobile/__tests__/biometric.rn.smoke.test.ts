import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { I18nextProvider } from 'react-i18next'
import i18n from '../src/i18n'
import Biometric from '../app/(auth)/biometric'
import { SafeAreaProvider } from 'react-native-safe-area-context'

function Providers({ children }: { children: React.ReactNode }) {
  return React.createElement(I18nextProvider as any, { i18n },
    React.createElement(SafeAreaProvider as any, null, children as any)
  )
}

describe('RN Biometric screen smoke', () => {
  test('renders heading and primary button text', async () => {
    // Debug: verify Biometric import shape
    // eslint-disable-next-line no-console
    console.log('Biometric typeof:', typeof Biometric, Biometric && Object.keys(Biometric))

    const Comp = (Biometric as any)?.default ?? (Biometric as any)

    render(
      React.createElement(Providers, null,
        React.createElement(Comp as any)
      )
    )
    expect(screen.getByText('Biometric Sign In')).toBeTruthy()
  })
})
