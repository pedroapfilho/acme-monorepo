import { apps, urlEnv } from "@repo/portless-env/registry";

type App = keyof typeof apps;

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
  canonicalHostname,
  canonicalUrl,
  canonicalUrls,
  localHostPatterns,
  loopbackOrigins,
  loopbackUrl,
};

export { apps, urlEnv } from "@repo/portless-env/registry";

export type { App, UrlEnvKey };
