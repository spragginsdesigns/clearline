import Link from "next/link";
import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl pt-16">
      <EmptyState title="Nothing here">
        <p>That page doesn&rsquo;t exist, or it has moved.</p>
        <p className="mt-4 flex justify-center gap-5">
          <Link href="/" className="text-ink hover:text-accent">
            Home
          </Link>
          <Link href="/substances" className="text-ink hover:text-accent">
            Substances
          </Link>
          <Link href="/check" className="text-ink hover:text-accent">
            Check a result
          </Link>
        </p>
      </EmptyState>
    </div>
  );
}
