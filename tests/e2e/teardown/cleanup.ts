import { apiUrl, webUrl } from "../../../playwright.config";
import { TEST_USER } from "../fixtures/test-user";

const cleanup = async () => {
  const signIn = await fetch(`${webUrl}/api/auth/sign-in/email`, {
    body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password }),
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
