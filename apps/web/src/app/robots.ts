import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: { disallow: "/", userAgent: "*" },
});

export default robots;
