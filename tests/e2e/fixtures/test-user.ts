// Owned here and seeded by apps/web/scripts/ensure-e2e-user.ts. Kept dependency-free so the
// Playwright config, the setup project, the specs and the seed script can all import it.
const TEST_USER = {
  email: "e2e-test@acme.localhost",
  name: "E2E Test User",
  password: "TestPassword123!",
} as const;

const TEST_USER_STATE = "tests/e2e/.auth/user.json";

export { TEST_USER, TEST_USER_STATE };
