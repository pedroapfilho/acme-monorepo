import { afterEach, describe, expect, it } from "vitest";

import { resetCredsStoreForTests, consumeCreds, stashCreds } from "./creds-store";

describe("creds-store", () => {
  afterEach(() => {
    resetCredsStoreForTests();
  });

  it("issues a token and returns the stashed creds exactly once", () => {
    const token = stashCreds({ email: "a@b.com", password: "pw-12345678" });
    expect(consumeCreds(token)).toEqual({ email: "a@b.com", password: "pw-12345678" });
    expect(consumeCreds(token)).toBeNull();
  });

  it("returns null for an unknown token", () => {
    expect(consumeCreds("not-a-real-token")).toBeNull();
  });

  it("issues a different token per stash", () => {
    const t1 = stashCreds({ email: "a@b.com", password: "pw-12345678" });
    const t2 = stashCreds({ email: "c@d.com", password: "pw-87654321" });
    expect(t1).not.toBe(t2);
  });
});
