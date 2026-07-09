import { apiUrl, webUrl } from "../../../playwright.config";

const cleanup = async () => {
  const testEmail = "e2e-test@acme.localhost";

  // Web sign-in cookie is valid on the API too (shared BETTER_AUTH_SECRET + DB).
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
