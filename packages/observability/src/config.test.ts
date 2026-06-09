import { describe, expect, it } from "vitest";
import { buildConfig } from "./config";

describe("buildConfig", () => {
  it("is pretty and unredacted in development", () => {
    const cfg = buildConfig("api", "development");
    expect(cfg.pretty).toBe(true);
    expect(cfg.redact).toBe(false);
    expect(cfg.minLevel).toBe("debug");
    expect(cfg.env).toEqual({ environment: "development", service: "api" });
  });
  it("is plain and redacted in production", () => {
    const cfg = buildConfig("api", "production");
    expect(cfg.pretty).toBe(false);
    expect(cfg.redact).toBe(true);
    expect(cfg.minLevel).toBe("info");
    expect(cfg.env).toEqual({ environment: "production", service: "api" });
  });
  it("has no external drain", () => {
    expect(buildConfig("api", "development").drain).toBeUndefined();
  });
  it("mirrors development settings in test for debuggability", () => {
    const cfg = buildConfig("api", "test");
    expect(cfg.pretty).toBe(true);
    expect(cfg.redact).toBe(false);
    expect(cfg.minLevel).toBe("debug");
    expect(cfg.env).toEqual({ environment: "test", service: "api" });
  });
});
