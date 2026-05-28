import { afterEach, describe, expect, it } from "vitest";

import {
  consumeCredentials,
  resetCredentialsStoreForTests,
  stashCredentials,
} from "./credentials-store";

describe("credentials-store", () => {
  afterEach(() => {
    resetCredentialsStoreForTests();
  });

  it("issues a token and returns the stashed credentials exactly once", () => {
    const token = stashCredentials({ email: "a@b.com", password: "pw-12345678" });
    expect(consumeCredentials(token)).toEqual({ email: "a@b.com", password: "pw-12345678" });
    expect(consumeCredentials(token)).toBeNull();
  });

  it("returns null for an unknown token", () => {
    expect(consumeCredentials("not-a-real-token")).toBeNull();
  });

  it("issues a different token per stash", () => {
    const t1 = stashCredentials({ email: "a@b.com", password: "pw-12345678" });
    const t2 = stashCredentials({ email: "c@d.com", password: "pw-87654321" });
    expect(t1).not.toBe(t2);
  });
});
