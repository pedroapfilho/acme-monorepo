import { describe, expect, it } from "vitest";

import { initApiLogger } from "./hono";

describe("initApiLogger", () => {
  it("runs without throwing", () => {
    expect(() => {
      initApiLogger({ service: "api" });
    }).not.toThrow();
  });
});
