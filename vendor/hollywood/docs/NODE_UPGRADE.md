# Node.js Upgrade Instructions

## Current Requirement

The project requires **Node.js 20.18.0 or higher** for full compatibility with all dependencies, especially Vite and other build tools.

## Check Your Current Version

```bash
node --version
```

## Upgrade Options

### Option 1: Using NVM (Recommended)

If you have NVM installed:

```bash
# Install Node.js 20 LTS
nvm install 20.18.0

# Use it for this project
nvm use 20.18.0

# Set as default (optional)
nvm alias default 20.18.0
```

### Option 2: Using Homebrew (macOS)

```bash
# Update Homebrew
brew update

# Install Node.js 20
brew install node@20

# Link the version
brew link node@20
```

### Option 3: Direct Download

Download the installer from: <https://nodejs.org/>

- Choose the LTS version (20.x)
- Run the installer

## Verify Installation

After upgrading, verify:

```bash
# Check Node version
node --version
# Should show: v20.18.0 or higher

# Check npm version
npm --version
# Should show: 10.x or higher
```

## Project Setup After Upgrade

```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Test build
npm run build:packages
npm run build:web
```

## Using .nvmrc (Automatic Version Switching)

The project includes a `.nvmrc` file. If you use NVM:

```bash
# Automatically switch to correct version
nvm use

# Or install if not present
nvm install
```

## CI/CD Compatibility

The GitHub Actions workflow is configured to use Node.js 18 for compatibility, but locally you should use Node.js 20 for best development experience.

## Troubleshooting

### If you get version warnings

Some packages may show warnings about Node.js version. These can usually be ignored if the build succeeds.

### If builds fail with Node.js 18

Upgrade to Node.js 20 using the instructions above.

### If you need to switch between versions

Use NVM to easily switch:

```bash
# Switch to Node 20 for this project
nvm use 20

# Switch back to another version for other projects
nvm use 18
```
