const React = require('react')
const { View, Text } = require('react-native')

const asComponent = (Comp) => function TamaguiMock(props) {
  const { children, ...rest } = props || {}
  return React.createElement(Comp, rest, children)
}

module.exports = {
  // Basic layout primitives map to View
  YStack: asComponent(View),
  XStack: asComponent(View),
  // Textual elements map to Text
  H1: asComponent(Text),
  Text: asComponent(Text),
  // Interactive elements also map to View for smoke purposes
  Button: asComponent(View),
  Input: asComponent(View),
  Spinner: asComponent(View),
}
