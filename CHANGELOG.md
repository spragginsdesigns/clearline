# Changelog

## Unreleased

### What's new

- First version of the Clearline site: the homepage with the latest alert, median purity for each drug and a "sold as
  vs. actually found" chart; a page per substance with its purity spread, cuts and high-risk finds; result lookup by
  sample ID; alerts; how we test; and open data downloads.
- Dark mode only, built for phones first.
- Every page shows a "Demo data" banner while the site runs on generated data.

### Dev notes

- Next.js 16.4 App Router with Cache Components, Bun 1.4, Tailwind CSS 4. All pages, including about 780 result pages,
  are prerendered at build time from `data/*.json`.
- Charts are server-rendered SVG with native tooltips and table views. Colors come from the dataviz reference dark
  palette, validated for color-blind separation against the `#121620` panel.
- `bun run seed` writes deterministic demo data (`scripts/seed-demo-data.ts`).
- Design mockups made with GPT Image 2.5 Sunburst are in `docs/mockups/`.
