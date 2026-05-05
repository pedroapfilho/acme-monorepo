// The landing app is served from a different host than the web app, so links
// to /login, /register, etc. must be absolute URLs pointing at the web origin.
// `NEXT_PUBLIC_WEB_APP_URL` is read at build time; default matches the local
// portless dev convention.
const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "https://acme.web.localhost";

const webAppUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${WEB_APP_URL}${normalized}`;
};

export { webAppUrl };
