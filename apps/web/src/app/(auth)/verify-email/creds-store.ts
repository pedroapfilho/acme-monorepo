// Module-level in-memory store for the {email, password} handoff between the
// signup form and the /verify-email pending screen. Lives only in this JS
// context — wiped on full page reload, never written to disk, never reachable
// from another tab. The pending screen reads via `consumeCreds` which removes
// the entry on first read.

type Creds = {
  email: string;
  password: string;
};

const store = new Map<string, Creds>();

const newToken = (): string =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

const stashCreds = (creds: Creds): string => {
  const token = newToken();
  store.set(token, creds);
  return token;
};

const consumeCreds = (token: string): Creds | null => {
  const creds = store.get(token);
  if (!creds) {
    return null;
  }
  store.delete(token);
  return creds;
};

// Test-only escape hatch — vitest's per-test isolation doesn't reset module
// state, and exporting this is cheaper than mocking the module.
const __resetCredsStore = () => {
  store.clear();
};

export { __resetCredsStore, consumeCreds, stashCreds };
