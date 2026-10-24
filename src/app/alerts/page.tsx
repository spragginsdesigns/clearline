import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { AlertCard } from "@/components/results";
import { PageTitle } from "@/components/section-title";
import { alerts, substance } from "@/lib/data";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/alerts",
  title: "Alerts",
  description:
    "Drug checking alerts: when testing finds fentanyl, xylazine, look-alike drugs or anything else that could hurt people.",
});

export default function AlertsPage() {
  return (
    <>
      <PageTitle eyebrow="When something dangerous shows up" title="Alerts">
        We post an alert when testing finds something that could hurt people, like fentanyl in a stimulant or a
        look-alike drug sold under another name.
      </PageTitle>
      {alerts.length === 0 ? (
        <div className="max-w-3xl">
          <EmptyState title="No alerts right now">
            Nothing in recent testing has needed an alert. That can change from week to week, so keep testing.
          </EmptyState>
        </div>
      ) : (
        <ol className="max-w-3xl space-y-5">
          {alerts.map((a) => (
            <li key={a.id}>
              <AlertCard alert={a}>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <Link href={`/substances/${a.substance}`} className="text-ink hover:text-accent">
                    See all {substance(a.substance).name} results →
                  </Link>
                  <Link href={`/alerts/${a.id}`} className="text-ink-2 hover:text-accent">
                    Share as a story →
                  </Link>
                </div>
              </AlertCard>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
