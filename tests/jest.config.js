module.exports = {
  testEnvironment: 'jsdom',
  rootDir: '../',
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  collectCoverageFrom: [
    'app/frontend/script.js',
    '!node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: ['<rootDir>/tests/frontend/**/*.test.js']
};
