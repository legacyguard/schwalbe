const path = require('path')

// Explicitly resolve the React 18 renderer inside this workspace
module.exports = require(path.resolve(__dirname, '../node_modules/react-test-renderer'))
