import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BarList, Histogram, StackedMonths } from "@/components/charts";
import { EmptyState } from "@/components/empty-state";
import { AlertBanner, Disclaimer, SampleRow } from "@/components/results";
import { SectionTitle } from "@/components/section-title";
import { alerts, pageSubstances, samples, soldAsMix, stats, substance, withinDays } from "@/lib/data";
import { formatMonth, percent } from "@/lib/format";
import { pageMetadata } from "@/lib/site";

const WINDOW_DAYS = 90;

export function generateStaticParams() {
  return pageSubstances.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<"/substances/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const s = pageSubstances.find((p) => p.slug === slug);
  return s
    ? pageMetadata({
        path: `/substances/${s.slug}`,
        title: s.name,
        description: `${s.name} drug checking results: purity, cutting agents and alerts from tested samples. ${s.summary}`,
      })
    : {};
}

export default async function SubstancePage(props: PageProps<"/substances/[slug]">) {
  const { slug } = await props.params;
  const s = pageSubstances.find((p) => p.slug === slug);
  if (!s) notFound();

  const recent = withinDays(WINDOW_DAYS);
  const st = stats(slug, recent);
  const mix = soldAsMix(slug);
  const alert = alerts.find((a) => a.substance === slug);
  const latest = recent.filter((x) => x.soldAs === slug).toSorted((a, b) => b.week.localeCompare(a.week)).slice(0, 5);
  const highRiskFinds = st.alsoFound.filter((f) => substance(f.slug).highRisk);
  const allTime = samples.filter((x) => x.soldAs === slug).length;

  return (
    <div className="space-y-12 pt-6">
      <div>
        <Link href="/substances" className="text-sm text-ink-3 hover:text-ink">
          ← All substances
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <h1 className="font-display text-6xl sm:text-7xl">{s.name}</h1>
            <p className="mt-2 text-lg text-ink-2">
              Last {WINDOW_DAYS} days · {st.count} samples ({allTime} all time)
            </p>
          </div>
          <p className="text-ink-2">{s.summary}</p>
        </div>
      </div>

      {alert && <AlertBanner alert={alert} />}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <Panel title="Purity distribution" note="Estimated share of each sample that is actually the drug it was sold as (FTIR).">
          {st.count === 0 ? (
            <EmptyState compact title={`No ${s.name} samples in the last ${WINDOW_DAYS} days`} />
          ) : (
            <>
              <Histogram bins={st.bins} median={st.median} color={s.color} />
              <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                <Stat label="Median" value={`${st.median}%`} />
                <Stat label="Middle half" value={`${st.q1}-${st.q3}%`} />
                <Stat label="As expected" value={percent(st.asExpectedRate)} />
                <Stat label="None of it" value={percent(st.absentRate)} />
              </dl>
              <details className="mt-4 text-sm text-ink-3">
                <summary className="cursor-pointer hover:text-ink">Show as a table</summary>
                <table className="mt-3 w-full tabular-nums">
                  <thead>
                    <tr className="text-left">
                      <th className="py-1 font-medium">Purity</th>
                      <th className="py-1 text-right font-medium">Samples</th>
                    </tr>
                  </thead>
                  <tbody>
                    {st.bins.map((n, i) => (
                      <tr key={i} className="border-t border-line">
                        <td className="py-1">
                          {i * 5}-{i * 5 + 4}%
                        </td>
                        <td className="py-1 text-right">{n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
        </Panel>

        <div className="space-y-6">
          {highRiskFinds.length > 0 || st.fentanylRate > 0 ? (
            <section className="rounded-2xl border border-critical/40 bg-critical/[0.07] p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-critical">▲ High risk</p>
              <p className="mt-2 font-display text-5xl text-critical">{percent(st.highRiskRate)}</p>
              <p className="mt-1 text-ink">of samples held something dangerous that it wasn&rsquo;t sold as.</p>
              <ul className="mt-4 space-y-1 text-sm text-ink-2">
                {highRiskFinds.map((f) => (
                  <li key={f.slug}>
                    <span className="text-ink">{substance(f.slug).name}</span> in {percent(f.rate)} · {substance(f.slug).summary}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-critical/20 pt-4 text-sm text-ink">
                Test every time, start low, don&rsquo;t use alone, and carry naloxone.
              </p>
            </section>
          ) : st.count === 0 ? null : (
            <section className="rounded-2xl border border-good/30 bg-good/[0.06] p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-good">✓ No fentanyl found</p>
              <p className="mt-2 text-ink-2">
                None in the last {WINDOW_DAYS} days. That can change from one batch to the next, so keep testing.
              </p>
            </section>
          )}

          <Panel title="Also found" note="Share of samples each one appeared in. A sample can hold several, so these don't add up to 100.">
            {st.alsoFound.length ? (
              <BarList
                items={st.alsoFound.slice(0, 8).map((f) => ({
                  key: f.slug,
                  label: substance(f.slug).name,
                  rate: f.rate,
                  count: f.count,
                  color: substance(f.slug).highRisk ? "var(--color-critical)" : s.color,
                  note: substance(f.slug).highRisk ? "▲ high risk" : undefined,
                }))}
              />
            ) : (
              <EmptyState compact title="Nothing else detected" />
            )}
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <Panel title={`What "${s.name}" turned out to be`} note="The main active drug in each sample, by month.">
          <StackedMonths
            keys={mix.keys}
            rows={mix.rows.map((r) => ({ ...r, label: formatMonth(r.month) }))}
            label={(k) => (k === "none" ? "Nothing active" : substance(k).name)}
            color={(k) => (k === "none" ? "#5a5955" : substance(k).color)}
          />
        </Panel>
        <div>
          <SectionTitle eyebrow="Latest" title="Recent samples" />
          {latest.length ? (
            <ul className="space-y-3">
              {latest.map((x) => (
                <SampleRow key={x.id} sample={x} />
              ))}
            </ul>
          ) : (
            <EmptyState compact title={`No ${s.name} samples in the last ${WINDOW_DAYS} days`} />
          )}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}

function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-panel p-6">
      <h2 className="text-lg font-medium">{title}</h2>
      {note && <p className="mb-5 mt-1 text-sm text-ink-3">{note}</p>}
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel px-4 py-3">
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="text-xl tabular-nums">{value}</dd>
    </div>
  );
}
