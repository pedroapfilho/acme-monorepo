import { describe, expect, it } from "vitest";

import { honoEvlog, initApiLogger } from "./hono";

describe("hono surface", () => {
  it("exposes a middleware factory", () => {
    expect(typeof honoEvlog).toBe("function");
    expect(typeof honoEvlog()).toBe("function");
  });
  it("initApiLogger runs without throwing", () => {
    expect(() => initApiLogger({ service: "api" })).not.toThrow();
  });
});
