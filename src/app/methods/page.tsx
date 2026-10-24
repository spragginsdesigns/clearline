import type { Metadata } from "next";
import { PageTitle } from "@/components/section-title";
import { reagents } from "@/lib/data";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/methods",
  title: "How we test",
  description:
    "What reagent tests, FTIR spectroscopy and fentanyl test strips can and can't detect, and how Clearline protects the privacy of everyone who brings a sample.",
});

const METHODS = [
  {
    step: "1",
    name: "Reagent tests",
    what: "A drop of reagent changes color depending on what's in the sample. It's fast and cheap, and it catches the most common substitutions.",
    limits:
      "Reagents are presumptive. They show what is likely present, not how much, and a strong color can hide a second drug. They can't detect fentanyl at the amounts found in street drugs.",
  },
  {
    step: "2",
    name: "FTIR spectroscopy",
    what: "Infrared light gives each compound a fingerprint. We match the sample against a library of known substances and estimate how much of each is there.",
    limits:
      "FTIR reliably sees components above roughly 5% of a sample. Purity figures are estimates, not exact lab assays, and anything under the detection limit can be missed, including potent opioids.",
  },
  {
    step: "3",
    name: "Fentanyl test strips",
    what: "Immunoassay strips detect fentanyl and many related analogues at very low concentrations, well below what FTIR can see.",
    limits:
      "Strips say yes or no, never how much. Some analogues and nitazenes don't trigger them, and an uneven mix means one test can miss what's elsewhere in the bag.",
  },
];

export default function MethodsPage() {
  return (
    <>
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-4 -bottom-8 left-1/3 bg-[url(/images/methods-meniscus.webp)] bg-cover bg-[position:80%_70%] opacity-50 [mask-image:radial-gradient(ellipse_45%_60%_at_78%_50%,black_15%,transparent_68%)] sm:-right-6 sm:opacity-90"
        />
        <div className="relative">
          <PageTitle eyebrow="Methods" title="How we test">
            Every sample goes through more than one test, because each method sees things the others miss.
            Here&rsquo;s what each can and can&rsquo;t tell us.
          </PageTitle>
        </div>
      </div>

      <ol className="grid gap-5 lg:grid-cols-3">
        {METHODS.map((m) => (
          <li key={m.name} className="rounded-2xl border border-line bg-panel p-6">
            <span className="flex size-9 items-center justify-center rounded-full border border-line-strong text-sm">
              {m.step}
            </span>
            <h2 className="mt-4 font-display text-3xl">{m.name}</h2>
            <p className="mt-3 text-ink-2">{m.what}</p>
            <p className="mt-4 border-t border-line pt-4 text-sm text-ink-3">
              <span className="font-medium text-ink-2">Limits. </span>
              {m.limits}
            </p>
          </li>
        ))}
      </ol>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-4xl">The reagents we use</h2>
        <dl className="mt-6 divide-y divide-line border-y border-line">
          {reagents.map((r) => (
            <div key={r.slug} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
              <dt className="font-medium">{r.name}</dt>
              <dd className="text-ink-2">{r.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-4xl">How we protect people</h2>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-ink-2 marker:text-ink-3">
          <li>We never record names, contact details or where a sample was bought.</li>
          <li>Published results show only the week tested and a broad area, never an exact date or place.</li>
          <li>Sample IDs are the only link between a person and their result.</li>
        </ul>
      </section>
    </>
  );
}
