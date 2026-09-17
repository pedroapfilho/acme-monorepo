import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

const robots = (): MetadataRoute.Robots => ({
  rules: { allow: "/", userAgent: "*" },
  sitemap: `${SITE_URL}/sitemap.xml`,
});

export default robots;
