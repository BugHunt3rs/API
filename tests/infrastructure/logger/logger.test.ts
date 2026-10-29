import fileSystem from "node:fs";
import type { Request } from "express";
import logger from "@/infrastructure/logger/logger";

jest.mock("node:fs", () => ({
  __esModule: true,
  default: {
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    appendFileSync: jest.fn(),
  },
}));

const request = { method: "PATCH", originalUrl: "/v1/chemical/1" } as Request;

function writtenLogLine() {
  return jest.mocked(fileSystem.appendFileSync).mock.calls[0]?.[1] as string;
}

describe("logger", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it.each([
    ["create", "CREATE", () => logger.create(request, { id: 1 })],
    ["update", "UPDATE", () => logger.update(request, { id: 1 }, { id: 1 })],
    ["deletion", "DELETE", () => logger.deletion(request, { id: 1 })],
    ["error", "ERROR", () => logger.error(request, "something failed")],
    ["info", "INFO", () => logger.info(request, "some info")],
    ["warn", "WARNING", () => logger.warn(request, "some warning")],
  ])("logger.%s writes a %s log line", (_method, expectedLogType, log) => {
    log();

    expect(writtenLogLine()).toMatch(
      new RegExp(`^${expectedLogType} \\(PATCH /v1/chemical/1\\)`),
    );
  });
});
