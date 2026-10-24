import Link from "next/link";
import type { ReactNode } from "react";
import { reagent, type SubstanceStats } from "@/lib/data";
import { percent } from "@/lib/format";
import type { ReagentResult, Substance } from "@/lib/types";
import { Histogram } from "./charts";

// The homepage grid is 2 columns on tablets and 3 on desktop (as a 6-track grid). The last row
// stretches its cards so any number of substances fills the grid without a hole.
function spanClasses(index: number, total: number): string {
  const classes = ["lg:col-span-2"];
  const lastRowStart = total - (total % 3 || 3);
  if (index >= lastRowStart) {
    if (total % 3 === 1) classes.push("lg:col-span-6");
    if (total % 3 === 2) classes.push("lg:col-span-3");
  }
  if (total % 2 === 1 && index === total - 1) classes.push("sm:col-span-2");
  return classes.join(" ");
}

export function SubstanceCardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">{children}</div>;
}

export function SubstanceCard({
  substance: s,
  stats: st,
  reagents,
  index,
  total,
  windowDays,
}: {
  substance: Substance;
  stats: SubstanceStats;
  reagents: (ReagentResult & { share: number })[];
  index: number;
  total: number;
  windowDays: number;
}) {
  return (
    <Link
      href={`/substances/${s.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-panel p-5 transition hover:border-line-strong hover:bg-panel-raised ${spanClasses(index, total)}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-20 blur-3xl transition group-hover:opacity-30"
        style={{ background: s.color }}
      />
      <div className="relative flex items-baseline justify-between">
        <h3 className="font-display text-3xl">{s.name}</h3>
        <span className="text-xs text-ink-3">n={st.count}</span>
      </div>

      {st.count === 0 ? (
        <p className="relative mt-4 flex-1 text-sm text-ink-3">No samples in the last {windowDays} days.</p>
      ) : (
        <>
          <div className="relative mt-3 flex items-end justify-between gap-6">
            <div className="shrink-0">
              <div className="text-xs text-ink-3">Median purity</div>
              <div className="text-5xl font-light tabular-nums">{st.median}%</div>
              <div className="mt-1 text-xs text-ink-3">
                Middle half {st.q1}-{st.q3}%
              </div>
            </div>
            <div className="w-1/2 max-w-xs">
              <Histogram bins={st.bins} median={st.median} color={s.color} compact />
            </div>
          </div>

          {reagents.length > 0 && (
            <div className="relative mt-5 border-t border-line pt-4">
              <p className="mb-2.5 text-xs text-ink-3">Usual reagent colors</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-3">
                {reagents.slice(0, 4).map((r) => (
                  <li
                    key={r.reagent}
                    className="flex items-center gap-2 text-xs"
                    title={`${reagent(r.reagent)?.name}: ${r.result} in ${percent(r.share)} of tests`}
                  >
                    <span
                      aria-hidden="true"
                      className="size-4 shrink-0 rounded-full border border-line-strong"
                      style={
                        r.swatch
                          ? { background: r.swatch }
                          : { background: "repeating-linear-gradient(45deg, transparent 0 3px, rgb(255 255 255 / 0.12) 3px 4px)" }
                      }
                    />
                    <span>
                      <span className="block text-ink-2">{reagent(r.reagent)?.name ?? r.reagent}</span>
                      <span className="block text-ink-3">{r.result}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="flex-1" />
      <div className="relative mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
        {st.highRiskRate > 0 ? (
          <span className="text-critical">
            <span aria-hidden="true">▲ </span>High risk in {percent(st.highRiskRate)}
          </span>
        ) : (
          <span className="text-ink-3">
            <span aria-hidden="true">○ </span>No high-risk finds
          </span>
        )}
        <span aria-hidden="true" className="text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-ink">
          →
        </span>
      </div>
    </Link>
  );
}
