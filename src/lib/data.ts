// Every number on the site is computed here from the files in `data/`, at build
// time. Pages never hard-code a figure, so replacing data/samples.json with the
// lab's real export updates the whole site.

import alertsJson from "../../data/alerts.json";
import areasJson from "../../data/areas.json";
import reagentsJson from "../../data/reagents.json";
import samplesJson from "../../data/samples.json";
import substancesJson from "../../data/substances.json";
import type { Alert, Area, Dataset, Reagent, ReagentResult, Sample, Substance } from "./types";

const dataset = samplesJson as Dataset;
export const substances = substancesJson as Substance[];
export const reagents = reagentsJson as Reagent[];
export const alerts = (alertsJson as Alert[]).toSorted((a, b) => b.week.localeCompare(a.week));
export const samples: Sample[] = dataset.samples;
export const isDemo = dataset.demo;

// --- areas ---------------------------------------------------------------

/** Areas in the order the picker lists them: by region, then name. */
export const areas = (areasJson as Area[]).toSorted(
  (a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name),
);
const areaBySlug = new Map(areas.map((a) => [a.slug, a]));

export function area(slug: string): Area {
  const found = areaBySlug.get(slug);
  if (!found) throw new Error(`Unknown area "${slug}" in data/. Add it to data/areas.json.`);
  return found;
}

export function findArea(slug: string): Area | undefined {
  return areaBySlug.get(slug);
}

/** Every sample from one area, or all of them when `scope` is null. */
export function samplesIn(scope: Area | null): Sample[] {
  return scope ? samples.filter((s) => s.area === scope.slug) : samples;
}

/** Alerts that apply to an area: its own plus the ones for everywhere. All of them when `scope` is null. */
export function alertsFor(scope: Area | null): Alert[] {
  return scope ? alerts.filter((a) => a.area === null || a.area === scope.slug) : alerts;
}

/** The newest week in the data. Pages measure "last 90 days" from here, not from today. */
export const latestWeek = samples.reduce((max, s) => (s.week > max ? s.week : max), "");

const bySlug = new Map(substances.map((s) => [s.slug, s]));

export function substance(slug: string): Substance {
  const found = bySlug.get(slug);
  if (!found) throw new Error(`Unknown substance "${slug}" in data/. Add it to data/substances.json.`);
  return found;
}

export function reagent(slug: string): Reagent | undefined {
  return reagents.find((r) => r.slug === slug);
}

export const pageSubstances = substances.filter((s) => s.hasPage);

export function sampleById(id: string): Sample | undefined {
  return samples.find((s) => s.id === id);
}

