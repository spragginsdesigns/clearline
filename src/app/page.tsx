import Link from "next/link";
import { Histogram, PurityRing, StackedMonths } from "@/components/charts";
import { AlertBanner, SampleRow } from "@/components/results";
import { SectionTitle } from "@/components/section-title";
import { alerts, pageSubstances, recentSamples, samples, soldAsMix, stats, substance, withinDays } from "@/lib/data";
import { formatMonth, percent } from "@/lib/format";

const WINDOW_DAYS = 90;

export default function Home() {
  const recent = withinDays(WINDOW_DAYS);
  const cards = pageSubstances.map((s) => ({ substance: s, stats: stats(s.slug, recent) }));
  const hero = cards[0];
  const mdmaMix = soldAsMix("mdma");
  const latestAlert = alerts[0];

  return (
    <div className="space-y-20 pt-6">
      {latestAlert && <AlertBanner alert={latestAlert} />}

      <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-ink-3">Independent drug checking</p>
          <h1 className="font-display text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
            Know what&rsquo;s <em className="text-accent">really</em> in it.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-2">
            We test street drug samples with reagents, FTIR spectroscopy and fentanyl strips, then publish what we
            find: purity, cuts, and anything dangerous. {samples.length.toLocaleString()} samples tested so far.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/substances" className="rounded-full bg-ink px-5 py-2.5 font-medium text-page transition hover:bg-accent">
              Explore results
            </Link>
            <Link href="/methods" className="rounded-full border border-line-strong px-5 py-2.5 font-medium transition hover:border-ink">
              How we test
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <PurityRing median={hero.stats.median} q1={hero.stats.q1} q3={hero.stats.q3} color={hero.substance.color} size={384}>
            <span className="text-sm text-ink-2">{hero.substance.name} · median purity</span>
            <span className="font-display text-7xl sm:text-8xl">{hero.stats.median}%</span>
            <span className="text-sm text-ink-3">
              middle half {hero.stats.q1}-{hero.stats.q3}% · n={hero.stats.count}
            </span>
          </PurityRing>
          <p className="mt-3 text-center text-xs text-ink-3">Last {WINDOW_DAYS} days. Purity is estimated by FTIR.</p>
        </div>
      </section>

      <section>
        <SectionTitle eyebrow={`Last ${WINDOW_DAYS} days`} title="What's out there right now" href="/substances" link="All substances" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ substance: s, stats: st }) => (
            <Link
              key={s.slug}
              href={`/substances/${s.slug}`}
              className="group rounded-2xl border border-line bg-panel p-5 transition hover:border-line-strong hover:bg-panel-raised"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-2xl">{s.name}</h3>
                <span className="text-xs text-ink-3">n={st.count}</span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-ink-3">Median purity</div>
                  <div className="text-4xl font-light tabular-nums">{st.median}%</div>
                </div>
                <div className="w-1/2">
                  <Histogram bins={st.bins} median={st.median} color={s.color} compact />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
                {st.highRiskRate > 0 ? (
                  <span className="text-critical">▲ High risk in {percent(st.highRiskRate)}</span>
                ) : (
                  <span className="text-ink-3">No high-risk finds</span>
                )}
                <span className="text-ink-3 transition group-hover:text-ink">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="rounded-2xl border border-line bg-panel p-6">
          <SectionTitle eyebrow="Sold as vs. actually found" title={`What "MDMA" turned out to be`} />
          <StackedMonths
            keys={mdmaMix.keys}
            rows={mdmaMix.rows.map((r) => ({ ...r, label: formatMonth(r.month) }))}
            label={(k) => (k === "none" ? "Nothing active" : substance(k).name)}
            color={(k) => (k === "none" ? "#5a5955" : substance(k).color)}
          />
          <p className="mt-4 text-sm text-ink-3">The main active drug in each sample sold as MDMA, by month.</p>
        </div>
        <div>
          <SectionTitle eyebrow="Latest" title="Recent samples" />
          <ul className="space-y-3">
            {recentSamples(4).map((s) => (
              <SampleRow key={s.id} sample={s} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
