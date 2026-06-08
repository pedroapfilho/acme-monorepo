import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PendingScreen from "./pending-screen";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    sendVerificationEmail: vi.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

describe("PendingScreen", () => {
  it("renders the fallback when no email is in the URL", () => {
    render(<PendingScreen email={null} />);
    // getByRole throws if missing — its return implies "in the document".
    screen.getByRole("heading", { name: /check your inbox/iv });
    const link = screen.getByRole("link", { name: /sign in/iv });
    expect(link.getAttribute("href")).toBe("/login");
  });

  it("renders the email + resend button when email is present", () => {
    render(<PendingScreen email="user@example.com" />);
    screen.getByText("user@example.com");
    const resend = screen.getByRole("button", { name: /resend verification email/iv });
    expect(resend.hasAttribute("disabled")).toBe(false);
    const signIn = screen.getByRole("link", { name: /sign in/iv });
    expect(signIn.getAttribute("href")).toBe("/login");
  });
});
