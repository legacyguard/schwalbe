// Minimal browser-like globals for libraries that expect window/localStorage
if (typeof global.window === 'undefined') {
  global.window = {};
}
if (typeof global.localStorage === 'undefined') {
  const mem = new Map();
  global.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, v),
    removeItem: (k) => mem.delete(k),
    clear: () => mem.clear(),
  };
}

// Initialize i18n for tests (default to English)
require('./src/i18n');

// Additional RN testing setup
// Mock timers for animation-heavy components if needed
jest.useFakeTimers();
