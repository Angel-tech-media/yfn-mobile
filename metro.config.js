const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const originalGetPolyfills = config.serializer.getPolyfills;
config.serializer.getPolyfills = function (options) {
  const polyfills = originalGetPolyfills ? originalGetPolyfills(options) : [];
  return [
    path.resolve(__dirname, 'src/polyfills/dom-exception.js'),
    ...polyfills,
  ];
};

module.exports = config;
