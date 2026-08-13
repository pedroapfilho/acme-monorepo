import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSubmitLatch } from "./use-submit-latch";

const deferred = () => {
  let resolve: (() => void) | undefined;
  const promise = new Promise<void>((settle) => {
    resolve = settle;
  });
  if (resolve === undefined) {
    throw new Error("Deferred promise did not initialize");
  }
  return { promise, resolve };
};

describe("useSubmitLatch", () => {
  it("blocks a second submission until the active request releases it", async () => {
    const pending = deferred();
    const submit = vi.fn(() => pending.promise);
    const { result } = renderHook(() => useSubmitLatch());

    let first = Promise.resolve();
    await act(async () => {
      first = result.current.run({ isPending: false, isValid: () => true, submit });
      await result.current.run({ isPending: false, isValid: () => true, submit });
    });

    expect(submit).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.release();
      pending.resolve();
      await first;
    });
  });

  it("releases after validation rejects the submission", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useSubmitLatch());

    await act(async () => {
      await result.current.run({ isPending: false, isValid: () => false, submit });
      await result.current.run({ isPending: false, isValid: () => false, submit });
    });

    expect(submit).toHaveBeenCalledTimes(2);
  });
});
