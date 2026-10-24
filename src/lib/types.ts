// The shapes of the files in `data/`. docs/DATA.md documents every field for
// people who use the open dataset without reading this code.

export type SubstanceKind = "active" | "adulterant" | "inactive";

export interface Substance {
  slug: string;
  name: string;
  kind: SubstanceKind;
  /** Chart color. Fixed per substance so it means the same thing on every chart. */
  color: string;
  /** Opioids, xylazine and similar: any detection is treated as an alert. */
  highRisk: boolean;
  /** Substances people bring in as "sold as" get their own page. */
  hasPage: boolean;
  summary: string;
}

export type Method = "reagent" | "ftir" | "fentanyl-strip";

export type StripResult = "positive" | "negative" | "not-run";

export interface Component {
  substance: string;
  /** Estimated percent by weight (FTIR). Null when only detected as a trace. */
  percent: number | null;
}

export interface ReagentResult {
  reagent: string;
  result: string;
  /** The color the lab saw, for the swatch. */
  swatch: string;
}

export interface Sample {
  id: string;
  /** Monday of the week the sample was tested (ISO date). Never the exact day. */
  week: string;
  /** Slug of a broad area in areas.json, never an address or venue. */
  area: string;
  soldAs: string;
  form: "powder" | "crystal" | "pill" | "tar" | "other";
  found: Component[];
  fentanylStrip: StripResult;
  reagents: ReagentResult[];
  methods: Method[];
}

export type AlertSeverity = "warning" | "critical";

export interface Alert {
  id: string;
  week: string;
  severity: AlertSeverity;
  title: string;
  body: string;
  substance: string;
  /** The area it applies to (a slug in areas.json), or null when it applies everywhere. */
  area: string | null;
}

/** A broad area people are shown results for: a metro or region, never anything finer. */
export interface Area {
  slug: string;
  /** Short name, e.g. "Portland". */
  name: string;
  /** State, province or country, e.g. "Oregon". */
  region: string;
  /** Rough center, used only to suggest the nearest area. Never a sample location. */
  lat: number;
  lng: number;
}

export interface Reagent {
  slug: string;
  name: string;
  description: string;
}

export interface Dataset {
  /** True while data/ holds generated demo data instead of real lab results. */
  demo: boolean;
  generatedAt: string;
  samples: Sample[];
}
