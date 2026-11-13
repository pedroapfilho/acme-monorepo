import { baseNextConfig } from "@repo/config-next";
import { applyPortlessUrls } from "@repo/portless-env";
import type { NextConfig } from "next";

applyPortlessUrls(["NEXT_PUBLIC_WEB_APP_URL"]);

const nextConfig: NextConfig = {
  ...baseNextConfig("landing"),
  transpilePackages: ["@repo/ui", "@repo/observability"],
};

export default nextConfig;
