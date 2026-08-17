// Owned here and seeded by apps/web/scripts/ensure-e2e-user.ts. Kept dependency-free so the setup
// project, the global teardown, and the specs can all import it without pulling in Playwright.
const TEST_USER = {
  email: "e2e-test@acme.localhost",
  name: "E2E Test User",
  password: "TestPassword123!",
} as const;

export { TEST_USER };
