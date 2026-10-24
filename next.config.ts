import type { NextConfig } from "next";
import samples from "./data/samples.json";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // While data/ holds demo data, tell search engines to skip everything, including images and JSON
  // that a <meta> tag can't cover. Goes away when data/samples.json has "demo": false.
  async headers() {
    if (!samples.demo) return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
