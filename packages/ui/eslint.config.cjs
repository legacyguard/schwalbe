const rootConfig = require('../../eslint.config.cjs');

module.exports = [
  ...rootConfig,
  {
    ignores: ['dist/', 'node_modules/', '*.config.js'],
  },
];
