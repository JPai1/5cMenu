import type { MetadataRoute } from "next";
import { pageUrl, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: pageUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
