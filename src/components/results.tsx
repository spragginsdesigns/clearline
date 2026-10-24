import Link from "next/link";
import type { ReactNode } from "react";
import { reagent, substance, verdict, type Verdict } from "@/lib/data";
import { formatWeek } from "@/lib/format";
import type { Alert, ReagentResult, Sample } from "@/lib/types";

const VERDICTS: Record<Verdict, { label: string; className: string; icon: string }> = {
  "as-expected": { label: "As expected", className: "border-good/40 bg-good/10 text-good", icon: "✓" },
  unexpected: { label: "Not what it was sold as", className: "border-warning/40 bg-warning/10 text-warning", icon: "!" },
  "high-risk": { label: "High risk found", className: "border-critical/50 bg-critical/10 text-critical", icon: "▲" },
};

/** Status always carries an icon and a label, never color alone. */
export function VerdictBadge({ sample }: { sample: Sample }) {
  const v = VERDICTS[verdict(sample)];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${v.className}`}>
      <span aria-hidden="true">{v.icon}</span>
      {v.label}
    </span>
  );
}

export function Disclaimer() {
  return (
    <p className="rounded-xl border border-line bg-panel px-4 py-3 text-sm text-ink-2">
      Results are for harm reduction, not a certificate of safety. Drug content varies between samples, even from the
      same batch, and no test can detect everything.
    </p>
  );
}

export function ReagentSwatch({ result }: { result: ReagentResult }) {
  const r = reagent(result.reagent);
  return (
    <div className="flex items-center gap-3">
      <span
        className="size-8 shrink-0 rounded-full border border-line-strong"
        style={
          result.swatch
            ? { background: `radial-gradient(circle at 35% 30%, ${result.swatch}cc, ${result.swatch} 60%)` }
            : { background: "repeating-linear-gradient(45deg, transparent 0 4px, rgb(255 255 255 / 0.08) 4px 5px)" }
        }
        aria-hidden="true"
      />
      <div className="text-sm">
        <div className="text-ink">{r?.name ?? result.reagent}</div>
        <div className="text-ink-3">{result.result}</div>
      </div>
    </div>
  );
}

export function foundSummary(sample: Sample): string {
  if (sample.found.length === 0) return "Nothing identified";
  return sample.found
    .map((c) => `${substance(c.substance).name} ${c.percent === null ? "(trace)" : `${c.percent}%`}`)
    .join(", ");
}

export function SampleRow({ sample }: { sample: Sample }) {
  return (
    <li>
      <Link
        href={`/results/${sample.id}`}
        className="block rounded-xl border border-line bg-panel px-4 py-3.5 transition hover:border-line-strong hover:bg-panel-raised"
      >
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-ink-3">
            Sold as <span className="font-medium text-ink">{substance(sample.soldAs).name}</span>
          </span>
          <VerdictBadge sample={sample} />
        </div>
        <p className="text-sm text-ink-2">Found: {foundSummary(sample)}</p>
        <p className="mt-1 text-xs text-ink-3">
          {formatWeek(sample.week)} · {sample.area} · {sample.id}
        </p>
      </Link>
    </li>
  );
}

/** One alert in full. `heading` is the level its title sits at on the page. */
export function AlertCard({ alert, heading = "h2", children }: { alert: Alert; heading?: "h1" | "h2"; children?: ReactNode }) {
  const critical = alert.severity === "critical";
  const Title = heading;
  return (
    <article
      id={alert.id}
      className={`scroll-mt-8 rounded-2xl border p-6 ${critical ? "border-critical/40 bg-critical/[0.07]" : "border-warning/40 bg-warning/[0.07]"}`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wider ${critical ? "text-critical" : "text-warning"}`}>
        <span aria-hidden="true">▲ </span>
        {critical ? "Alert" : "Heads up"} · {formatWeek(alert.week)}
      </p>
      <Title className={`mt-2 font-display ${heading === "h1" ? "text-4xl sm:text-5xl" : "text-3xl"}`}>{alert.title}</Title>
      <p className="mt-3 text-ink-2">{alert.body}</p>
      {children}
    </article>
  );
}

export function AlertBanner({ alert }: { alert: Alert }) {
  const critical = alert.severity === "critical";
  return (
    <Link
      href={`/alerts/${alert.id}`}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition sm:items-center ${
        critical ? "border-critical/40 bg-critical/10 hover:bg-critical/15" : "border-warning/40 bg-warning/10 hover:bg-warning/15"
      }`}
    >
      <span aria-hidden="true" className={`text-lg leading-none ${critical ? "text-critical" : "text-warning"}`}>
        ▲
      </span>
      <span className="flex-1">
        <span className={`block text-xs font-semibold uppercase tracking-wider ${critical ? "text-critical" : "text-warning"}`}>
          {critical ? "Alert" : "Heads up"} · {formatWeek(alert.week)}
        </span>
        <span className="font-medium text-ink">{alert.title}</span>
      </span>
      <span className="hidden shrink-0 text-sm text-ink-2 sm:block">Details →</span>
    </Link>
  );
}
