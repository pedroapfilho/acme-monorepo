import { canonicalHostname } from "@repo/portless-env/apps";
import type { App } from "@repo/portless-env/apps";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const baseNextConfig = (app: App, experimental: NextConfig["experimental"] = {}) =>
  ({
    allowedDevOrigins: [canonicalHostname(app), `*.${canonicalHostname(app)}`, "*.vercel.app"],
    cacheComponents: true,
    experimental: { ...experimental, turbopackRustReactCompiler: true },
    headers: () => Promise.resolve([{ headers: securityHeaders, source: "/:path*" }]),
    partialPrefetching: true,
    reactCompiler: true,
    reactStrictMode: true,
  }) satisfies NextConfig;

export { baseNextConfig, securityHeaders };
