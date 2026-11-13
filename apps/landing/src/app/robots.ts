import { origins } from "@repo/identity";
import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: { allow: "/", userAgent: "*" },
  sitemap: `${origins.landing}/sitemap.xml`,
});

export default robots;
