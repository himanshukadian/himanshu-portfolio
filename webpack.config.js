module.exports = {
  // ... existing config ...
  module: {
    rules: [
      // ... existing rules ...
      {
        test: /\.md$/,
        use: 'raw-loader',
      },
    ],
  },
}; 