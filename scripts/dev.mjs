import { spawnSync } from "node:child_process";

import { applyPortlessUrls } from "./portless-env.mjs";

const env = applyPortlessUrls({
  CORS_ORIGINS: ["acme.web", "acme.landing"],
  NEXT_PUBLIC_API_URL: ["acme.api"],
  WEB_APP_URL: ["acme.web"],
});

const { status } = spawnSync("pnpm", ["exec", "turbo", "dev"], {
  env,
  stdio: "inherit",
});

process.exit(status ?? 1);
