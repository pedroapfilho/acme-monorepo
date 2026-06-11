import { describe, expect, it } from "vitest";

import { createIdentify } from "./auth";

describe("createIdentify", () => {
  it("returns an identify function bound to the given auth", () => {
    const fakeAuth = { api: { getSession: () => Promise.resolve(null) } };
    const identify = createIdentify(fakeAuth);
    expect(typeof identify).toBe("function");
  });
});
