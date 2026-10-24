import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/section-title";
import { alerts, substance } from "@/lib/data";
import { formatWeek } from "@/lib/format";

export const metadata: Metadata = { title: "Alerts" };

export default function AlertsPage() {
  return (
    <>
      <PageTitle eyebrow="When something dangerous shows up" title="Alerts">
        We post an alert when testing finds something that could hurt people, like fentanyl in a stimulant or a
        look-alike drug sold under another name.
      </PageTitle>
      <ol className="max-w-3xl space-y-5">
        {alerts.map((a) => {
          const critical = a.severity === "critical";
          return (
            <li
              key={a.id}
              id={a.id}
              className={`scroll-mt-8 rounded-2xl border p-6 ${critical ? "border-critical/40 bg-critical/[0.07]" : "border-warning/40 bg-warning/[0.07]"}`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wider ${critical ? "text-critical" : "text-warning"}`}>
                ▲ {critical ? "Alert" : "Heads up"} · {formatWeek(a.week)}
              </p>
              <h2 className="mt-2 font-display text-3xl">{a.title}</h2>
              <p className="mt-3 text-ink-2">{a.body}</p>
              <Link href={`/substances/${a.substance}`} className="mt-4 inline-block text-sm text-ink hover:text-accent">
                See all {substance(a.substance).name} results →
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
