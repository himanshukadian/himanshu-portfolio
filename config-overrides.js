const path = require('path');

module.exports = function override(config, env) {
  // AI Libraries Configuration
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

  // Handle WASM files for transformers.js
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'asset/resource',
  });

  // Handle .bin files for models
  config.module.rules.push({
    test: /\.bin$/,
    type: 'asset/resource',
  });

  // Configure headers for SharedArrayBuffer (needed for WebLLM)
  if (env === 'development') {
    config.devServer = {
      ...config.devServer,
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    };
  }

  // Optimize chunks for AI libraries
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        ...(config.optimization.splitChunks?.cacheGroups || {}),
        ai: {
          test: /[\\/]node_modules[\\/](@xenova|@mlc-ai)[\\/]/,
          name: 'ai-libs',
          chunks: 'all',
          priority: 20,
        },
      },
    },
  };

  // Configure experiments for WASM and async WebAssembly
  config.experiments = {
    ...config.experiments,
    asyncWebAssembly: true,
    syncWebAssembly: true,
    topLevelAwait: true,
  };

  return config;
}; 