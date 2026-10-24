// Writes deterministic DEMO data to data/samples.json and data/alerts.json so the
// site can be built and designed before real lab results exist. Nothing here is
// a real result. The rates are rough, plausible shapes, not measurements, and the
// reagent colors are illustrative: the lab replaces this whole file with its own
// export (see docs/DATA.md), and the site shows a "demo data" banner until then.
//
//   bun run seed

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Alert, Component, ReagentResult, Sample } from "../src/lib/types";

const OUT = join(process.cwd(), "data");
const LAST_WEEK = new Date("2026-10-19T00:00:00Z");
const WEEKS = 26;
const AREAS = ["Northside", "Downtown", "Eastside", "Riverside", "West End"];

// Fixed seed so a rebuild never reshuffles the demo.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261024);
const chance = (p: number) => rand() < p;
const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];
function normal(mean: number, sd: number, min: number, max: number) {
  const u = 1 - rand();
  const v = rand();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.round(Math.min(max, Math.max(min, mean + z * sd)));
}

const REAGENTS: Record<string, ReagentResult[]> = {
  mdma: [
    { reagent: "marquis", result: "Purple to black", swatch: "#3b1650" },
    { reagent: "simons", result: "Blue", swatch: "#2457c5" },
  ],
  mda: [
    { reagent: "marquis", result: "Purple to black", swatch: "#3b1650" },
    { reagent: "simons", result: "No reaction", swatch: "" },
  ],
  "n-ethylpentylone": [{ reagent: "marquis", result: "No reaction", swatch: "" }],
  ketamine: [
    { reagent: "marquis", result: "No reaction", swatch: "" },
    { reagent: "mandelin", result: "Orange", swatch: "#e0761f" },
  ],
  heroin: [
    { reagent: "marquis", result: "Purple", swatch: "#5b2a86" },
    { reagent: "mecke", result: "Green", swatch: "#1f6b3a" },
  ],
  cocaine: [{ reagent: "marquis", result: "No reaction", swatch: "" }],
  methamphetamine: [
    { reagent: "marquis", result: "Orange to brown", swatch: "#9a4a14" },
    { reagent: "simons", result: "Blue", swatch: "#2457c5" },
  ],
};

interface Profile {
  form: Sample["form"][];
  weight: number;
  /** What the sample mostly is, with odds. The rest goes to `soldAs`. */
  swaps: [string | null, number][];
  purity: [number, number];
  cuts: [string, number][];
  fentanyl: number;
  xylazine?: number;
}

const PROFILES: Record<string, Profile> = {
  cocaine: {
    form: ["powder"],
    weight: 0.3,
    swaps: [[null, 0.01]],
    purity: [58, 18],
    cuts: [["levamisole", 0.34], ["phenacetin", 0.12], ["lidocaine", 0.09], ["caffeine", 0.07], ["benzocaine", 0.05]],
    fentanyl: 0.02,
  },
  mdma: {
    form: ["crystal", "powder", "pill"],
    weight: 0.27,
    swaps: [["mda", 0.08], ["n-ethylpentylone", 0.06], [null, 0.03]],
    purity: [76, 13],
    cuts: [["caffeine", 0.12]],
    fentanyl: 0,
  },
  ketamine: {
    form: ["powder", "crystal"],
    weight: 0.2,
    swaps: [["deschloroketamine", 0.04]],
    purity: [84, 10],
    cuts: [["caffeine", 0.02]],
    fentanyl: 0,
  },
  heroin: {
    form: ["powder", "tar"],
    weight: 0.13,
    swaps: [["fentanyl", 0.55]],
    purity: [34, 16],
    cuts: [["caffeine", 0.3]],
    fentanyl: 0.7,
    xylazine: 0.25,
  },
  methamphetamine: {
    form: ["crystal"],
    weight: 0.1,
    swaps: [],
    purity: [90, 6],
    cuts: [["dimethyl-sulfone", 0.15]],
    fentanyl: 0.005,
  },
};

function weightedSoldAs(): string {
  let roll = rand();
  for (const [slug, profile] of Object.entries(PROFILES)) {
    roll -= profile.weight;
    if (roll <= 0) return slug;
  }
  return "cocaine";
}

function primary(profile: Profile, soldAs: string): string | null {
  let roll = rand();
  for (const [slug, odds] of profile.swaps) {
    roll -= odds;
    if (roll <= 0) return slug;
  }
  return soldAs;
}

