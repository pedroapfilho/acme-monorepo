import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

const sitemap = (): MetadataRoute.Sitemap => [{ url: `${SITE_URL}/` }];

export default sitemap;
