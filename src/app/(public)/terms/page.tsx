import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/public/legal-page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("terms", "Terms");
}

export default function Page() {
  return <LegalPage slug="terms" />;
}
