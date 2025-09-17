const rootConfig = require('../eslint.config.cjs');

module.exports = [
  ...rootConfig,
  {
    ignores: [
      '*.config.js',
      'metro.config.js',
      'babel.config.js',
      'app.config.js',
      '.expo/',
      'node_modules/',
    ],
  },
];
