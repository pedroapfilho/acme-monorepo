// Module-level in-memory store for the {email, password} handoff between the
// signup form and the /verify-email pending screen. Lives only in this JS
// context — wiped on full page reload, never written to disk, never reachable
// from another tab. The pending screen reads via `consumeCredentials` which
// removes the entry on first read.

type Credentials = {
  email: string;
  password: string;
};

const store = new Map<string, Credentials>();

const newToken = (): string =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

const stashCredentials = (credentials: Credentials): string => {
  const token = newToken();
  store.set(token, credentials);
  return token;
};

const consumeCredentials = (token: string): Credentials | null => {
  const credentials = store.get(token);
  if (!credentials) {
    return null;
  }
  store.delete(token);
  return credentials;
};

// Test-only escape hatch — vitest's per-test isolation doesn't reset module
// state, and exporting this is cheaper than mocking the module.
const resetCredentialsStoreForTests = () => {
  store.clear();
};

export { consumeCredentials, resetCredentialsStoreForTests, stashCredentials };
