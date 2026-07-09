import { execFileSync } from "node:child_process";

import type { NextConfig } from "next";

const resolveApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.NODE_ENV === "development") {
    try {
      const url = execFileSync("portless", ["get", "acme.api"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (url.startsWith("http")) {
        return url;
      }
    } catch {
      // portless not installed — fall through to localhost default
    }
  }
  return "http://localhost:4000";
};

const apiUrl = resolveApiUrl();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["acme.web.localhost", "*.acme.web.localhost", "*.vercel.app"],
  cacheComponents: true,
  env: { NEXT_PUBLIC_API_URL: apiUrl },
  reactCompiler: true,
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "@repo/db"],
  transpilePackages: ["@repo/ui", "@repo/observability"],
};

export default nextConfig;
