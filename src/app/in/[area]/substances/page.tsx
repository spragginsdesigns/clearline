import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { areas, findArea } from "@/lib/data";
import { SubstancesView, substancesMetadata } from "@/views/substances";

export function generateStaticParams() {
  return areas.map((a) => ({ area: a.slug }));
}

export async function generateMetadata(props: PageProps<"/in/[area]/substances">): Promise<Metadata> {
  const scope = findArea((await props.params).area);
  return scope ? substancesMetadata(scope) : {};
}

export default async function AreaSubstances(props: PageProps<"/in/[area]/substances">) {
  const scope = findArea((await props.params).area);
  if (!scope) notFound();
  return <SubstancesView scope={scope} />;
}
