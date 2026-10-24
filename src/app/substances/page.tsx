import type { Metadata } from "next";
import { SubstancesView, substancesMetadata } from "@/views/substances";

export const metadata: Metadata = substancesMetadata(null);

export default function SubstancesPage() {
  return <SubstancesView scope={null} />;
}
