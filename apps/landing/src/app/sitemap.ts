import { origins } from "@repo/identity";
import type { MetadataRoute } from "next";

const sitemap = (): MetadataRoute.Sitemap => [{ url: `${origins.landing}/` }];

export default sitemap;
