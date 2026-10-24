import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-ink-3 sm:grid-cols-[2fr_1fr] sm:px-6">
        <div className="space-y-3">
          <p className="text-ink-2">
            <span className="font-medium text-ink">Clearline</span> is an independent drug checking service. We
            publish what we find so people can make safer choices, without judgment.
          </p>
          <p>
            In an emergency call 911. Naloxone reverses opioid overdoses and is available without a prescription at
            most pharmacies.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link href="/methods" className="hover:text-ink">
            How we test
          </Link>
          <Link href="/data" className="hover:text-ink">
            Open data (CC BY 4.0)
          </Link>
          <a href="https://github.com/spragginsdesigns/clearline" className="hover:text-ink">
            Source code (MIT)
          </a>
        </div>
      </div>
    </footer>
  );
}
