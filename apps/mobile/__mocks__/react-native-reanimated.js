/* Jest mock for react-native-reanimated v3+ based on official testing guide */
module.exports = {
  __esModule: true,
  default: {
    ...require('react-native-reanimated/mock'),
    // disable LayoutAnimation warnings
    setNativeProps: () => {},
  },
  // Easing mock
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    poly: jest.fn(),
    sin: jest.fn(),
    circle: jest.fn(),
    exp: jest.fn(),
    elastic: jest.fn(),
    back: jest.fn(),
    bounce: jest.fn(),
    bezier: jest.fn(),
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  },
};