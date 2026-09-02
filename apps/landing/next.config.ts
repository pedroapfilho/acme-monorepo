import { applyPortlessUrls } from "@repo/portless-env";
import type { NextConfig } from "next";

applyPortlessUrls({ NEXT_PUBLIC_WEB_APP_URL: ["acme.web"] });

const nextConfig: NextConfig = {
  allowedDevOrigins: ["acme.landing.localhost", "*.acme.landing.localhost", "*.vercel.app"],
  cacheComponents: true,
  experimental: { turbopackRustReactCompiler: true },
  headers: () =>
    Promise.resolve([
      {
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
        source: "/:path*",
      },
    ]),
  partialPrefetching: true,
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/observability"],
};

export default nextConfig;
