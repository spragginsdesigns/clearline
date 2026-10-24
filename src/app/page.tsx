import type { Metadata } from "next";
import { HomeView, homeMetadata } from "@/views/home";

export const metadata: Metadata = homeMetadata(null);

export default function Home() {
  return <HomeView scope={null} />;
}
