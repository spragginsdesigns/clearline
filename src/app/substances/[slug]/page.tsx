import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageSubstances } from "@/lib/data";
import { SubstanceView, substanceMetadata } from "@/views/substance";

export function generateStaticParams() {
  return pageSubstances.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<"/substances/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const s = pageSubstances.find((p) => p.slug === slug);
  return s ? substanceMetadata(s, null) : {};
}

export default async function SubstancePage(props: PageProps<"/substances/[slug]">) {
  const { slug } = await props.params;
  const s = pageSubstances.find((p) => p.slug === slug);
  if (!s) notFound();
  return <SubstanceView substance={s} scope={null} />;
}
