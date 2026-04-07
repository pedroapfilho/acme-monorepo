import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["acme.landing.localhost"],
  experimental: {
    optimizePackageImports: ["@repo/ui"],
  },
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
