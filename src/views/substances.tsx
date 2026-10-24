import type { Metadata } from "next";
import Link from "next/link";
import { Histogram } from "@/components/charts";
import { PageTitle } from "@/components/section-title";
import { pageSubstances, samplesIn, stats, withinDays } from "@/lib/data";
import { percent } from "@/lib/format";
import { scopedHref } from "@/lib/scope";
import { pageMetadata } from "@/lib/site";
import type { Area } from "@/lib/types";

export function substancesMetadata(scope: Area | null): Metadata {
  const where = scope ? ` in ${scope.name}, ${scope.region}` : "";
  return pageMetadata({
    path: scopedHref("/substances", scope?.slug ?? null),
    title: scope ? `Substances in ${scope.name}` : "Substances",
    description: `Median purity, what else turned up and how often something dangerous was found${where}, for each drug people bring in for testing.`,
  });
}

export function SubstancesView({ scope }: { scope: Area | null }) {
  const recent = withinDays(90, samplesIn(scope));
  return (
    <>
      <PageTitle eyebrow={scope ? `${scope.name} · last 90 days` : "All areas · last 90 days"} title="Substances">
        Purity and what else we found, for each drug people bring us{scope ? ` in ${scope.name}` : ""}. Pick one for
        the full breakdown.
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
                    <Link
                      href={scopedHref(`/substances/${s.slug}`, scope?.slug ?? null)}
                      className="font-display text-xl hover:text-accent"
                    >
                      {s.name}
                    </Link>
                    <div className="text-xs text-ink-3">n={st.count}</div>
                  </td>
                  <td className="hidden w-48 px-4 py-4 sm:table-cell">
                    {st.count > 0 && <Histogram bins={st.bins} median={st.median} color={s.color} compact />}
                  </td>
                  <td className="px-4 py-4 text-right text-lg tabular-nums">{st.count > 0 ? `${st.median}%` : "-"}</td>
                  <td className="hidden px-4 py-4 text-right tabular-nums text-ink-2 sm:table-cell">
                    {st.count > 0 ? percent(st.asExpectedRate) : "-"}
                  </td>
                  <td className={`px-4 py-4 text-right tabular-nums ${st.highRiskRate > 0 ? "text-critical" : "text-ink-3"}`}>
                    {st.count > 0 ? percent(st.highRiskRate) : "-"}
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
