import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Result pages also carry noindex; this keeps crawlers from fetching them at all.
    rules: { userAgent: "*", allow: "/", disallow: "/results/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
