const apps = {
  api: { name: "acme.api", port: 4000 },
  landing: { name: "acme.landing", port: 3001 },
  web: { name: "acme.web", port: 3000 },
} as const;

type App = keyof typeof apps;

const urlEnv = {
  CORS_ORIGINS: ["web", "landing"],
  NEXT_PUBLIC_WEB_APP_URL: ["web"],
  WEB_APP_URL: ["web"],
} as const satisfies Record<string, ReadonlyArray<App>>;

type UrlEnvKey = keyof typeof urlEnv;

const LOOPBACK_HOSTNAMES = ["localhost", "127.0.0.1"] as const;

type LoopbackHostname = (typeof LOOPBACK_HOSTNAMES)[number];

const canonicalHostname = (app: App): string => `${apps[app].name}.localhost`;

const canonicalUrl = (app: App): string => `https://${canonicalHostname(app)}`;

const canonicalUrls = (key: UrlEnvKey): Array<string> => urlEnv[key].map(canonicalUrl);

const loopbackOrigin = (hostname: LoopbackHostname, port: number): string =>
  `http://${hostname}:${port}`;

const loopbackUrl = (app: App, hostname: LoopbackHostname): string =>
  loopbackOrigin(hostname, apps[app].port);

const loopbackOrigins = Object.values(apps).flatMap(({ port }) =>
  LOOPBACK_HOSTNAMES.map((hostname) => loopbackOrigin(hostname, port)),
);

// Portless serves every app, worktree-prefixed or not, on :443 or on its unprivileged fallback port.
const localHostPatterns = [
  "**.localhost",
  "**.localhost:*",
  ...LOOPBACK_HOSTNAMES.map((hostname) => `${hostname}:*`),
];

export {
  apps,
  canonicalHostname,
  canonicalUrl,
  canonicalUrls,
  localHostPatterns,
  loopbackOrigins,
  loopbackUrl,
  urlEnv,
};
export type { App, UrlEnvKey };
