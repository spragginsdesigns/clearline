import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { areas, findArea, pageSubstances } from "@/lib/data";
import { SubstanceView, substanceMetadata } from "@/views/substance";

export function generateStaticParams() {
  return areas.flatMap((a) => pageSubstances.map((s) => ({ area: a.slug, slug: s.slug })));
}

async function resolve(props: PageProps<"/in/[area]/substances/[slug]">) {
  const { area, slug } = await props.params;
  return { scope: findArea(area), s: pageSubstances.find((p) => p.slug === slug) };
}

export async function generateMetadata(props: PageProps<"/in/[area]/substances/[slug]">): Promise<Metadata> {
  const { scope, s } = await resolve(props);
  return scope && s ? substanceMetadata(s, scope) : {};
}

export default async function AreaSubstance(props: PageProps<"/in/[area]/substances/[slug]">) {
  const { scope, s } = await resolve(props);
  if (!scope || !s) notFound();
  return <SubstanceView substance={s} scope={scope} />;
}
