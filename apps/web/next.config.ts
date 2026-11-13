import { baseNextConfig } from "@repo/config-next";
import { applyPortlessUrls } from "@repo/portless-env";
import type { NextConfig } from "next";

applyPortlessUrls(["WEB_APP_URL"]);

const nextConfig: NextConfig = {
  ...baseNextConfig("web", {
    exposeTestingApiInProductionBuild: process.env.EXPOSE_TESTING_API === "1",
    instantInsights: { validationLevel: "manual-warning" },
  }),
  serverExternalPackages: ["@prisma/client", "@repo/db"],
  transpilePackages: ["@repo/ui", "@repo/observability"],
  turbopack: {
    rules: {
      "*.{ts,tsx}": {
        condition: {
          all: [{ not: "foreign" }, { content: /[Zz]od/ }],
        },
        loaders: ["zod-compiler/turbopack"],
      },
    },
  },
};

export default nextConfig;
