module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        diagnostics: true,
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  testRegex: '\\.test\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
  },
  setupFiles: ['dotenv/config'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
};
