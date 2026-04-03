import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["acme.landing.localhost"],
  experimental: {
    optimizePackageImports: ["@repo/ui"],
    viewTransition: true,
  },
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
