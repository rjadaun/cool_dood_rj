import Link from "next/link";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { MaintenanceScreen } from "@/components/public/maintenance-screen";
import { getSettings } from "@/lib/queries/settings";
import { auth } from "@/lib/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, session] = await Promise.all([getSettings(), auth()]);
  const isPrivileged = !!session?.user;

  // Maintenance mode: public visitors see a holding page; signed-in admins
  // still see the live site so they can preview and keep working.
  if (settings.maintenanceMode && !isPrivileged) {
    return <MaintenanceScreen settings={settings} />;
  }

  return (
    <>
      {settings.maintenanceMode && isPrivileged && (
        <div className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-3 bg-amber-500 px-4 py-1.5 text-center text-[12px] font-medium text-ink">
          <span>
            Maintenance mode is <strong>ON</strong>, only signed-in admins can see the site.
          </span>
          <Link href="/admin/settings" className="underline underline-offset-2 hover:no-underline">
            Turn off
          </Link>
        </div>
      )}
      <ScrollProgress />
      <SiteHeader siteName={settings.siteName} logoUrl={settings.logoUrl} />
      <main id="main" className="min-h-screen">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
