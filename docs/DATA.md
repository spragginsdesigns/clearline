# The Clearline dataset

Everything the site shows is computed at build time from four JSON files in `data/`. Replacing them with real lab
results (and setting `"demo": false`) turns the demo site into the real one; no code changes are needed.

## `samples.json`

```json
{
  "demo": true,
  "generatedAt": "2026-10-19",
  "samples": [ /* Sample, ... */ ]
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `demo` | boolean | `true` while the file holds generated data. Shows the "Demo data" banner on every page. |
| `generatedAt` | ISO date | When the export was made. |

Each **Sample**:

| Field | Type | Meaning |
|-------|------|---------|
| `id` | string | The ID printed on the person's receipt or bag, e.g. `CL-2026-00123`. The lookup accepts `CL-` followed by 4 to 24 letters, digits or dashes. **Real IDs should be random**, not sequential, so one result can't be found by guessing its neighbours. |
| `week` | ISO date | The Monday of the week the sample was tested. Never the exact day. |
| `area` | string | A broad area such as a neighbourhood or region. Never a venue or address. |
| `soldAs` | substance slug | What the person was told it was. Must exist in `substances.json`. |
| `form` | `powder` · `crystal` · `pill` · `tar` · `other` | Physical form. |
| `found` | Component[] | Everything identified, most abundant first. Empty if nothing was identified. |
| `fentanylStrip` | `positive` · `negative` · `not-run` | Fentanyl test strip result. |
| `reagents` | ReagentResult[] | Reagent tests run, in order. |
| `methods` | (`reagent` · `ftir` · `fentanyl-strip`)[] | Which methods were used on this sample. |

A **Component** is `{ "substance": "<slug>", "percent": 42 }`. `percent` is the FTIR estimate of share by weight,
or `null` for a trace detection that couldn't be quantified.

A **ReagentResult** is `{ "reagent": "<slug from reagents.json>", "result": "Purple to black", "swatch": "#3b1650" }`.
`swatch` is the color the tester saw, used for the color dot; leave it `""` for "No reaction".

## `substances.json`

| Field | Meaning |
|-------|---------|
| `slug` | ID used everywhere else (`cocaine`, `n-ethylpentylone`). |
| `name` | Display name. |
| `kind` | `active` (a psychoactive drug), `adulterant` (an added active cut) or `inactive` (filler). |
| `color` | Chart color. Fixed per substance so it means the same thing on every chart. Pick from the validated palette in `src/app/globals.css`. |
| `highRisk` | `true` for fentanyl, xylazine, nitazenes and anything else where a single detection should raise an alert. |
| `hasPage` | `true` for drugs people commonly bring in; these get a `/substances/<slug>` page. |
| `summary` | One or two plain-language sentences shown on the site. |

## `alerts.json`

`{ "id", "week", "severity": "warning" | "critical", "title", "body", "substance" }`. Newest first on the site. The most
recent alert shows on the homepage, and each substance page shows its own latest alert.

## `reagents.json`

`{ "slug", "name", "description" }` for each reagent the lab uses.

## How the numbers are computed

All in `src/lib/data.ts`:

- **Purity** is the `percent` of the component matching `soldAs`, or 0 if it wasn't found at all.
- **Median** and **middle half** (25th to 75th percentile) are over the last 90 days, measured back from the newest
  `week` in the file, not from today.
- **High risk** means the fentanyl strip was positive, or something with `highRisk: true` was found that the sample
  wasn't sold as.
- **As expected** means not high risk, the main active drug is what it was sold as, and no other active drug was found.
- **Also found** rates are the share of samples each substance appeared in. A sample can hold several, so they don't
  add up to 100%.

## Privacy rules

Real exports must follow these, because everything here is public:

1. No names, contact details, payment details or anything else that identifies the person who brought the sample.
2. No seller, venue or address. `area` is a broad region only.
3. `week`, never an exact date or time.
4. Random, unguessable sample IDs.
5. If an area has so few samples in a week that a result could point to one person, merge it into a larger area.
