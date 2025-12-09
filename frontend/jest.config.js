const { pathsToModuleNameMapper } = require('ts-jest');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'jest-preset-angular',
  roots: ['src'],
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  coverageDirectory: 'reports',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 100,
      statements: 0,
    },
  },
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.*.mock.ts', '<rootDir>/.*mock-.*.ts', '<rootDir>/src/test'],
  coverageReporters: ['json', 'lcov', 'text', 'html'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  moduleDirectories: ['node_modules', '<rootDir>'],
};
