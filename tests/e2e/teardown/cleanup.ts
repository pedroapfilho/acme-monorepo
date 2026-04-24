import { apiUrl, webUrl } from "../../../playwright.config";

const cleanup = async () => {
  const testEmail = "e2e-test@acme.localhost";

  // Sign in via Better Auth (on the web app) to get a session cookie, then delete
  // the user through the Hono API. The API validates the session via the shared
  // @repo/auth instance — the cookie is accepted across origins because both
  // apps share the BETTER_AUTH_SECRET and the user record in the same database.
  const signIn = await fetch(`${webUrl}/api/auth/sign-in/email`, {
    body: JSON.stringify({ email: testEmail, password: "TestPassword123!" }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (signIn.ok) {
    const cookies = signIn.headers.getSetCookie().join("; ");

    await fetch(`${apiUrl}/api/v1/users/me`, {
      headers: { Cookie: cookies },
      method: "DELETE",
    });
  }
};

export default cleanup;