export function withinDays(days: number, list: Sample[] = samples): Sample[] {
  const cutoff = new Date(`${latestWeek}T00:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const iso = cutoff.toISOString().slice(0, 10);
  return list.filter((s) => s.week > iso);
}

// --- per-sample verdicts -------------------------------------------------

export type Verdict = "as-expected" | "unexpected" | "high-risk";

export function hasHighRisk(sample: Sample): boolean {
  return (
    sample.fentanylStrip === "positive" ||
    sample.found.some((c) => substance(c.substance).highRisk && c.substance !== sample.soldAs)
  );
}

/** The share of the sample that is what it was sold as (0 when absent). */
export function purity(sample: Sample): number {
  return sample.found.find((c) => c.substance === sample.soldAs)?.percent ?? 0;
}

/** The active drug making up most of the sample, or null when nothing active was found. */
export function mainActive(sample: Sample): string | null {
  const actives = sample.found.filter((c) => {
    const kind = substance(c.substance).kind;
    return kind === "active" || (kind === "adulterant" && substance(c.substance).highRisk);
  });
  if (actives.length === 0) return null;
  return actives.toSorted((a, b) => (b.percent ?? 0) - (a.percent ?? 0))[0].substance;
}

export function verdict(sample: Sample): Verdict {
  if (hasHighRisk(sample)) return "high-risk";
  const unexpectedActive = sample.found.some(
    (c) => c.substance !== sample.soldAs && substance(c.substance).kind === "active",
  );
  if (mainActive(sample) !== sample.soldAs || unexpectedActive) return "unexpected";
  return "as-expected";
}

// --- aggregates ----------------------------------------------------------

export function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo));
}

export interface SubstanceStats {
  slug: string;
  count: number;
  median: number;
  q1: number;
  q3: number;
  /** Samples per 5% purity bin: bins[0] = 0-4%, bins[19] = 95-100%. */
  bins: number[];
  /** Share of samples that held none of the drug they were sold as. */
  absentRate: number;
  highRiskRate: number;
  fentanylRate: number;
  asExpectedRate: number;
  /** Everything else found, by share of samples it appeared in. */
  alsoFound: { slug: string; rate: number; count: number }[];
}

export function stats(slug: string, list: Sample[]): SubstanceStats {
  const sold = list.filter((s) => s.soldAs === slug);
  const purities = sold.map(purity).toSorted((a, b) => a - b);
  const bins = Array.from({ length: 20 }, () => 0);
  for (const p of purities) bins[Math.min(19, Math.floor(p / 5))]++;

  const counts = new Map<string, number>();
  for (const s of sold) {
    for (const c of s.found) {
      if (c.substance !== slug) counts.set(c.substance, (counts.get(c.substance) ?? 0) + 1);
    }
  }
  const rate = (n: number) => (sold.length ? n / sold.length : 0);

  return {
    slug,
    count: sold.length,
    median: quantile(purities, 0.5),
    q1: quantile(purities, 0.25),
    q3: quantile(purities, 0.75),
    bins,
    absentRate: rate(sold.filter((s) => purity(s) === 0).length),
    highRiskRate: rate(sold.filter(hasHighRisk).length),
    fentanylRate: rate(
      sold.filter((s) => s.fentanylStrip === "positive" || s.found.some((c) => c.substance === "fentanyl")).length,
    ),
    asExpectedRate: rate(sold.filter((s) => verdict(s) === "as-expected").length),
    alsoFound: [...counts]
      .map(([other, count]) => ({ slug: other, count, rate: rate(count) }))
      .toSorted((a, b) => b.count - a.count),
  };
}

export interface MonthMix {
  month: string;
  total: number;
  /** Share of the month's samples whose main active drug was each key; "none" = nothing active. */
  shares: Record<string, number>;
}

/** What samples sold as `slug` mostly turned out to be, month by month. */
export function soldAsMix(slug: string, list: Sample[] = samples, months = 6): { keys: string[]; rows: MonthMix[] } {
  const sold = list.filter((s) => s.soldAs === slug);
  const monthKeys = [...new Set(sold.map((s) => s.week.slice(0, 7)))].toSorted().slice(-months);
  const keyCounts = new Map<string, number>();
  const rows = monthKeys.map((month) => {
    const inMonth = sold.filter((s) => s.week.startsWith(month));
    const counts: Record<string, number> = {};
    for (const s of inMonth) {
      const main = mainActive(s) ?? "none";
      counts[main] = (counts[main] ?? 0) + 1;
      keyCounts.set(main, (keyCounts.get(main) ?? 0) + 1);
    }
    const shares = Object.fromEntries(Object.entries(counts).map(([k, n]) => [k, n / inMonth.length]));
    return { month, total: inMonth.length, shares };
  });
  // The drug it was sold as first, then by how common, with "nothing active" last.
  const rank = (key: string) => (key === slug ? -1e9 : key === "none" ? 1e9 : -(keyCounts.get(key) ?? 0));
  const keys = [...keyCounts.keys()].toSorted((a, b) => rank(a) - rank(b));
  return { keys, rows };
}

/**
 * The most common result for each reagent run on samples sold as `slug`, in the lab's reagent order.
 * Ties go to the result seen first. Reagents never run on this drug are left out.
 */
export function typicalReagents(slug: string, list: Sample[]): (ReagentResult & { share: number })[] {
  const sold = list.filter((s) => s.soldAs === slug);
  return reagents.flatMap((r) => {
    const results = sold.flatMap((s) => s.reagents.filter((x) => x.reagent === r.slug));
    if (results.length === 0) return [];
    const counts = new Map<string, { result: ReagentResult; count: number }>();
    for (const x of results) {
      const entry = counts.get(x.result) ?? { result: x, count: 0 };
      entry.count++;
      counts.set(x.result, entry);
    }
    const top = [...counts.values()].reduce((best, e) => (e.count > best.count ? e : best));
    return [{ ...top.result, share: top.count / results.length }];
  });
}

export function recentSamples(count: number, list: Sample[] = samples): Sample[] {
  return list.toSorted((a, b) => b.week.localeCompare(a.week) || b.id.localeCompare(a.id)).slice(0, count);
}

