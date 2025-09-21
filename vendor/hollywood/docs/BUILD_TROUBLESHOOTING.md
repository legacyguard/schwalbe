# Build Troubleshooting Guide

## Common Build Issues and Solutions

### 1. React Helmet Async - Peer Dependency Conflict

**Problem**: `react-helmet-async` doesn't support React 19, causing CI/CD pipeline failures.

**Solution**: We've replaced `react-helmet-async` with a native React solution using `useEffect` and DOM APIs.

The new `MetaTags` component in `src/components/common/MetaTags.tsx` handles all SEO meta tags without external dependencies.

### 2. "Too Many Open Files" Error on macOS

**Problem**: Build fails with `EMFILE: too many open files` error, especially when building the mobile app.

**Solutions**:

#### Quick Fix (Current Session)

```bash
# Increase file limit for current terminal session
ulimit -n 10240

# Then run build
npm run build
```

#### Using the Helper Script

```bash
# Run the script to set proper limits
./scripts/increase-file-limits.sh

# Then build
npm run build
```

#### Permanent Fix (macOS)

1. Create or edit `~/.zshrc` (or `~/.bash_profile` for bash):

```bash
echo "ulimit -n 10240" >> ~/.zshrc
source ~/.zshrc
```

1. For system-wide changes, you may need to modify system limits. See Apple's documentation for details.

### 3. Mobile Build Issues

**Problem**: Mobile app can't resolve `@legacyguard/ui` package.

**Temporary Workaround**:

- Build packages first: `cd packages/ui && npm run build`
- Ensure all workspace dependencies are properly linked: `npm install`

**Metro Configuration**:

We've added `metro.config.js` to optimize file handling:

- Set maxWorkers to 2 (top-level Metro option to limit concurrent processing)
- Disabled hierarchical lookup
- Limited watched folders

### 4. CI/CD Pipeline Fixes

For GitHub Actions, the pipeline should now work correctly after removing `react-helmet-async`.

If you still encounter issues:

1. Ensure all dependencies are compatible with React 19
1. Clear caches in CI/CD:

```yaml
- name: Clear caches
  run: |
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install
```

1. Use `npm ci` instead of `npm install` in CI/CD for reproducible builds

## Build Commands

### Development

```bash
# Web development
npm run web:dev

# Mobile development
npm run mobile:dev
```

### Production Build

```bash
# Build all packages
npm run build

# Build web only
cd hollywood && npm run build

# Build mobile only
cd mobile && npm run build
```

### Clean Build

```bash
# Remove all node_modules and reinstall
rm -rf node_modules package-lock.json mobile/node_modules
npm install

# Clear all caches
rm -rf .turbo
rm -rf mobile/.expo
rm -rf /tmp/metro-*
```

## Environment Requirements

- Node.js: >= 18.0.0
- npm: >= 9.0.0
- macOS file limit: >= 10240 (for mobile builds)

## Additional Resources

- [Expo Build Troubleshooting](https://docs.expo.dev/troubleshooting/build-errors/)
- [React 19 Migration Guide](https://react.dev/blog/2024/04/25/react-19)
- [Turbo Build Cache](https://turbo.build/repo/docs/core-concepts/caching)
