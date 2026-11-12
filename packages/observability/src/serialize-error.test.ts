import { initLogger, log } from "evlog";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildConfig } from "./config";
import { serializeError } from "./serialize-error";

class StorageError extends Error {
  override name = "NoSuchKey";
  code = "NoSuchKey";
}

const loggedError = (error: Error | ReturnType<typeof serializeError>) => {
  const write = vi.spyOn(console, "error").mockImplementation(() => undefined);

  log.error({ error, message: "Upload failed" });

  const [line] = write.mock.lastCall ?? [];

  return JSON.parse(String(line)).error;
};

describe("serializeError in production logs", () => {
  beforeEach(() => {
    initLogger(buildConfig("api", "production"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is needed because a raw Error field is logged as an empty object", () => {
    expect(loggedError(new Error("boom"))).toEqual({});
  });

  it("keeps the name, message, code and stack", () => {
    const error = new StorageError("The specified key does not exist.");

    expect(loggedError(serializeError(error))).toEqual({
      code: "NoSuchKey",
      message: "The specified key does not exist.",
      name: "NoSuchKey",
      stack: error.stack,
    });
  });

  it("keeps the digest Next.js adds to a server error", () => {
    const error = Object.assign(new Error("Render failed"), { digest: "abc123" });

    expect(loggedError(serializeError(error))).toMatchObject({ digest: "abc123" });
  });

  it("keeps the cause chain", () => {
    const error = new Error("Session lookup failed", { cause: new Error("Database unavailable") });

    expect(loggedError(serializeError(error))).toMatchObject({
      cause: { message: "Database unavailable", name: "Error" },
      message: "Session lookup failed",
    });
  });

  it("stops at an error that causes itself", () => {
    const error = new Error("loop");
    error.cause = error;

    expect(serializeError(error).cause).toEqual({ message: "loop", name: "Error" });
  });

  it("keeps a thrown non-Error value as the cause", () => {
    expect(loggedError(serializeError("socket hang up"))).toEqual({
      cause: "socket hang up",
      message: "Non-Error value thrown",
      name: "NonError",
    });
  });
});
