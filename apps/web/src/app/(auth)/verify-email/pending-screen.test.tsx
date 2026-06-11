import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { resetCredentialsStoreForTests, stashCredentials } from "./credentials-store";
import PendingScreen from "./pending-screen";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    sendVerificationEmail: vi.fn(() => Promise.resolve({ data: null, error: null })),
    signIn: {
      email: vi.fn(() => Promise.resolve({ data: null, error: { message: "not verified" } })),
    },
  },
}));

describe("PendingScreen", () => {
  it("renders the stale-tab fallback when no credentials token is in the URL", () => {
    resetCredentialsStoreForTests();
    render(<PendingScreen token={null} />);
    // getByText throws if missing — its return implies "in the document".
    // @repo/ui's CardTitle isn't always a heading element in this fleet, so
    // text-based lookup is portable across the apps' UI package versions.
    screen.getByText(/verifying your email/iv);
    const link = screen.getByRole("link", { name: /sign in/iv });
    expect(link.getAttribute("href")).toBe("/login");
  });

  it("renders the polling state with the stashed email when credentials are present", () => {
    resetCredentialsStoreForTests();
    const token = stashCredentials({ email: "user@example.com", password: "pw-12345678" });
    render(<PendingScreen token={token} />);
    screen.getByText("user@example.com");
    const resend = screen.getByRole("button", { name: /resend verification email/iv });
    expect(resend.hasAttribute("disabled")).toBe(false);
  });
});
