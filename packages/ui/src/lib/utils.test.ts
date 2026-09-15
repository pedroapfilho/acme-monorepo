import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("should merge multiple class names", () => {
    expect(cn("block", "relative")).toBe("block relative");
  });

  it("should handle conditional classes", () => {
    const condition = false;
    expect(cn("block", condition && "relative", "isolate")).toBe("block isolate");
  });

  it("should resolve tailwind conflicts by keeping the last one", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("should return empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("should handle array inputs", () => {
    expect(cn(["block", "relative"])).toBe("block relative");
  });

  it("should handle object inputs", () => {
    expect(cn({ block: true, relative: false })).toBe("block");
  });

  it("should handle mixed inputs", () => {
    expect(cn("block", ["relative"], { isolate: true })).toBe("block relative isolate");
  });
});
