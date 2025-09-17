# Mobile App Testing Guide

## Overview

This guide covers the visual regression testing setup for the LegacyGuard mobile app using Maestro.

## Prerequisites

### 1. Install Maestro

```bash
# Install Maestro CLI
curl -Ls https://get.maestro.mobile.dev | bash

# Verify installation
maestro --version
```

### 2. Setup Simulators/Emulators

#### iOS (macOS only)
```bash
# Install Xcode from App Store
# Open Xcode and install iOS Simulator

# List available simulators
xcrun simctl list devices

# Boot iPhone 15 simulator
xcrun simctl boot "iPhone 15"
```

#### Android
```bash
# Install Android Studio
# Setup Android Virtual Device (AVD)

# Start emulator
emulator -avd Pixel_7_API_34
```

## Running Tests

### Run All Tests
```bash
npm run test:maestro
```

### Run Individual Test Suites

```bash
# Authentication flow
npm run test:maestro:auth

# Navigation flow
npm run test:maestro:navigation

# Dark mode testing
npm run test:maestro:dark

# Tablet/responsive layouts
npm run test:maestro:tablet
```

### Run Tests with Specific Device

```bash
# iOS
maestro test --device "iPhone 15" .maestro/flows/01-auth-flow.yaml

# Android
maestro test --device "Pixel 7" .maestro/flows/01-auth-flow.yaml
```

## Test Structure

```
.maestro/
├── config.yaml           # Global configuration
└── flows/
    ├── 01-auth-flow.yaml      # Authentication tests
    ├── 02-navigation-flow.yaml # Navigation tests
    ├── 03-dark-mode-flow.yaml # Dark mode tests
    └── 04-tablet-flow.yaml    # Responsive layout tests
```

## Common Issues and Solutions

### Issue: "Element not found"

**Solution**: Add testID props to components
```tsx
<Input testID="email-input" />
<Button testID="submit-button" />
```

### Issue: "Test times out"

**Solution**: Add wait commands
```yaml
- waitForAnimationToEnd
- wait:
    timeout: 5000
```

### Issue: "Cannot tap on element"

**Solution**: Use different selectors
```yaml
# By text
- tapOn:
    text: "Sign In"

# By testID
- tapOn:
    id: "signin-button"

# By index (last resort)
- tapOn:
    index: 0
```

## Writing New Tests

### Basic Test Structure

```yaml
appId: com.legacyguard.mobile
---
# Test Name
- launchApp:
    clearState: true

# Your test steps here
- assertVisible:
    text: "Expected Text"
    
- tapOn:
    id: "element-id"
    
- inputText: "test input"

- takeScreenshot: "screenshot-name"
```

### Best Practices

1. **Always add testIDs** to interactive elements
2. **Use semantic selectors** (text, testID) over index
3. **Add screenshots** at key points for visual regression
4. **Wait for animations** to complete before assertions
5. **Clear app state** at the beginning of each test
6. **Group related tests** in the same flow file

## Test Coverage

### Current Coverage

- ✅ Authentication (sign in/out)
- ✅ Main navigation (all tabs)
- ✅ Document management
- ✅ People management
- ✅ Will generator
- ✅ Dark mode switching
- ✅ Responsive layouts (tablet)

### Planned Coverage

- [ ] Offline mode
- [ ] Push notifications
- [ ] Camera/document scanning
- [ ] Biometric authentication
- [ ] Error states
- [ ] Network failures

## Continuous Integration

### GitHub Actions Setup

```yaml
# .github/workflows/mobile-tests.yml
name: Mobile Tests

on:
  pull_request:
    paths:
      - 'mobile/**'

jobs:
  maestro-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Install Maestro
        run: curl -Ls https://get.maestro.mobile.dev | bash
        
      - name: Start iOS Simulator
        run: |
          xcrun simctl boot "iPhone 15"
          xcrun simctl wait "iPhone 15" booted
          
      - name: Build app
        run: npm run build:ios
        
      - name: Run tests
        run: npm run test:maestro
        
      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: test-results/screenshots/
```

## Debugging

### Enable Debug Mode

```bash
maestro test --debug .maestro/flows/01-auth-flow.yaml
```

### View Hierarchy

```bash
maestro studio
```

### Record New Tests

```bash
maestro record
```

## Reports

Test results are generated in:
- `test-results/screenshots/` - Visual regression screenshots
- `test-results/videos/` - Test execution videos
- `test-results/reports/` - JUnit XML and HTML reports

View HTML report:
```bash
open test-results/reports/index.html
```

## Contributing

When adding new features:
1. Add appropriate testIDs to new components
2. Write corresponding Maestro tests
3. Update this README with new test coverage
4. Ensure tests pass locally before pushing

## Resources

- [Maestro Documentation](https://maestro.mobile.dev)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [Tamagui Testing Guide](https://tamagui.dev/docs/guides/testing)
