import { canonicalUrl } from "@repo/portless-env/apps";

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL ?? canonicalUrl("web");

const webAppUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${WEB_APP_URL}${normalized}`;
};

export { webAppUrl };
