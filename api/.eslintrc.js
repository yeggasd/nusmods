module.exports = {
  env: {
    node: true,
  },
  settings: {
    'import/resolver': 'node',
  },
  overrides: [
    {
      files: '__mocks__/**',
      env: {
        jest: true,
      },
    },
  ],
};
