import { vi } from "vitest";

// Better Auth captures fetch when its client is created, so install the stub before test imports.
vi.stubGlobal(
  "fetch",
  vi.fn<typeof fetch>((input) => {
    const url = input instanceof Request ? input.url : input.toString();
    throw new Error(`Unexpected auth request to ${url}`);
  }),
);
