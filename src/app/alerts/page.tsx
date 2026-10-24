import type { Metadata } from "next";
import { AlertsView, alertsMetadata } from "@/views/alerts";

export const metadata: Metadata = alertsMetadata(null);

export default function AlertsPage() {
  return <AlertsView scope={null} />;
}
