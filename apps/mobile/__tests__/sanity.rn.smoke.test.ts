import React from 'react'
import { render, screen } from '@testing-library/react-native'
import * as RN from 'react-native'

const { View, Text } = RN as any

test('RN sanity renders basic View/Text', () => {
  // Debug what's exported from react-native
  // eslint-disable-next-line no-console
  console.log('react-native keys:', Object.keys(RN))
  // eslint-disable-next-line no-console
  console.log('typeof View:', typeof View, 'typeof Text:', typeof Text)

  render(
    React.createElement(View, null,
      React.createElement(Text, null, 'OK')
    )
  )
  expect(screen.getByText('OK')).toBeTruthy()
})
