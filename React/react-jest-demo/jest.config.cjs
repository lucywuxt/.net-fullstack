module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },

  testMatch: ["**/src/tests/**/*.test.tsx"],

  collectCoverageFrom: [
    "src/components/**/*.{ts,tsx}",
    "src/App.tsx",
    "!**/*.d.ts",
  ],

  coverageDirectory: "coverage",

  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.jest.json",
    },
  },
};
