import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "./redirect-validation";

describe("safeRedirectPath", () => {
  it("accepts a simple in-app path", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
  });

  it("accepts the root path", () => {
    expect(safeRedirectPath("/")).toBe("/");
  });

  it("accepts nested paths with query and hash", () => {
    expect(safeRedirectPath("/dashboard?tab=account#top")).toBe("/dashboard?tab=account#top");
  });

  it("defaults absent values to /dashboard", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath(undefined)).toBe("/dashboard");
  });

  it("rejects empty string", () => {
    expect(safeRedirectPath("")).toBe("/dashboard");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.com/phish")).toBe("/dashboard");
  });

  it("rejects backslash tricks", () => {
    // Browsers normalize "\" to "/" during URL parsing, so "/\evil.com"
    // would navigate to evil.com if let through.
    expect(safeRedirectPath(String.raw`/\evil.com`)).toBe("/dashboard");
    expect(safeRedirectPath(String.raw`\/evil.com`)).toBe("/dashboard");
    expect(safeRedirectPath(String.raw`/path\..\evil`)).toBe("/dashboard");
  });

  it("rejects absolute URLs", () => {
    expect(safeRedirectPath("https://evil.com/phish")).toBe("/dashboard");
    expect(safeRedirectPath("http://localhost:3000/dashboard")).toBe("/dashboard");
  });

  it("rejects scheme-prefixed values", () => {
    // Built dynamically so lint's no-script-url doesn't flag a literal.
    expect(safeRedirectPath(["javascript", "alert(1)"].join(":"))).toBe("/dashboard");
    expect(safeRedirectPath("data:text/html,<script>1</script>")).toBe("/dashboard");
  });

  it("rejects bare hostnames and relative paths without a leading slash", () => {
    expect(safeRedirectPath("evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("dashboard")).toBe("/dashboard");
    expect(safeRedirectPath(" /dashboard")).toBe("/dashboard");
  });
});
