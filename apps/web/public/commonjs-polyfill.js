// CommonJS polyfill for browser environment
if (typeof exports === 'undefined') {
  window.exports = {};
}
if (typeof module === 'undefined') {
  window.module = { exports: {} };
}
if (typeof global === 'undefined') {
  window.global = window;
}
if (typeof process === 'undefined') {
  window.process = { env: {} };
}
if (typeof require === 'undefined') {
  // Basic require polyfill for browser
  window.__modules = window.__modules || {};
  window.require = function(module) {
    if (window.__modules[module]) {
      return window.__modules[module];
    }
    // Return empty object for unknown modules to prevent crashes
    console.warn('Module not found:', module, '- returning empty object');
    return {};
  };
}