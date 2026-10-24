import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Disclaimer, ReagentSwatch, VerdictBadge } from "@/components/results";
import { sampleById, samples, substance, verdict } from "@/lib/data";
import { formatWeek } from "@/lib/format";

export function generateStaticParams() {
  return samples.map((s) => ({ id: s.id }));
}

export async function generateMetadata(props: PageProps<"/results/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  // Results are reachable by ID but kept out of search engines.
  return { title: `Result ${id}`, robots: { index: false } };
}

const METHOD_LABELS = { reagent: "Reagent tests", ftir: "FTIR spectroscopy", "fentanyl-strip": "Fentanyl strip" };

export default async function ResultPage(props: PageProps<"/results/[id]">) {
  const { id } = await props.params;
  const sample = sampleById(id);
  if (!sample) notFound();

  const sold = substance(sample.soldAs);
  const v = verdict(sample);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-6">
      <div className="flex items-center justify-between text-sm text-ink-3">
        <Link href="/check" className="hover:text-ink">
          ← Check another
        </Link>
        <span className="font-mono">{sample.id}</span>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-3">Sold as</p>
            <h1 className="font-display text-5xl">{sold.name}</h1>
          </div>
          <VerdictBadge sample={sample} />
        </div>

        <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-ink-3">We found</h2>
        {sample.found.length === 0 ? (
          <p className="mt-3 text-ink-2">Nothing we could identify.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {sample.found.map((c) => {
              const s = substance(c.substance);
              return (
                <li key={c.substance}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className={s.highRisk && c.substance !== sample.soldAs ? "font-medium text-critical" : "text-ink"}>
                      {s.highRisk && c.substance !== sample.soldAs && <span aria-hidden="true">▲ </span>}
                      {s.name}
                    </span>
                    <span className="tabular-nums text-ink-2">{c.percent === null ? "Trace" : `${c.percent}%`}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${c.percent ?? 2}%`,
                        background: s.highRisk && c.substance !== sample.soldAs ? "var(--color-critical)" : s.color,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {v !== "as-expected" && (
        <section
          className={`rounded-2xl border p-5 ${v === "high-risk" ? "border-critical/40 bg-critical/[0.07]" : "border-warning/40 bg-warning/[0.07]"}`}
        >
          <p className={`font-medium ${v === "high-risk" ? "text-critical" : "text-warning"}`}>
            {v === "high-risk" ? "▲ This sample contains something dangerous." : "! This isn't only what it was sold as."}
          </p>
          <p className="mt-2 text-sm text-ink-2">
            {v === "high-risk"
              ? "If you still choose to use it: don't use alone, start with a much smaller amount, and keep naloxone within reach. Opioid overdose signs are slow or no breathing, blue lips and not waking up. Give naloxone and call 911."
              : "Different drugs need different doses and some mix badly. Start low, go slow, and check the substance pages for what we found."}
          </p>
        </section>
      )}

      <section className={`grid gap-4 ${sample.reagents.length > 0 ? "sm:grid-cols-2" : ""}`}>
        {sample.reagents.length > 0 && (
          <div className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="mb-4 text-sm font-medium">Reagent tests</h2>
            <div className="space-y-3">
              {sample.reagents.map((r) => (
                <ReagentSwatch key={r.reagent} result={r} />
              ))}
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="mb-4 text-sm font-medium">Fentanyl strip</h2>
          <p
            className={`text-2xl ${sample.fentanylStrip === "positive" ? "text-critical" : sample.fentanylStrip === "negative" ? "text-good" : "text-ink-3"}`}
          >
            {sample.fentanylStrip === "positive" ? "▲ Positive" : sample.fentanylStrip === "negative" ? "✓ Negative" : "Not run"}
          </p>
          <p className="mt-4 text-sm text-ink-3">
            Tested with {sample.methods.map((m) => METHOD_LABELS[m]).join(", ")}. {formatWeek(sample.week)}, {sample.area}.
          </p>
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
