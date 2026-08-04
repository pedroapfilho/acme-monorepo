import { describe, expect, it } from "vitest";

import { initWorkerLogger } from "./worker";

describe("worker surface", () => {
  it("initWorkerLogger runs without throwing", () => {
    expect(() => {
      initWorkerLogger({ service: "worker" });
    }).not.toThrow();
  });
});
