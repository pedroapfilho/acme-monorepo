import { execFileSync } from "node:child_process";

const portlessUrl = (name) =>
  execFileSync("portless", ["get", name], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();

const applyPortlessUrls = (portlessNamesByEnvKey, options = {}) => {
  const env = options.env ?? process.env;
  const resolveUrl = options.resolveUrl ?? portlessUrl;

  for (const [envKey, portlessNames] of Object.entries(portlessNamesByEnvKey)) {
    if (env[envKey]) {
      continue;
    }

    const names = Array.isArray(portlessNames) ? portlessNames : [portlessNames];
    env[envKey] = names.map((name) => resolveUrl(name)).join(",");
  }

  return env;
};

export { applyPortlessUrls };
