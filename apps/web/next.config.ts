import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],

  experimental: {
    optimizePackageImports: ["@repo/ui", "lucide-react"],
  },

  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{member}}",
    },
  },
};

export default nextConfig;