function makeSample(index: number, week: Date): Sample {
  const soldAs = weightedSoldAs();
  const profile = PROFILES[soldAs];
  const main = primary(profile, soldAs);
  const found: Component[] = [];
  let left = 100;

  if (main) {
    // Fentanyl is potent enough that dealers cut it to single digits.
    const percent = main === "fentanyl" ? normal(7, 4, 1, 25) : normal(profile.purity[0], profile.purity[1], 4, 99);
    found.push({ substance: main, percent });
    left -= percent;
  }
  // Heroin samples that are mostly fentanyl usually still carry some heroin.
  if (soldAs === "heroin" && main === "fentanyl" && chance(0.45)) {
    const percent = Math.min(left, normal(12, 6, 2, 40));
    found.push({ substance: "heroin", percent });
    left -= percent;
  }
  for (const [cut, odds] of profile.cuts) {
    if (!chance(odds) || left <= 2) continue;
    const percent = chance(0.25) ? null : Math.min(left, normal(left * 0.45, 8, 1, left));
    found.push({ substance: cut, percent });
    if (percent) left -= percent;
  }
  if (!found.some((c) => c.substance === "fentanyl") && chance(profile.fentanyl)) {
    found.push({ substance: "fentanyl", percent: soldAs === "heroin" ? normal(8, 4, 1, 20) : null });
  }
  if (profile.xylazine && chance(profile.xylazine)) {
    found.push({ substance: "xylazine", percent: chance(0.5) ? null : normal(10, 5, 2, 25) });
  }

  // Trace fentanyl is only ever found by a strip, so a sample holding it was strip-tested.
  const hasFentanyl = found.some((c) => c.substance === "fentanyl");
  const opioidRisk = soldAs === "heroin" || hasFentanyl || chance(0.7);
  const reagents = main
    ? (REAGENTS[main] ?? REAGENTS[soldAs])
    : [{ reagent: "marquis", result: "No reaction", swatch: "" }];

  return {
    id: `CL-${week.getUTCFullYear()}-${String(index).padStart(5, "0")}`,
    week: week.toISOString().slice(0, 10),
    area: pick(AREAS),
    soldAs,
    form: pick(profile.form),
    found,
    fentanylStrip: opioidRisk ? (hasFentanyl ? "positive" : "negative") : "not-run",
    reagents,
    methods: opioidRisk ? ["reagent", "ftir", "fentanyl-strip"] : ["reagent", "ftir"],
  };
}

const samples: Sample[] = [];
let counter = 1;
for (let w = WEEKS - 1; w >= 0; w--) {
  const week = new Date(LAST_WEEK);
  week.setUTCDate(week.getUTCDate() - w * 7);
  const count = normal(30, 6, 15, 45);
  for (let i = 0; i < count; i++) samples.push(makeSample(counter++, week));
}

const alerts: Alert[] = [
  {
    id: "demo-2026-10-19-cocaine-fentanyl",
    week: "2026-10-19",
    severity: "critical",
    title: "Fentanyl found in samples sold as cocaine",
    body: "Fentanyl turned up in samples sold as cocaine this week. People who don't use opioids have no tolerance, so even a trace can cause an overdose. Test before you use, don't use alone, and carry naloxone.",
    substance: "cocaine",
  },
  {
    id: "demo-2026-10-12-mdma-cathinone",
    week: "2026-10-12",
    severity: "warning",
    title: "Cathinones sold as MDMA",
    body: "Some samples sold as MDMA were mostly N-ethylpentylone, a synthetic cathinone. It lasts much longer than MDMA, so redosing is risky. A Marquis test that gives no reaction is a red flag.",
    substance: "mdma",
  },
  {
    id: "demo-2026-10-05-heroin-xylazine",
    week: "2026-10-05",
    severity: "critical",
    title: "Xylazine in samples sold as heroin",
    body: "Xylazine keeps showing up alongside fentanyl. Naloxone still helps with the opioid part of an overdose, so always give it, then call for help. Xylazine can also cause wounds that need care.",
    substance: "heroin",
  },
];

writeFileSync(
  join(OUT, "samples.json"),
  JSON.stringify({ demo: true, generatedAt: LAST_WEEK.toISOString().slice(0, 10), samples }, null, 1) + "\n",
);
writeFileSync(join(OUT, "alerts.json"), JSON.stringify(alerts, null, 2) + "\n");
console.log(`wrote ${samples.length} demo samples and ${alerts.length} alerts`);
