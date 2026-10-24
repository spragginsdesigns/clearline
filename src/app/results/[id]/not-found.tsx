import Link from "next/link";
import { EmptyState } from "@/components/empty-state";

export default function ResultNotFound() {
  return (
    <div className="mx-auto max-w-xl pt-16">
      <EmptyState title="No result for that ID yet">
        <p>
          Results show up once the lab has finished testing, which can take a few days. Check the ID against your
          receipt or test bag; it looks like CL-2026-00123.
        </p>
        <p className="mt-4">
          <Link href="/check" className="text-ink hover:text-accent">
            ← Try another ID
          </Link>
        </p>
      </EmptyState>
    </div>
  );
}
