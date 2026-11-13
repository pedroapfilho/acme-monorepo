import type { routes } from "./routes";
import { HOME_PATH } from "./routes";

const ANCHOR_ORIGIN = "https://anchor.invalid";

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

type AuthPage = typeof routes.login.path | typeof routes.register.path;

const authPageHref = (page: AuthPage, from: string | null | undefined): string => {
  const destination = safeRedirectPath(from);

  return destination === HOME_PATH ? page : `${page}?from=${encodeURIComponent(destination)}`;
};

export { authPageHref, safeRedirectPath };

export type { AuthPage };
