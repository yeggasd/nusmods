module.exports = {
  rootDir: './',
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['.eslintrc.js'],
  collectCoverageFrom: ['**/*.{js,jsx}', '!**/node_modules/**'],
  // Node environment
  testEnvironment: 'node',
  coverageDirectory: '<rootDir>/../coverage',
  // Only write lcov files in CIs
  coverageReporters: ['text'].concat(process.env.CI ? 'lcov' : []),
};
