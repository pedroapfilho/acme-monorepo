import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["acme.landing.localhost", "*.acme.landing.localhost", "*.vercel.app"],
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
