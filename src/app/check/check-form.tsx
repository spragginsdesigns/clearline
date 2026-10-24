"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const ID_PATTERN = /^CL-[A-Z0-9-]{4,24}$/;

export function CheckForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const id = String(formData.get("id") ?? "").trim().toUpperCase();
    if (!ID_PATTERN.test(id)) {
      setError("Sample IDs look like CL-2026-00123.");
      return;
    }
    setError("");
    startTransition(() => router.push(`/results/${id}`));
  }

  return (
    <form action={submit} className="rounded-2xl border border-line bg-panel p-5">
      <label htmlFor="sample-id" className="mb-2 block text-sm text-ink-2">
        Sample ID
      </label>
      <div className="flex gap-2">
        <input
          id="sample-id"
          name="id"
          placeholder="CL-2026-00123"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "sample-id-error" : undefined}
          className="min-w-0 flex-1 rounded-xl border border-line-strong bg-page px-4 py-3 font-mono uppercase placeholder:text-ink-3 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent px-5 font-medium text-accent-ink transition hover:bg-ink disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Checking…" : "Check"}
        </button>
      </div>
      {error && (
        <p id="sample-id-error" className="mt-2 text-sm text-warning">
          {error}
        </p>
      )}
    </form>
  );
}
