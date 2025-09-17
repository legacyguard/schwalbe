const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [
  workspaceRoot,
  path.resolve(workspaceRoot, 'packages/ui'),
  path.resolve(workspaceRoot, 'packages/logic'),
  path.resolve(workspaceRoot, 'packages/shared'),
];

// Ensure Metro includes monorepo packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Add support for TypeScript files
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// Fix for @legacyguard packages - make them resolvable
config.resolver.extraNodeModules = new Proxy(
  {
    '@legacyguard/ui': path.resolve(workspaceRoot, 'packages/ui'),
    '@legacyguard/logic': path.resolve(workspaceRoot, 'packages/logic'),
    '@hollywood/shared': path.resolve(workspaceRoot, 'packages/shared'),
  },
  {
    get: (target, name) => {
      if (target[name]) {
        return target[name];
      }
      return path.join(projectRoot, 'node_modules', name);
    },
  }
);

// Resolve from package root, not src folder
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.startsWith('@legacyguard/') ||
    moduleName.startsWith('@hollywood/')
  ) {
    const packageName = moduleName.split('/').slice(0, 2).join('/');
    const packagePath = config.resolver.extraNodeModules[packageName];
    if (packagePath) {
      const subPath = moduleName.slice(packageName.length + 1);
      if (subPath) {
        // Handle subpath imports like @legacyguard/ui/components
        return {
          filePath: path.join(packagePath, 'src', subPath),
          type: 'sourceFile',
        };
      }
      // For main package import, look for package.json main field
      const packageJsonPath = path.join(packagePath, 'package.json');
      const packageJson = require(packageJsonPath);
      const mainFile = packageJson.main || 'index.js';
      return {
        filePath: path.join(packagePath, mainFile),
        type: 'sourceFile',
      };
    }
  }
  // Default resolution for other modules
  return context.resolveRequest(context, moduleName, platform);
};

// Add node_modules to blacklist to reduce file watching
config.resolver.blacklistRE = /node_modules\/.*\/node_modules/;

// Configure the transformer
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Use fewer workers to reduce file handle usage
config.maxWorkers = 2;

// Export the configuration
module.exports = config;
