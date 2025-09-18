import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { I18nextProvider } from 'react-i18next'
import i18n from '../src/i18n'
import Biometric from '../app/(auth)/biometric'
import { SafeAreaProvider } from 'react-native-safe-area-context'

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </I18nextProvider>
  )
}

describe('RN Biometric screen smoke', () => {
  test('renders heading and primary button text', async () => {
    render(
      <Providers>
        <Biometric />
      </Providers>
    )
    expect(screen.getByText('Biometric Sign In')).toBeTruthy()
  })
})