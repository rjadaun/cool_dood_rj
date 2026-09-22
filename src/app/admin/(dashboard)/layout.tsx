import type { Metadata } from "next";
import { requirePage } from "@/lib/auth/rbac";
import { AdminShell } from "@/components/admin/admin-shell";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";

export const metadata: Metadata = {
  title: "Admin · Rjadaun",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePage("EDITOR");

  return (
    <ConfirmProvider>
      <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>
        {children}
      </AdminShell>
    </ConfirmProvider>
  );
}
