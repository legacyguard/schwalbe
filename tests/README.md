# 🎭 LegacyGuard E2E Testing Suite

## Guardian of Memories - Automated Testing Journey

This test suite provides comprehensive End-to-End testing for the LegacyGuard application, following the "Guardian of Memories" user journey from registration through complete onboarding to active usage.

## 🚀 Quick Start

### Prerequisites

- Node.js and npm installed
- Application running on `http://localhost:8080`
- Clerk authentication configured in test mode

### Installation

```bash
# Install dependencies (if not already installed)
npm install

# Install Playwright browsers
npx playwright install chromium
```

## 📋 Available Test Commands

### Basic E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Debug tests step-by-step
npm run test:e2e:debug
```

### Full Journey Tests ("Generálna Skúška")

```bash
# Run complete user journey test
npm run test:journey

# Run journey with UI mode for visual debugging
npm run test:journey:ui

# Debug journey tests step-by-step
npm run test:journey:debug

# View HTML report after journey tests
npm run test:journey:report
```

### Specific Test Files

```bash
# Run onboarding tests only
npx playwright test tests/onboarding.spec.ts

# Run user journey tests only
npx playwright test tests/user-journey.spec.ts

# Run full guardian journey
npx playwright test tests/full-user-journey.spec.ts
```

## 🎬 Test Scenarios

### 1. **Full User Journey** (`full-user-journey.spec.ts`)

Complete "Guardian of Memories" experience testing:

#### Act 1: Invitation to the Journey

- **Scene 1**: Registration - New user sign-up
- **Scene 2**: Promise of Calm - Onboarding introduction with firefly animation
- **Scene 3**: Box of Certainty - Emotional prompt about important items
- **Scene 4**: Key of Trust - Naming the trusted person
- **Scene 5**: Preparing the Path - Loading animation and dashboard redirect

#### Act 2: Building the Legacy

- **Scene 1**: First Dashboard Interaction - 5-minute challenge
- **Scene 2**: Document Upload - Laying the first mosaic stone
- **Scene 3**: Path of Peace - Milestone unlocked
- **Scene 4**: Adding a Guardian - Creating the Circle of Trust

#### Act 3: Completion

- Sign out and journey verification

### 2. **Basic Onboarding Tests** (`onboarding.spec.ts`)

- Clerk authentication form detection
- Sign-up flow validation
- Basic navigation checks

### 3. **User Journey Tests** (`user-journey.spec.ts`)

- Document management flow
- People management (Trusted Circle)
- Assets management
- Will generation wizard
- Scenario planner
- MicroTask engine

## 📸 Test Artifacts

### Screenshots

Automatically captured at key points and stored in:

```text
tests/screenshots/
├── journey-01-registration.png
├── journey-02-promise-of-calm.png
├── journey-03-box-of-certainty.png
├── journey-04-key-of-trust.png
├── journey-05-firefly-trail.png
├── journey-06-dashboard-challenge.png
├── journey-07-document-analysis.png
├── journey-08-first-mosaic-stone.png
├── journey-09-milestone-unlocked.png
├── journey-10-add-guardian-form.png
├── journey-11-guardian-added.png
└── journey-12-signed-out.png
```

### Videos

Full test recordings stored in:

```text
tests/videos/
└── [test-name]-[timestamp].webm
```

### Test Reports

HTML reports available at:

```text
playwright-report/
└── journey/
    └── index.html
```

## 🔧 Configuration

### Main Configuration (`playwright.config.ts`)

- Base URL: `http://localhost:8080`
- Browser: Chromium
- Automatic dev server startup
- Video recording on failure
- Screenshot on failure

### Journey Configuration (`playwright.journey.config.ts`)

- Extended timeouts (3 minutes per test)
- Full video recording
- Comprehensive trace collection
- Serial execution mode
- Multiple reporter formats (HTML, JSON, JUnit)

## 🏷️ Test Data Attributes

For robust test selectors, add these `data-testid` attributes to your React components:

### Authentication

- `data-testid="email-input"`
- `data-testid="password-input"`
- `data-testid="submit-registration"`

### Onboarding

- `data-testid="onboarding-container"`
- `data-testid="start-onboarding"`
- `data-testid="box-of-certainty"`
- `data-testid="key-of-trust"`
- `data-testid="preparing-path"`

### Dashboard

- `data-testid="dashboard"`
- `data-testid="micro-task"`
- `data-testid="start-challenge"`
- `data-testid="milestone-foundation"`

### Documents

- `data-testid="upload-document"`
- `data-testid="file-input"`
- `data-testid="analysis-status"`
- `data-testid="document-category"`
- `data-testid="save-document"`
- `data-testid="document-list"`

### Guardians

- `data-testid="guardians-nav"`
- `data-testid="add-guardian"`
- `data-testid="guardian-name"`
- `data-testid="guardian-email"`
- `data-testid="guardians-list"`

## 🔐 Handling Clerk Authentication

### Test Mode Setup

1. Configure Clerk in test/development mode
2. Use test API keys in `.env.test`
3. Consider using Clerk's test tokens for CI/CD

### Mock Authentication (Optional)

For faster tests without real authentication:

```javascript
// In your test setup
await mockClerkAuth(page, testUser);
```

## 🐛 Debugging Tips

### Visual Debugging

Use UI mode to see tests execute in real-time:

```bash
npm run test:journey:ui
```

### Step-by-Step Debugging

Use debug mode to pause at each step:

```bash
npm run test:journey:debug
```

### Trace Viewer

View detailed execution traces:

```bash
npx playwright show-trace trace.zip
```

### Console Logs

Tests include console logs at key checkpoints:

- ✅ Successful step completion
- 🚀 Journey start
- 🎉 Journey completion

## 📊 Performance Metrics

The test suite includes performance checks:

- Page load time (< 3 seconds)
- Action completion times
- Navigation timing

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run test:journey
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/
            tests/screenshots/
            tests/videos/
```

## 🚨 Common Issues & Solutions

### Issue: Clerk authentication fails

**Solution**: Ensure Clerk is configured in test mode with proper test credentials

### Issue: Timeouts during onboarding

**Solution**: Increase timeout in `playwright.journey.config.ts` or check network conditions

### Issue: Elements not found

**Solution**: Add appropriate `data-testid` attributes to components

### Issue: Dev server not starting

**Solution**: Ensure port 8080 is free or update `baseURL` in config

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Clerk Testing Guide](https://clerk.com/docs/testing/overview)
- [LegacyGuard WARP.md](../WARP.md) - Development guidelines

## 🎯 Test Coverage Goals

- ✅ User Registration Flow
- ✅ Emotional Onboarding Journey
- ✅ Document Upload & Analysis
- ✅ Guardian Management
- ✅ Dashboard Interactions
- ✅ Milestone Tracking
- ⬜ Will Generation Wizard (in progress)
- ⬜ Scenario Planner (in progress)
- ⬜ MicroTask Engine (in progress)

## 💡 Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Keep tests independent** - each test should be able to run in isolation
3. **Use descriptive test names** that explain what is being tested
4. **Capture screenshots** at critical points for debugging
5. **Mock external services** when possible for faster, more reliable tests
6. **Clean up test data** after tests complete
7. **Monitor test execution time** and optimize slow tests

## 🤝 Contributing

When adding new features, please include corresponding E2E tests:

1. Add test scenarios to appropriate spec files
2. Update this README with new test descriptions
3. Add necessary data-testid attributes
4. Ensure tests pass locally before committing

---

## Happy Testing! 🎭

> "Every test is a guardian of quality, ensuring peace of mind for both developers and users."
