import { execFileSync } from "node:child_process";

const portless = (...args) =>
  execFileSync("portless", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();

const urls = new Map();

const resolve = (name) => {
  if (!urls.has(name)) {
    urls.set(name, portless("get", name));
  }
  return urls.get(name);
};

export const applyPortlessUrls = (mapping, env = process.env) => {
  portless("proxy", "start");

  for (const [envKey, names] of Object.entries(mapping)) {
    if (env[envKey]) {
      continue;
    }
    env[envKey] = names.map(resolve).join(",");
  }

  return env;
};
