import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAuthSubmit } from "./use-auth-submit";

describe("useAuthSubmit", () => {
  it("ignores a second submit issued in the same frame", async () => {
    const handleSubmit = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useAuthSubmit());

    await act(async () => {
      await Promise.all([
        result.current.submit({ handleSubmit }),
        result.current.submit({ handleSubmit }),
      ]);
    });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("stays submittable after the form rejects", async () => {
    const handleSubmit = vi.fn(() => Promise.reject(new Error("validator exploded")));
    const { result } = renderHook(() => useAuthSubmit());

    await act(async () => {
      await expect(result.current.submit({ handleSubmit })).rejects.toThrow("validator exploded");
    });
    await act(async () => {
      await expect(result.current.submit({ handleSubmit })).rejects.toThrow("validator exploded");
    });

    expect(handleSubmit).toHaveBeenCalledTimes(2);
  });

  it("holds the latch until the transition body settles", async () => {
    const work = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useAuthSubmit());
    const handleSubmit = vi.fn(() => {
      result.current.run(work);
      return Promise.resolve();
    });

    await act(async () => {
      await result.current.submit({ handleSubmit });
      await result.current.submit({ handleSubmit });
    });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(work).toHaveBeenCalledTimes(1);
  });
});
