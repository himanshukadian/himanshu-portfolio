const path = require('path');

module.exports = function override(config, env) {
  // Basic polyfills for Node.js modules in browser
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": require.resolve("path-browserify"),
    "fs": false,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
    "process": require.resolve("process/browser.js"),
    "url": require.resolve("url"),
    "util": require.resolve("util")
  };

  // Add polyfills for Node.js modules
  config.plugins = [
    ...config.plugins,
    new (require('webpack').ProvidePlugin)({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  return config;
}; 