#!/usr/bin/env node

/**
 * Dependency Synchronization Script
 * Ensures all packages use consistent dependency versions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Canonical versions that should be used across all packages
const CANONICAL_VERSIONS = {
  // Core dependencies
  'react': '18.3.1',
  'react-dom': '18.3.1',
  '@supabase/supabase-js': '^2.57.4',
  'zustand': '^5.0.8',
  'typescript': '^5.9.2',

  // i18n
  'i18next': '^25.5.0',
  'react-i18next': '^15.7.3',

  // Animation
  'framer-motion': '^11.15.0',

  // Testing
  'jest': '^29.7.0',
  'ts-jest': '^29.2.5',
  '@types/jest': '^29.5.12'
};

// Packages to synchronize
const PACKAGES = [
  'packages/shared',
  'packages/logic',
  'packages/ui',
  'apps/mobile',
  'apps/web'
];

function readPackageJson(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`⚠️  Package.json not found: ${packageJsonPath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function writePackageJson(packagePath, content) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, 2) + '\n');
}

function syncDependencies(packageJson, packageName) {
  let hasChanges = false;
  const original = JSON.stringify(packageJson);

  // Sync dependencies
  if (packageJson.dependencies) {
    Object.keys(CANONICAL_VERSIONS).forEach(dep => {
      if (packageJson.dependencies[dep]) {
        const currentVersion = packageJson.dependencies[dep];
        const canonicalVersion = CANONICAL_VERSIONS[dep];

        if (currentVersion !== canonicalVersion) {
          console.log(`📦 ${packageName}: ${dep} ${currentVersion} → ${canonicalVersion}`);
          packageJson.dependencies[dep] = canonicalVersion;
          hasChanges = true;
        }
      }
    });
  }

  // Sync devDependencies
  if (packageJson.devDependencies) {
    Object.keys(CANONICAL_VERSIONS).forEach(dep => {
      if (packageJson.devDependencies[dep]) {
        const currentVersion = packageJson.devDependencies[dep];
        const canonicalVersion = CANONICAL_VERSIONS[dep];

        if (currentVersion !== canonicalVersion) {
          console.log(`📦 ${packageName}: ${dep} ${currentVersion} → ${canonicalVersion} (dev)`);
          packageJson.devDependencies[dep] = canonicalVersion;
          hasChanges = true;
        }
      }
    });
  }

  // Sync peerDependencies (exact versions for React)
  if (packageJson.peerDependencies) {
    ['react', 'react-dom'].forEach(dep => {
      if (packageJson.peerDependencies[dep]) {
        const currentVersion = packageJson.peerDependencies[dep];
        const canonicalVersion = CANONICAL_VERSIONS[dep];

        if (currentVersion !== canonicalVersion) {
          console.log(`📦 ${packageName}: ${dep} ${currentVersion} → ${canonicalVersion} (peer)`);
          packageJson.peerDependencies[dep] = canonicalVersion;
          hasChanges = true;
        }
      }
    });
  }

  return hasChanges;
}

function main() {
  console.log('🔄 Starting dependency synchronization...\n');

  let totalChanges = 0;

  PACKAGES.forEach(packagePath => {
    const packageName = packagePath.split('/').pop();
    const packageJson = readPackageJson(packagePath);

    if (!packageJson) return;

    console.log(`🔍 Checking ${packageName}...`);
    const hasChanges = syncDependencies(packageJson, packageName);

    if (hasChanges) {
      writePackageJson(packagePath, packageJson);
      totalChanges++;
      console.log(`✅ Updated ${packageName}\n`);
    } else {
      console.log(`✅ ${packageName} already synchronized\n`);
    }
  });

  console.log(`🎉 Synchronization complete! Updated ${totalChanges} packages.`);

  if (totalChanges > 0) {
    console.log('\n📋 Next steps:');
    console.log('  1. Run: npm install');
    console.log('  2. Run: npm run build');
    console.log('  3. Run: npm run test');
    console.log('  4. Commit changes');
  }
}

// Export for testing
export { CANONICAL_VERSIONS, syncDependencies };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}