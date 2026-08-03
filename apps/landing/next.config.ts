import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["acme.landing.localhost", "*.acme.landing.localhost", "*.vercel.app"],
  cacheComponents: true,
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
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/observability"],
};

export default nextConfig;
