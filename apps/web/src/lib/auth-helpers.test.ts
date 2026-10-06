// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createRequireSession } from "./auth-helpers";

const lookup = vi.fn();
const requestHeaders = new Headers({ cookie: "acme.session_token=test" });
const requireSession = createRequireSession(lookup, () => Promise.resolve(requestHeaders));

describe("requireSession", () => {
  beforeEach(() => {
    lookup.mockReset();
  });

  it("returns the session found using the current request headers", async () => {
    const session = { user: { id: "user_1" } };
    lookup.mockResolvedValue(session);

    await expect(requireSession("/dashboard")).resolves.toEqual(session);
    expect(lookup).toHaveBeenCalledWith(requestHeaders);
  });

  it("redirects a signed-out visitor with an encoded return destination", async () => {
    lookup.mockResolvedValue(null);

    await expect(
      requireSession("/dashboard/settings?tab=security&filter=name%2Bemail"),
    ).rejects.toMatchObject({
      digest: expect.stringContaining(
        "/login?from=%2Fdashboard%2Fsettings%3Ftab%3Dsecurity%26filter%3Dname%252Bemail",
      ),
    });
  });

  it("propagates session failures to the page error boundary without redirecting", async () => {
    const error = new Error("Database unavailable");
    lookup.mockRejectedValue(error);

    await expect(requireSession("/dashboard")).rejects.toBe(error);
  });
});
