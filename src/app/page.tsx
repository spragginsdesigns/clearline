import type { Metadata } from "next";
import Link from "next/link";
import { PurityRing, StackedMonths } from "@/components/charts";
import { EmptyState } from "@/components/empty-state";
import { AlertBanner, SampleRow } from "@/components/results";
import { SectionTitle } from "@/components/section-title";
import { SubstanceCard, SubstanceCardGrid } from "@/components/substance-card";
import {
  alerts,
  latestWeek,
  pageSubstances,
  recentSamples,
  samples,
  soldAsMix,
  stats,
  substance,
  typicalReagents,
  withinDays,
} from "@/lib/data";
import { formatMonth, formatWeekShort } from "@/lib/format";
import { pageMetadata, SITE_DESCRIPTION } from "@/lib/site";

const WINDOW_DAYS = 90;

export const metadata: Metadata = {
  ...pageMetadata({ path: "/", title: "Clearline: know what's really in it", description: SITE_DESCRIPTION }),
  title: { absolute: "Clearline: know what's really in it" },
};

export default function Home() {
  const recent = withinDays(WINDOW_DAYS);
  const cards = pageSubstances.map((s) => ({
    substance: s,
    stats: stats(s.slug, recent),
    reagents: typicalReagents(s.slug, recent),
  }));
  // The ring shows the most-tested drug, so it always has enough samples to mean something.
  const hero = cards.toSorted((a, b) => b.stats.count - a.stats.count)[0];
  const mdmaMix = soldAsMix("mdma");
  const latestAlert = alerts[0];
  const newest = recentSamples(4);

  return (
    <div className="space-y-20 pt-6">
      {latestAlert && <AlertBanner alert={latestAlert} />}

      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-24 bottom-0 left-0 bg-[url(/images/hero-spectrum.webp)] bg-cover bg-[position:75%_center] opacity-90 [mask-image:radial-gradient(ellipse_90%_35%_at_50%_82%,black_25%,transparent_72%)] sm:-right-6 lg:left-[40%] lg:[mask-image:radial-gradient(ellipse_75%_75%_at_55%_55%,black_25%,transparent_72%)]"
        />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-ink-3">Independent drug checking</p>
            <h1 className="font-display text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
              Know what&rsquo;s <em className="text-accent">really</em> in it.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-2">
              We test street drug samples with reagents, FTIR spectroscopy and fentanyl strips, then publish what we
              find: purity, cuts, and anything dangerous. No judgment, no names.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/substances" className="rounded-full bg-ink px-5 py-2.5 font-medium text-page transition hover:bg-accent">
                Explore results
              </Link>
              <Link
                href="/check"
                className="rounded-full border border-line-strong bg-page/40 px-5 py-2.5 font-medium backdrop-blur transition hover:border-ink"
              >
                Check your sample
              </Link>
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-6">
              <HeroStat label="Samples tested" value={samples.length.toLocaleString("en-US")} />
              <HeroStat label={`Last ${WINDOW_DAYS} days`} value={recent.length.toLocaleString("en-US")} />
              <HeroStat label="Latest week" value={latestWeek ? formatWeekShort(latestWeek) : "None yet"} />
            </dl>
          </div>
          {hero && hero.stats.count > 0 && (
            <div className="mx-auto w-full max-w-sm">
              <div className="rounded-full bg-page/50 backdrop-blur-sm">
                <PurityRing median={hero.stats.median} q1={hero.stats.q1} q3={hero.stats.q3} color={hero.substance.color} size={384}>
                  <span className="text-sm text-ink-2">{hero.substance.name} · median purity</span>
                  <span className="font-display text-7xl sm:text-8xl">{hero.stats.median}%</span>
                  <span className="text-sm text-ink-3">
                    middle half {hero.stats.q1}-{hero.stats.q3}% · n={hero.stats.count}
                  </span>
                </PurityRing>
              </div>
              <p className="mt-3 text-center text-xs text-ink-3">Last {WINDOW_DAYS} days. Purity is estimated by FTIR.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow={`Last ${WINDOW_DAYS} days`} title="What's out there right now" href="/substances" link="All substances" />
        {cards.length ? (
          <SubstanceCardGrid>
            {cards.map((c, i) => (
              <SubstanceCard key={c.substance.slug} {...c} index={i} total={cards.length} windowDays={WINDOW_DAYS} />
            ))}
          </SubstanceCardGrid>
        ) : (
          <EmptyState title="No results published yet">Results show up here once the lab publishes its first samples.</EmptyState>
        )}
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="min-w-0 rounded-2xl border border-line bg-panel p-6">
          <SectionTitle eyebrow="Sold as vs. actually found" title={`What "MDMA" turned out to be`} />
          {mdmaMix.rows.length ? (
            <StackedMonths
              keys={mdmaMix.keys}
              rows={mdmaMix.rows.map((r) => ({ ...r, label: formatMonth(r.month) }))}
              label={(k) => (k === "none" ? "Nothing active" : substance(k).name)}
              color={(k) => (k === "none" ? "#5a5955" : substance(k).color)}
            />
          ) : (
            <EmptyState compact title="No MDMA samples yet" />
          )}
          <p className="mt-4 text-sm text-ink-3">The main active drug in each sample sold as MDMA, by month.</p>
        </div>
        <div>
          <SectionTitle eyebrow="Latest" title="Recent samples" />
          {newest.length ? (
            <ul className="space-y-3">
              {newest.map((s) => (
                <SampleRow key={s.id} sample={s} />
              ))}
            </ul>
          ) : (
            <EmptyState compact title="No samples yet" />
          )}
        </div>
      </section>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.7rem] uppercase tracking-[0.15em] text-ink-3">{label}</dt>
      <dd className="mt-1 font-display text-3xl tabular-nums">{value}</dd>
    </div>
  );
}
