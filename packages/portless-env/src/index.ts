import { execFileSync } from "node:child_process";
import { env as processEnv } from "node:process";

import { apps, canonicalHostname, urlEnv } from "@repo/portless-env/apps";
import type { App, UrlEnvKey } from "@repo/portless-env/apps";

type ProcessEnvironment = Record<string, string | undefined>;
type Run = (file: string, args: ReadonlyArray<string>) => string;

type LookupOptions = { run?: Run };
type ApplyOptions = LookupOptions & { env?: ProcessEnvironment };

const runSync: Run = (file, args) =>
  // oxlint-disable-next-line node/no-sync -- Next, Vite, and tsdown evaluate their configs synchronously, so the lookup has to block.
  execFileSync(file, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });

const portlessUrl = (app: App, { run = runSync }: LookupOptions = {}): string => {
  const { name } = apps[app];
  const url = run("portless", ["get", name]).trim();
  if (!URL.canParse(url)) {
    throw new Error(`portless get ${name} printed "${url}" instead of a URL`);
  }
  return url;
};

const isCanonicalLocalDefault = (value: string, envKey: UrlEnvKey): boolean => {
  const values = value.split(",").map((item) => item.trim());
  const owners = urlEnv[envKey];
  return (
    values.length === owners.length &&
    values.every((item, index) => {
      const owner = owners[index];
      return owner !== undefined && URL.parse(item)?.hostname === canonicalHostname(owner);
    })
  );
};

const applyPortlessUrls = (
  envKeys: ReadonlyArray<UrlEnvKey>,
  { env = processEnv, run }: ApplyOptions = {},
): void => {
  if (env.PORTLESS_URL === undefined || env.PORTLESS_URL === "") {
    return;
  }

  const urls = new Map<App, string>();
  const resolve = (app: App): string => {
    const url = urls.get(app) ?? portlessUrl(app, { run });
    urls.set(app, url);
    return url;
  };

  for (const envKey of envKeys) {
    const current = env[envKey];
    if (current !== undefined && current !== "" && !isCanonicalLocalDefault(current, envKey)) {
      continue;
    }
    env[envKey] = urlEnv[envKey].map(resolve).join(",");
  }
};

export { applyPortlessUrls, portlessUrl };
