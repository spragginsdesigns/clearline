import type { Metadata } from "next";

// The public origin, for canonical URLs, the sitemap and social share images. Set SITE_URL when the
// site gets a domain; on Vercel the production URL is picked up automatically.
export const SITE_URL = new URL(
  process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);

export const SITE_NAME = "Clearline";

/** Where the lab tests, in words. The areas themselves are in data/areas.json. */
export const SERVICE_AREA = "Fresno, Clovis and nearby towns";

export const SITE_DESCRIPTION = `Anonymous drug checking in ${SERVICE_AREA}: purity, cutting agents and alerts from street drug samples tested with reagents, FTIR spectroscopy and fentanyl strips.`;

/**
 * Title, description, canonical URL and share card text for one page. Next merges `openGraph`
 * shallowly, so the site-wide fields are repeated here rather than inherited from the layout.
 */
export function pageMetadata({ path, title, description }: { path: string; title: string; description: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: path, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}
