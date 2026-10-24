# Changelog

## Unreleased

### What's new

- First version of the Clearline site: the homepage with the latest alert, median purity for each drug and a "sold as
  vs. actually found" chart; a page per substance with its purity spread, cuts and high-risk finds; result lookup by
  sample ID; alerts; how we test; and open data downloads.
- Dark mode only, built for phones first.
- Every page shows a "Demo data" banner while the site runs on generated data.
- A real logo: a lab vessel with one level line across it ("a level, honest reading"), with a matching favicon set,
  home screen icon and social share image. The wordmark is now "Clearline" in sentence case.
- Shareable story cards: every alert has its own page at `/alerts/<id>` with a 1080x1920 image for Instagram and
  TikTok stories (Save story image). Cards show the week only, never a place or a person, and stay clear of the
  areas Instagram and TikTok cover with their own controls.
- The homepage has a spectrum texture behind the hero, a row of headline numbers (samples tested, last 90 days,
  latest week), and the purity ring now shows the most-tested drug.
- Substance cards fill the grid with no gaps at any count, and show the usual reagent colors for each drug, like the
  original mockup.
- Calm empty states (with the logo as an empty vessel) for no alerts, no recent samples and unknown result IDs, a
  "Checking…" state on the lookup button, a loading skeleton for result pages, and a proper 404 page.
- "How we test" has a header image.
- The "sold as vs. actually found" chart has a "Show as a table" view.
- Every page has its own title, description, canonical URL and share card text. There is a `sitemap.xml` (result
  pages left out on purpose) and a `robots.txt` that keeps crawlers away from `/results/`.
- While the site runs on demo data it stays out of search engines entirely: `robots.txt` disallows everything, every
  page has a `noindex, nofollow` meta tag, and every response (images and JSON too) sends `X-Robots-Tag: noindex,
  nofollow`. All three switch off on their own when `data/samples.json` has `"demo": false`.

### Dev notes

- Next.js 16.4 App Router with Cache Components, Bun 1.4, Tailwind CSS 4. All pages, including about 780 result pages,
  are prerendered at build time from `data/*.json`.
- Charts are server-rendered SVG with native tooltips and table views. Colors come from the dataviz reference dark
  palette, validated for color-blind separation against the `#121620` panel.
- `bun run seed` writes deterministic demo data (`scripts/seed-demo-data.ts`).
- Design mockups made with GPT Image 2.5 Sunburst are in `docs/mockups/`.
- Brand and site art: `bun scripts/sunburst.ts <name>` calls Sunburst (`gpt-image-2.5-sunburst`, medium quality) with
  the prompts in `scripts/sunburst/` and logs each call to `docs/brand/sunburst-calls.jsonl`. Eight logo directions
  and five art images cost $0.175 in total. Provenance, the chosen images and how the mark is built are in
  `docs/brand/README.md`.
- The mark's geometry lives once in `src/lib/brand.ts`. `bun run icons` (needs ImageMagick 7) rewrites
  `src/app/icon.svg`, `favicon.ico`, `apple-icon.png` and `public/brand/mark.svg` from it.
- The share image and story cards are drawn with `next/og` and prerendered at build time. Their fonts (Geist,
  Instrument Serif, both OFL) are in `src/assets/fonts/` with their licenses. Assets are read synchronously because,
  with Cache Components, an async file read would make those routes render on every request.
- Set `SITE_URL` to the public origin once there is a domain; it feeds canonical URLs, the sitemap, `robots.txt`, share
  images and the address printed on story cards. On Vercel the production URL is used automatically.
- `typicalReagents()` in `src/lib/data.ts` gives the most common result per reagent for a drug.
