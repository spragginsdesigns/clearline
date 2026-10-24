import type { Metadata } from "next";
import { PageTitle } from "@/components/section-title";
import { isDemo, latestWeek, samples } from "@/lib/data";
import { formatWeek } from "@/lib/format";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/data",
  title: "Open data",
  description:
    "Download every published Clearline drug checking result as JSON under CC BY 4.0: samples, substances and alerts.",
});

const FILES = [
  { href: "/data/samples.json", name: "samples.json", what: "Every published sample result" },
  { href: "/data/substances.json", name: "substances.json", what: "The substances referenced by results" },
  { href: "/data/alerts.json", name: "alerts.json", what: "Every alert we've posted" },
  { href: "/data/areas.json", name: "areas.json", what: "The broad areas results are grouped by" },
];

export default function DataPage() {
  return (
    <>
      <PageTitle eyebrow="Open data" title="Use our data">
        Every result behind this site is free to download and reuse under{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          CC BY 4.0
        </a>
        . Researchers, public health teams and other drug checking services are welcome to it. Please credit
        Clearline.
      </PageTitle>

      {isDemo && (
        <p className="mb-8 max-w-3xl rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          These files currently hold generated demo data, not real results. Don&rsquo;t use them for research.
        </p>
      )}

      <ul className="max-w-3xl divide-y divide-line rounded-2xl border border-line bg-panel">
        {FILES.map((f) => (
          <li key={f.href} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <div className="font-mono text-sm">{f.name}</div>
              <div className="text-sm text-ink-3">{f.what}</div>
            </div>
            <a href={f.href} download className="rounded-full border border-line-strong px-4 py-1.5 text-sm hover:border-accent hover:text-accent">
              Download JSON
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-3xl text-sm text-ink-3">
        {samples.length.toLocaleString()} samples, latest {formatWeek(latestWeek).toLowerCase()}. Field definitions are
        in{" "}
        <a href="https://github.com/spragginsdesigns/clearline/blob/main/docs/DATA.md" className="text-ink-2 underline underline-offset-4 hover:text-ink">
          docs/DATA.md
        </a>
        .
      </p>
    </>
  );
}
