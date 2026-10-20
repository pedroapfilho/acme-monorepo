import { createRequestLogger } from "evlog";
import { describe, expect, it } from "vitest";

import { identifyUser } from "./auth";

describe("identifyUser", () => {
  it("puts the resolved session's user on the request's wide event", () => {
    const log = createRequestLogger({ method: "GET", path: "/api/v1/users/me" });

    const identified = identifyUser(log, {
      session: { id: "session-1" },
      user: { email: "alice@example.com", id: "user-1" },
    });

    expect(identified).toBe(true);
    expect(log.getContext()).toMatchObject({
      session: { id: "session-1" },
      user: { email: "alice@example.com", id: "user-1" },
      userId: "user-1",
    });
  });
});
