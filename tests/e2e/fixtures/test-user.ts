// Kept dependency-free so the Playwright config can import it.
const TEST_USER = {
  email: "delivered+e2e-seeded-user@resend.dev",
  name: "E2E Test User",
  password: "TestPassword123!",
} as const;

const TEST_USER_STATE = "tests/e2e/.auth/user.json";

export { TEST_USER, TEST_USER_STATE };
