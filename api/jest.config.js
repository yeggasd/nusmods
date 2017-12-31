module.exports = {
  rootDir: './',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  // Node environment
  testEnvironment: 'node',
  collectCoverageFrom: ['*/**/*.{js,jsx}', '!**/node_modules/**'],
  coverageDirectory: '<rootDir>/../coverage',
  // Only write lcov files in CIs
  coverageReporters: ['text'].concat(process.env.CI ? 'lcov' : []),
};
