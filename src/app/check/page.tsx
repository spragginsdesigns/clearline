import type { Metadata } from "next";
import { PageTitle } from "@/components/section-title";
import { pageMetadata } from "@/lib/site";
import { CheckForm } from "./check-form";

export const metadata: Metadata = pageMetadata({
  path: "/check",
  title: "Check a result",
  description: "Enter the sample ID from your receipt or test bag to see what the lab found in your sample.",
});

export default function CheckPage() {
  return (
    <>
      <PageTitle eyebrow="Your sample" title="Check a result">
        Enter the sample ID from your receipt or test bag. Results show up once the lab has finished testing.
      </PageTitle>
      <div className="max-w-xl">
        <CheckForm />
        <p className="mt-6 text-sm text-ink-3">
          We never record who brought a sample in. The ID is the only link between you and your result, so keep it
          somewhere safe.
        </p>
      </div>
    </>
  );
}
