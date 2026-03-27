import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { reducer } from "./use-toast";

const makeToast = (id: string, open = true) =>
  ({ id, open, title: `Toast ${id}` }) as Parameters<typeof reducer>[0]["toasts"][number];

describe("reducer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should add a toast with ADD_TOAST", () => {
    const state = { toasts: [] };
    const toast = makeToast("1");

    const result = reducer(state, { toast, type: "ADD_TOAST" });

    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0]?.id).toBe("1");
  });

  it("should limit toasts to 1", () => {
    const state = { toasts: [makeToast("1")] };
    const toast = makeToast("2");

    const result = reducer(state, { toast, type: "ADD_TOAST" });

    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0]?.id).toBe("2");
  });

  it("should update a matching toast with UPDATE_TOAST", () => {
    const state = { toasts: [makeToast("1")] };

    const result = reducer(state, {
      toast: { id: "1", title: "Updated" },
      type: "UPDATE_TOAST",
    });

    expect(result.toasts[0]?.title).toBe("Updated");
  });

  it("should not update non-matching toasts", () => {
    const state = { toasts: [makeToast("1")] };

    const result = reducer(state, {
      toast: { id: "99", title: "Nope" },
      type: "UPDATE_TOAST",
    });

    expect(result.toasts[0]?.title).toBe("Toast 1");
  });

  it("should set open to false on DISMISS_TOAST with specific id", () => {
    const state = { toasts: [makeToast("1")] };

    const result = reducer(state, { toastId: "1", type: "DISMISS_TOAST" });

    expect(result.toasts[0]?.open).toBe(false);
  });

  it("should set open to false on all toasts when DISMISS_TOAST has no id", () => {
    const state = { toasts: [makeToast("1")] };

    const result = reducer(state, { toastId: undefined, type: "DISMISS_TOAST" });

    expect(result.toasts[0]?.open).toBe(false);
  });

  it("should remove specific toast with REMOVE_TOAST", () => {
    const state = { toasts: [makeToast("1")] };

    const result = reducer(state, { toastId: "1", type: "REMOVE_TOAST" });

    expect(result.toasts).toHaveLength(0);
  });

  it("should remove all toasts when REMOVE_TOAST has no id", () => {
    const state = { toasts: [makeToast("1")] };

    const result = reducer(state, { toastId: undefined, type: "REMOVE_TOAST" });

    expect(result.toasts).toHaveLength(0);
  });
});
