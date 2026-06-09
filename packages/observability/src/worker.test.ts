import { describe, expect, it } from "vitest";
import { createJobLogger, initWorkerLogger } from "./worker";

describe("worker surface", () => {
  it("initWorkerLogger runs without throwing", () => {
    expect(() => initWorkerLogger({ service: "worker" })).not.toThrow();
  });
  it("createJobLogger returns a logger with set/emit", () => {
    initWorkerLogger({ service: "worker" });
    const log = createJobLogger({ jobId: "j1", queue: "default" });
    expect(typeof log.set).toBe("function");
    expect(typeof log.emit).toBe("function");
  });
});
