import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@repo/ui", "lucide-react"],
  },
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{member}}",
    },
  },
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        destination: `${apiUrl}/auth/:path*`,
        source: "/api/auth/:path*",
      },
    ];
  },

  serverExternalPackages: ["@prisma/client", "@repo/db"],

  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
