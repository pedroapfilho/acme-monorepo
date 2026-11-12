import { act, fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthActionButton } from "./auth-action-button";

const UNEXPECTED_ERROR = expect.stringMatching(/try again/v);

type Result = {
  data: { id: string } | null;
  error: { code?: string; message?: string } | null;
};

const showToast = vi.spyOn(toast, "error");
const consoleError = vi.spyOn(console, "error");

const succeed = (): Promise<Result> => Promise.resolve({ data: { id: "user-1" }, error: null });

const fail = (failure: { code?: string; message?: string }): Promise<Result> =>
  Promise.resolve({ data: null, error: failure });

const settle = () =>
  act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });

const liveRegionText = () =>
  document.querySelector('[aria-live="polite"][aria-atomic="true"]')?.textContent;

beforeEach(() => {
  showToast.mockClear();
  consoleError.mockReset();
});

describe("AuthActionButton", () => {
  const action = vi.fn<() => Promise<Result>>();
  const onDone = vi.fn();

  const renderButton = () => {
    render(
      <AuthActionButton
        call={action}
        fallbackError="Failed to sign out"
        onSuccess={onDone}
        pendingLabel="Signing out…"
      >
        Sign out
      </AuthActionButton>,
    );

    return screen.getByRole("button", { name: "Sign out" });
  };

  beforeEach(() => {
    action.mockReset();
    onDone.mockReset();
  });

  it("runs once per burst of clicks and reports the outcome", async () => {
    action.mockImplementationOnce(() => fail({}));
    action.mockImplementationOnce(succeed);
    const button = renderButton();

    fireEvent.click(button);
    fireEvent.click(button);
    await settle();

    expect(action).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith("Failed to sign out");
    expect(liveRegionText()).toBe("Failed to sign out");
    expect(onDone).not.toHaveBeenCalled();

    fireEvent.click(button);
    await settle();

    expect(action).toHaveBeenCalledTimes(2);
    expect(onDone).toHaveBeenCalledWith({ id: "user-1" }, undefined);
    expect(liveRegionText()).toBe("");
  });

  it("shows the pending label until the call settles", async () => {
    const pending = Promise.withResolvers<Result>();
    action.mockReturnValue(pending.promise);
    fireEvent.click(renderButton());
    await settle();

    expect(screen.getByRole("button", { name: "Signing out…" }).matches(":disabled")).toBe(true);

    pending.resolve({ data: { id: "user-1" }, error: null });
    await settle();

    expect(screen.getByRole("button", { name: "Sign out" }).matches(":disabled")).toBe(false);
  });

  it("reports a thrown call with the generic message", async () => {
    action.mockRejectedValue(new Error("network down"));
    fireEvent.click(renderButton());
    await settle();

    expect(showToast).toHaveBeenCalledWith(UNEXPECTED_ERROR);
    expect(screen.getByRole("button", { name: "Sign out" }).matches(":disabled")).toBe(false);
  });
});
