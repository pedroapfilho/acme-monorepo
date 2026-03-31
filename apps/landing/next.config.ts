import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["acme.landing.localhost"],
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
