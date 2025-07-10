module.exports = {
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': '@swc/jest',
  },
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/**/*.test.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': '@swc/jest',
      },
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/**/*.test.tsx'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': '@swc/jest',
      },
    },
  ],
}; 