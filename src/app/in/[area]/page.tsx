import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { areas, findArea } from "@/lib/data";
import { HomeView, homeMetadata } from "@/views/home";

// Every page under /in/<area> is the all-areas page filtered to one area, prerendered per area.

export function generateStaticParams() {
  return areas.map((a) => ({ area: a.slug }));
}

export async function generateMetadata(props: PageProps<"/in/[area]">): Promise<Metadata> {
  const scope = findArea((await props.params).area);
  return scope ? homeMetadata(scope) : {};
}

export default async function AreaHome(props: PageProps<"/in/[area]">) {
  const scope = findArea((await props.params).area);
  if (!scope) notFound();
  return <HomeView scope={scope} />;
}
