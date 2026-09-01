/// <reference types="node" />

import { execFileSync } from "node:child_process";
import { env as processEnv } from "node:process";

type ProcessEnvironment = Record<string, string | undefined>;
type PortlessMapping = Record<string, ReadonlyArray<string>>;

const portless = (...args: Array<string>): string =>
  execFileSync("portless", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();

const urls = new Map<string, string>();

const isCanonicalLocalDefault = (value: string, names: ReadonlyArray<string>): boolean => {
  const values = value.split(",").map((item) => item.trim());
  return (
    values.length === names.length &&
    values.every((item, index) => {
      try {
        return new URL(item).hostname === `${names[index]}.localhost`;
      } catch {
        return false;
      }
    })
  );
};

const resolve = (name: string): string => {
  const cached = urls.get(name);
  if (cached !== undefined) {
    return cached;
  }

  const url = portless("get", name);
  urls.set(name, url);
  return url;
};

export const applyPortlessUrls = (
  mapping: PortlessMapping,
  env: ProcessEnvironment = processEnv,
  enabled = env.PORTLESS_URL !== undefined && env.PORTLESS_URL !== "",
): ProcessEnvironment => {
  if (!enabled) {
    return env;
  }

  for (const [envKey, names] of Object.entries(mapping)) {
    const current = env[envKey];
    if (current !== undefined && current !== "" && !isCanonicalLocalDefault(current, names)) {
      continue;
    }
    env[envKey] = names.map(resolve).join(",");
  }

  return env;
};
