const HOME_PATH = "/dashboard";
const ANCHOR_ORIGIN = "https://acme.invalid";
const PASSWORD_RESET_NOTICE = "password-reset-success";

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
    value.includes("\\") ||
    !URL.canParse(value, ANCHOR_ORIGIN) ||
    new URL(value, ANCHOR_ORIGIN).origin !== ANCHOR_ORIGIN
  ) {
    return HOME_PATH;
  }

  return value;
};

const authPageHref = (page: "/login" | "/register", from: string | null | undefined): string => {
  const destination = safeRedirectPath(from);

  return destination === HOME_PATH ? page : `${page}?from=${encodeURIComponent(destination)}`;
};

export { authPageHref, HOME_PATH, PASSWORD_RESET_NOTICE, safeRedirectPath };
