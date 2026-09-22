import type { Metadata } from "next";
import { Toaster } from "sonner";
import { serif, sans } from "./fonts";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata } from "@/lib/seo";
import { Analytics } from "@/components/shared/analytics";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "0",
              border: "1px solid rgba(11,11,12,0.1)",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
        {settings.gaId ? <Analytics gaId={settings.gaId} /> : null}
      </body>
    </html>
  );
}
