# Minimal Smoke Tests

## Purpose

The minimal smoke tests (`minimal-smoke-test.spec.ts`) provide a lightweight way to verify that the application is running and core functionality is accessible, even when there are legacy code issues present.

These tests are designed to:
- ✅ Work despite TypeScript errors and legacy code issues
- ✅ Run without requiring authentication setup
- ✅ Provide quick feedback on application health
- ✅ Be tolerant of minor issues while catching critical failures

## What They Test

### Basic Application Health
- Application loads without crashing
- No critical error messages displayed
- Console errors are within acceptable limits (allows up to 2 for legacy code)

### Essential UI Elements
- Header/navigation exists
- Main content area renders
- Interactive elements are present
- Page title is set

### Authentication UI
- Sign-in/Sign-up options are accessible
- Clerk authentication components load
- Authentication forms are reachable

### Navigation
- Key routes are accessible
- No server errors (500+) on main routes
- Static pages (Privacy, Terms) load

### Responsive Design
- Application works on desktop viewport
- Application works on mobile viewport

### Assets & Resources
- CSS styles are loaded
- JavaScript/React is running
- Critical resources load (tolerates up to 5 failed requests)

## Running the Tests

### Quick Start

```bash
# Run smoke tests in headless mode
npm run test:smoke

# Run smoke tests with browser visible
npm run test:smoke:headed
```

### Development Setup

1. Ensure your dev server is running or let Playwright start it:
   ```bash
   npm run dev  # Optional - tests will auto-start if not running
   ```

2. Run the smoke tests:
   ```bash
   npm run test:smoke
   ```

3. View the HTML report (if tests fail):
   ```bash
   npx playwright show-report
   ```

## Configuration

The smoke tests use a minimal configuration (`playwright.smoke.config.ts`) that:
- Doesn't require Clerk authentication setup
- Runs tests serially for consistency
- Uses only Chromium browser for speed
- Has relaxed timeouts for legacy code
- Auto-starts the dev server if needed

## Expected Behavior

### ✅ Tests Should Pass When:
- Application loads and renders basic content
- Navigation between pages works
- Authentication UI is present (even if not functional)
- Most resources load successfully

### ⚠️ Tests May Have Warnings For:
- 1-2 console errors (legacy code)
- Some 404s for missing resources
- Slower load times
- Missing optional UI elements

### ❌ Tests Will Fail If:
- Application crashes on load
- Server returns 500+ errors
- Critical UI is completely missing
- JavaScript fails to execute
- More than expected errors occur

## Troubleshooting

### Tests fail immediately
- Check if port 8080 is available
- Ensure dependencies are installed: `npm install`
- Check for .env.local file with necessary variables

### "Application error" or blank page
- Check console for build errors: `npm run build`
- Verify dev server starts: `npm run dev`
- Check for critical TypeScript errors

### Authentication errors
- These tests don't require authentication
- Ignore Clerk-related warnings in console
- Tests should still pass if auth UI is visible

### Timeout errors
- Increase timeout in test file: `test.setTimeout(60000)`
- Check if dev server is responding slowly
- Try running with `--headed` to see what's happening

## Integration with CI/CD

These smoke tests are ideal for:
- Pull request checks
- Post-deployment verification
- Quick health checks
- Regression detection

Example GitHub Actions workflow:

```yaml
- name: Run Smoke Tests
  run: npm run test:smoke
  env:
    CI: true
```

## Maintenance

Keep these tests minimal and focused on critical functionality. They should:
- Remain fast (< 2 minutes total)
- Be resilient to minor changes
- Focus on user-facing functionality
- Not test implementation details

When adding new tests, ask:
1. Is this critical for basic functionality?
2. Will this break often with minor changes?
3. Can this work without complex setup?

If any answer is "no", consider adding to full E2E tests instead.
