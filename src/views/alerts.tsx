import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { AlertCard } from "@/components/results";
import { PageTitle } from "@/components/section-title";
import { alertsFor, substance } from "@/lib/data";
import { scopedHref } from "@/lib/scope";
import { pageMetadata } from "@/lib/site";
import type { Area } from "@/lib/types";

export function alertsMetadata(scope: Area | null): Metadata {
  const where = scope ? ` in ${scope.name}, ${scope.region}` : "";
  return pageMetadata({
    path: scopedHref("/alerts", scope?.slug ?? null),
    title: scope ? `Alerts in ${scope.name}` : "Alerts",
    description: `Drug checking alerts${where}: when testing finds fentanyl, xylazine, look-alike drugs or anything else that could hurt people.`,
  });
}

export function AlertsView({ scope }: { scope: Area | null }) {
  const list = alertsFor(scope);
  return (
    <>
      <PageTitle eyebrow={scope ? `${scope.name}, ${scope.region}` : "When something dangerous shows up"} title="Alerts">
        We post an alert when testing finds something that could hurt people, like fentanyl in a stimulant or a
        look-alike drug sold under another name.
        {scope && " This list shows alerts for this area and the ones that apply everywhere we test."}
      </PageTitle>
      {list.length === 0 ? (
        <div className="max-w-3xl">
          <EmptyState title="No alerts right now">
            Nothing in recent testing has needed an alert. That can change from week to week, so keep testing.
          </EmptyState>
        </div>
      ) : (
        <ol className="max-w-3xl space-y-5">
          {list.map((a) => (
            <li key={a.id}>
              <AlertCard alert={a}>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <Link
                    href={scopedHref(`/substances/${a.substance}`, a.area ?? scope?.slug ?? null)}
                    className="text-ink hover:text-accent"
                  >
                    See {substance(a.substance).name} results →
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
