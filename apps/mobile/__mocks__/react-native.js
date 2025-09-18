const ReactNative = {
  StyleSheet: {
    create: (styles) => styles,
  },
  Platform: { OS: 'ios', select: (o) => (o.ios ?? o.default) },
  // Minimal components to satisfy React Native imports if needed
  View: 'View',
  Text: 'Text',
};
module.exports = ReactNative;