import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["acme.landing.localhost", "*.acme.landing.localhost", "*.vercel.app"],
  cacheComponents: true,
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/observability"],
};

export default nextConfig;
