import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCard } from "@/components/results";
import { alerts, substance } from "@/lib/data";
import { pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return alerts.map((a) => ({ id: a.id }));
}

export async function generateMetadata(props: PageProps<"/alerts/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const alert = alerts.find((a) => a.id === id);
  return alert ? pageMetadata({ path: `/alerts/${alert.id}`, title: alert.title, description: alert.body }) : {};
}

export default async function AlertPage(props: PageProps<"/alerts/[id]">) {
  const { id } = await props.params;
  const alert = alerts.find((a) => a.id === id);
  if (!alert) notFound();
  const story = `/alerts/${alert.id}/story.png`;

  return (
    <div className="space-y-8 pt-6">
      <Link href="/alerts" className="text-sm text-ink-3 hover:text-ink">
        ← All alerts
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="max-w-2xl space-y-6">
          <AlertCard alert={alert} heading="h1">
            <Link href={`/substances/${alert.substance}`} className="mt-4 inline-block text-sm text-ink hover:text-accent">
              See all {substance(alert.substance).name} results →
            </Link>
          </AlertCard>
          <section className="rounded-2xl border border-line bg-panel p-6">
            <h2 className="text-lg font-medium">Share it</h2>
            <p className="mt-1 text-sm text-ink-3">
              A story-sized card (1080x1920) for Instagram and TikTok. It shows the week only, never a place or a person.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={story}
                download={`clearline-alert-${alert.id}.png`}
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-page transition hover:bg-accent"
              >
                Save story image
              </a>
              <a
                href={story}
                target="_blank"
                rel="noopener"
                className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium transition hover:border-ink"
              >
                Open full size
              </a>
            </div>
          </section>
        </div>
        <figure className="mx-auto w-full max-w-[18rem]">
          <Image
            src={story}
            alt={`Story card: ${alert.title}. ${alert.body}`}
            width={1080}
            height={1920}
            unoptimized
            className="h-auto w-full rounded-3xl border border-line-strong shadow-2xl shadow-black/60"
          />
          <figcaption className="mt-3 text-center text-xs text-ink-3">Preview of the story card</figcaption>
        </figure>
      </div>
    </div>
  );
}
