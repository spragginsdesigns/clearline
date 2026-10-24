import type { Metadata } from "next";
import Link from "next/link";
import { Histogram } from "@/components/charts";
import { PageTitle } from "@/components/section-title";
import { pageSubstances, stats, withinDays } from "@/lib/data";
import { percent } from "@/lib/format";

export const metadata: Metadata = { title: "Substances" };

export default function SubstancesPage() {
  const recent = withinDays(90);
  return (
    <>
      <PageTitle eyebrow="Last 90 days" title="Substances">
        Purity and what else we found, for each drug people bring us. Pick one for the full breakdown.
      </PageTitle>
      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wider text-ink-3">
            <tr>
              <th className="px-4 py-3 font-medium">Sold as</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Purity spread</th>
              <th className="px-4 py-3 text-right font-medium">Median</th>
              <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">As expected</th>
              <th className="px-4 py-3 text-right font-medium">High risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pageSubstances.map((s) => {
              const st = stats(s.slug, recent);
              return (
                <tr key={s.slug} className="transition hover:bg-panel">
                  <td className="px-4 py-4">
                    <Link href={`/substances/${s.slug}`} className="font-display text-xl hover:text-accent">
                      {s.name}
                    </Link>
                    <div className="text-xs text-ink-3">n={st.count}</div>
                  </td>
                  <td className="hidden w-48 px-4 py-4 sm:table-cell">
                    <Histogram bins={st.bins} median={st.median} color={s.color} compact />
                  </td>
                  <td className="px-4 py-4 text-right text-lg tabular-nums">{st.median}%</td>
                  <td className="hidden px-4 py-4 text-right tabular-nums text-ink-2 sm:table-cell">
                    {percent(st.asExpectedRate)}
                  </td>
                  <td className={`px-4 py-4 text-right tabular-nums ${st.highRiskRate > 0 ? "text-critical" : "text-ink-3"}`}>
                    {percent(st.highRiskRate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
