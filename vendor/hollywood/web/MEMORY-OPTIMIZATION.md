# Memory Optimization Guide

This document provides comprehensive memory optimization for the LegacyGuard Web application to prevent "JavaScript heap out of memory" errors.

## 🚀 Quick Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run setup script**:
   ```bash
   ./scripts/memory-setup.sh setup
   ```

3. **Use memory-optimized commands**:
   ```bash
   # Development
   npm run dev                    # Memory-optimized dev server
   
   # Building
   npm run build                  # Standard memory-optimized build
   npm run build:memory-safe      # Maximum memory safety build
   
   # Linting
   npm run lint:memory-safe       # Memory-optimized linting
   
   # Type checking
   npm run type-check            # Memory-optimized TypeScript
   ```

## 📁 Files Added

- **`.env.memory`** - Node.js memory configuration settings
- **`.claudeignore`** - Excludes large files from Claude processing
- **`scripts/memory-setup.sh`** - Memory optimization utility script
- **`MEMORY-OPTIMIZATION.md`** - This documentation

## 🔧 Configuration Details

### Node.js Memory Settings

| Setting | Development | Build | Purpose |
|---------|-------------|-------|---------|
| `--max-old-space-size` | 8192MB | 12288MB | Maximum heap size |
| `--max_semi_space_size` | 128MB | 256MB | Young generation size |
| `--optimize-for-size` | ✅ | ✅ | Memory-focused optimizations |

### Package.json Scripts

All scripts now include memory optimization:

```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --max_semi_space_size=128' vite",
    "build": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --max_semi_space_size=128' vite build",
    "build:memory-safe": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --max_semi_space_size=256 --optimize-for-size' vite build",
    "lint:memory-safe": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --max_semi_space_size=128' eslint . --cache --cache-location .eslintcache"
  }
}
```

### TypeScript Optimization

Enhanced `tsconfig.json` with:
- **Incremental compilation**: Faster rebuilds with `.tsbuildinfo`
- **Excluded large files**: Prevents processing of build artifacts
- **Memory-efficient settings**: Optimized for large codebases

### Vite Build Optimization

Enhanced `vite.config.ts` with:
- **Limited parallel operations**: `maxParallelFileOps: 2`
- **Chunk optimization**: Smart code splitting by feature
- **Memory-conscious bundling**: Efficient rollup configuration

## 🎯 Usage Examples

### Running with Memory Optimization

```bash
# Method 1: Use npm scripts (recommended)
npm run dev                # Development with memory optimization
npm run build              # Build with memory optimization

# Method 2: Use setup script
./scripts/memory-setup.sh dev      # Development
./scripts/memory-setup.sh build    # Build
./scripts/memory-setup.sh lint     # Linting

# Method 3: Manual environment
source .env.memory && npm run dev
```

### For Claude CLI Users

The `.claudeignore` file prevents Claude from processing large files:

```bash
# Now safe to use
claude --add-dir src "analyze my React components"

# Instead of processing everything
claude "help with my codebase"  # ❌ May cause memory issues
```

### Memory Monitoring

Monitor Node.js memory usage:

```bash
# Option 1: Process monitoring
watch 'ps aux | grep node'

# Option 2: Memory setup script
./scripts/memory-setup.sh monitor

# Option 3: Enable GC tracing
export NODE_OPTIONS="$NODE_OPTIONS --trace-gc"
npm run build
```

## 🛠️ Troubleshooting

### Still Getting Memory Errors?

1. **Check system RAM**:
   ```bash
   ./scripts/memory-setup.sh check
   ```

2. **Clean large files**:
   ```bash
   ./scripts/memory-setup.sh clean
   ```

3. **Reduce memory limits** (for systems with <16GB RAM):
   Edit `.env.memory` and reduce values:
   ```bash
   NODE_OPTIONS_DEV="--max-old-space-size=4096 --max_semi_space_size=64"
   NODE_OPTIONS_BUILD="--max-old-space-size=6144 --max_semi_space_size=128"
   ```

4. **Use maximum safety build**:
   ```bash
   npm run build:memory-safe
   ```

### Large File Management

Large files are automatically moved to `/tmp/` during setup:
- `lint-results.json` → `/tmp/lint-results-{timestamp}.json`
- `hardcoded-strings-report.json` → `/tmp/hardcoded-strings-report-{timestamp}.json`

### CI/CD Considerations

For continuous integration:

```yaml
# GitHub Actions example
- name: Setup Node.js with memory optimization
  run: |
    export NODE_OPTIONS="--max-old-space-size=8192"
    npm run build:memory-safe
```

## 📊 Memory Allocation Guide

### System Requirements

| RAM | Recommended Settings |
|-----|---------------------|
| 8GB | `--max-old-space-size=3072` |
| 16GB | `--max-old-space-size=6144` |
| 32GB+ | `--max-old-space-size=8192` |

### Process-Specific Limits

| Process | Memory Limit | Purpose |
|---------|--------------|---------|
| Vite Dev Server | 8GB | Hot reload + bundling |
| Vite Build | 12GB | Full optimization |
| ESLint | 6GB | Large codebase analysis |
| TypeScript | 6GB | Type checking |
| Cypress | 6GB | E2E testing |

## 🔍 Advanced Configuration

### Custom Memory Limits

Create project-specific limits:

```bash
# .env.local
NODE_OPTIONS="--max-old-space-size=10240 --max_semi_space_size=192"
```

### V8 Flags for Debugging

```bash
# Enable garbage collection logs
export NODE_OPTIONS="$NODE_OPTIONS --trace-gc --trace-gc-verbose"

# Expose garbage collection to JavaScript
export NODE_OPTIONS="$NODE_OPTIONS --expose-gc"

# Heap profiling
export NODE_OPTIONS="$NODE_OPTIONS --prof --prof-process"
```

### Bundle Analysis

Run memory-safe bundle analysis:

```bash
npm run analyze
```

## ✅ Verification

Test that memory optimization is working:

1. **Check Node.js flags**:
   ```bash
   node --help | grep max-old-space-size
   ```

2. **Verify script execution**:
   ```bash
   npm run dev 2>&1 | grep max-old-space-size
   ```

3. **Monitor memory during build**:
   ```bash
   ./scripts/memory-setup.sh build & 
   watch 'ps aux | grep node'
   ```

## 🎉 Success Indicators

You'll know the optimization is working when:
- ✅ `claude` command runs without memory errors
- ✅ Build processes complete without crashing
- ✅ Development server starts reliably
- ✅ ESLint processes large codebases
- ✅ TypeScript compilation succeeds

## 📞 Support

If you continue experiencing memory issues:
1. Check system RAM with `./scripts/memory-setup.sh check`
2. Clean large files with `./scripts/memory-setup.sh clean`
3. Try the maximum safety build: `npm run build:memory-safe`
4. Consider upgrading system RAM for optimal performance

---

*This optimization setup is specifically designed for the LegacyGuard monorepo architecture and large React/TypeScript codebases.*
