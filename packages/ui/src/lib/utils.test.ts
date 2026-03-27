import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("should merge multiple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const condition = false;
    expect(cn("foo", condition && "bar", "baz")).toBe("foo baz");
  });

  it("should resolve tailwind conflicts by keeping the last one", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("should handle ui: prefixed classes", () => {
    // ui: variant classes coexist with non-prefixed (different variant scope)
    expect(cn("ui:p-4", "p-2")).toBe("ui:p-4 p-2");
    // ui: prefixed classes conflict with each other
    expect(cn("ui:p-4", "ui:p-2")).toBe("ui:p-2");
  });

  it("should return empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("should handle array inputs", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("should handle object inputs", () => {
    expect(cn({ bar: false, foo: true })).toBe("foo");
  });

  it("should handle mixed inputs", () => {
    expect(cn("foo", ["bar"], { baz: true })).toBe("foo bar baz");
  });
});
