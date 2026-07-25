const FALLBACK_PATH = "/dashboard";
const ANCHOR_ORIGIN = "https://acme.invalid";

/**
 * Validate a redirect value as an in-app relative path.
 * Returns the path unchanged when safe, otherwise "/dashboard".
 */
const safeRedirectPath = (value: string | null | undefined): string => {
  if (
    value === null ||
    value === undefined ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
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
