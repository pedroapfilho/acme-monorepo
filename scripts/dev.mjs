import { spawn } from "node:child_process";

import { applyPortlessUrls } from "./portless-env.mjs";

applyPortlessUrls({
  CORS_ORIGINS: ["acme.web", "acme.landing"],
  NEXT_PUBLIC_API_URL: "acme.api",
  NEXT_PUBLIC_WEB_APP_URL: "acme.web",
  WEB_APP_URL: "acme.web",
});

const child = spawn("pnpm", ["exec", "turbo", "dev"], {
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
