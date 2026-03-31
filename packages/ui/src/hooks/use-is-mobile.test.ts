import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useIsMobile } from "./use-is-mobile";

const mockMatchMedia = (matches: boolean) => {
  const listeners: Array<() => void> = [];

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn((_event: string, cb: () => void) => {
        listeners.push(cb);
      }),
      matches,
      removeEventListener: vi.fn(),
    }),
    writable: true,
  });

  return listeners;
};

describe("useIsMobile", () => {
  it("should return true when window width is below 768px", () => {
    mockMatchMedia(true);
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375, writable: true });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should return false when window width is 768px or above", () => {
    mockMatchMedia(false);
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
      writable: true,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("should return false when window width is exactly 768px", () => {
    mockMatchMedia(false);
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 768, writable: true });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });
});
