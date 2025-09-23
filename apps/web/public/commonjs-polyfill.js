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