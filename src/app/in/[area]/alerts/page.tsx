import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { areas, findArea } from "@/lib/data";
import { AlertsView, alertsMetadata } from "@/views/alerts";

export function generateStaticParams() {
  return areas.map((a) => ({ area: a.slug }));
}

export async function generateMetadata(props: PageProps<"/in/[area]/alerts">): Promise<Metadata> {
  const scope = findArea((await props.params).area);
  return scope ? alertsMetadata(scope) : {};
}

export default async function AreaAlerts(props: PageProps<"/in/[area]/alerts">) {
  const scope = findArea((await props.params).area);
  if (!scope) notFound();
  return <AlertsView scope={scope} />;
}
