import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin · Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://picsum.photos/seed/lumiere-login/1200/1600"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-paper">
          <p className="label text-paper/60">Rjadaun</p>
          <p className="mt-4 font-serif text-4xl font-light leading-tight">
            The studio, behind the scenes.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <span className="font-serif text-2xl font-medium text-ink">Rjadaun</span>
            <h1 className="mt-8 text-2xl font-medium text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-stone-500">Sign in to manage your website.</p>
          </div>
          <LoginForm callbackUrl={callbackUrl ?? "/admin"} />
          <p className="mt-8 text-center text-xs text-stone-400">
            Protected area · authorized users only
          </p>
        </div>
      </div>
    </div>
  );
}
