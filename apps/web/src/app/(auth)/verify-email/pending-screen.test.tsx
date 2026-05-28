import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { resetCredsStoreForTests, stashCreds } from "./creds-store";
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
  it("renders the stale-tab fallback when no creds token is in the URL", () => {
    resetCredsStoreForTests();
    render(<PendingScreen token={null} />);
    // getByRole throws if missing — its return implies "in the document".
    screen.getByRole("heading", { name: /verifying your email/iv });
    const link = screen.getByRole("link", { name: /sign in/iv });
    expect(link.getAttribute("href")).toBe("/login");
  });

  it("renders the polling state with the stashed email when creds are present", () => {
    resetCredsStoreForTests();
    const token = stashCreds({ email: "user@example.com", password: "pw-12345678" });
    render(<PendingScreen token={token} />);
    screen.getByText("user@example.com");
    const resend = screen.getByRole("button", { name: /resend verification email/iv });
    expect(resend.hasAttribute("disabled")).toBe(false);
  });
});
