// The auth pages forward a `?from=` param: the proxy sets it when bouncing
// logged-out visitors off protected routes, login pushes it after sign-in,
// and register passes it as the verification email's callbackURL so the
// clicker lands back on the page that sent them to auth. This validator is
// the open-redirect gate — Better Auth's server-side trustedOrigins check
// is a backstop, not the contract.

const FALLBACK_PATH = "/dashboard";

// Fixed base for URL resolution: anything that escapes it (absolute URL,
// scheme, protocol-relative host) resolves to a different origin.
const ANCHOR_ORIGIN = "https://acme.invalid";

/**
 * Validate a redirect value as an in-app relative path.
 * Returns the path unchanged when safe, otherwise "/dashboard".
 *
 * Rejected: absolute URLs, protocol-relative ("//evil.com"), backslash
 * tricks ("/\evil.com" — browsers normalize "\" to "/"), schemes
 * ("javascript:"), and anything not starting with a single "/".
 */
const safeRedirectPath = (value: string | null | undefined): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return FALLBACK_PATH;
  }

  try {
    if (new URL(value, ANCHOR_ORIGIN).origin !== ANCHOR_ORIGIN) {
      return FALLBACK_PATH;
    }
  } catch {
    return FALLBACK_PATH;
  }

  return value;
};

export { safeRedirectPath };
