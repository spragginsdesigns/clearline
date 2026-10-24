import type { MetadataRoute } from "next";
import { alerts, latestWeek, pageSubstances } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

// Result pages are left out on purpose: they're reachable by sample ID only and kept out of search.
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, SITE_URL).toString();
  const lastModified = latestWeek;
  return [
    { url: url("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: url("/alerts"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    ...alerts.map((a) => ({ url: url(`/alerts/${a.id}`), lastModified: a.week, priority: 0.7 })),
    { url: url("/substances"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    ...pageSubstances.map((s) => ({
      url: url(`/substances/${s.slug}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: url("/check"), changeFrequency: "yearly", priority: 0.6 },
    { url: url("/methods"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/data"), lastModified, changeFrequency: "weekly", priority: 0.5 },
  ];
}
