import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/public/legal-page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: "Privacy Policy", path: "/privacy-policy" });
}

export default function Page() {
  return <LegalPage slug="privacy-policy" />;
}
