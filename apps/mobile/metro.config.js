const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add workspace support
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPath = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Ensure modules are resolved correctly
config.resolver.disableHierarchicalLookup = false;

// Fix MIME type issues for web
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Set correct MIME type for JavaScript bundles
      if (req.url?.includes('.bundle') || req.url?.includes('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      }
      return middleware(req, res, next);
    };
  },
};

// Add source map support for better debugging
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];

module.exports = config;
