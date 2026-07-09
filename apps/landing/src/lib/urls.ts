const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "https://acme.web.localhost";

const webAppUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${WEB_APP_URL}${normalized}`;
};

export { webAppUrl };
