import type { MetadataRoute } from "next";
import { isDemo } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // While data/ holds demo data, keep the whole site out of search engines so no one finds fake
  // results by searching. Setting "demo": false in data/samples.json opens it up.
  if (isDemo) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    // Result pages also carry noindex; this keeps crawlers from fetching them at all.
    rules: { userAgent: "*", allow: "/", disallow: "/results/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
