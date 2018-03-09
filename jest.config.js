module.exports = {
  testPathIgnorePatterns: [
    '<rootDir>/dist',
    '/node_modules/'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/dist',
    '/node_modules/'
  ],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  }
};
