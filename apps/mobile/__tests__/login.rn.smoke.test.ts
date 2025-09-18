import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { I18nextProvider } from 'react-i18next'
import i18n from '../src/i18n'
import Login from '../app/(auth)/login'
import { SafeAreaProvider } from 'react-native-safe-area-context'

function Providers({ children }: { children: React.ReactNode }) {
  return React.createElement(I18nextProvider as any, { i18n },
    React.createElement(SafeAreaProvider as any, null, children as any)
  )
}

describe.skip('RN Login screen smoke', () => {
  test('renders Email and Sign In and allows button press', async () => {
    render(
      React.createElement(Providers, null,
        React.createElement(Login)
      )
    )

    expect(screen.getByText('Email')).toBeTruthy()
    const submit = screen.getByText('Sign In')
    fireEvent.press(submit)
    expect(submit).toBeTruthy()
  })
})
