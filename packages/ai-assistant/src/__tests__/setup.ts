/**
 * Jest setup file for AI Assistant package
 * Global test configuration and utilities
 */

// Mock Date.now() for consistent testing
const mockDate = new Date('2025-09-22T10:00:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
Date.now = jest.fn(() => mockDate.getTime());

// Mock Math.random for predictable random selections
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn(() => 0.5);
global.Math = mockMath;

// Global test utilities
global.createMockUserContext = (overrides = {}) => ({
  documentsCount: 0,
  timeInApp: 60000,
  lastActivity: new Date(),
  completedTasks: [],
  ...overrides,
});

global.expectToContainSlovakText = (actual: string, expectedSubstring: string) => {
  expect(actual).toEqual(expect.stringContaining(expectedSubstring));
};

// Silence console logs during tests unless explicitly testing them
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Reset all mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});