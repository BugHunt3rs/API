/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  transform: { "^.+\.ts$": "@swc/jest" },
  clearMocks: true,
};
