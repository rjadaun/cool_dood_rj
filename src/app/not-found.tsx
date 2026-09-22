import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="label text-stone-400">Error 404</p>
      <h1 className="mt-6 font-serif text-display-lg font-light leading-none text-ink">404</h1>
      <p className="mt-6 max-w-sm text-ink/60">
        The page you're looking for has moved or never existed.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex h-12 items-center gap-2 bg-ink px-7 text-[13px] font-medium uppercase tracking-wide text-paper transition-colors hover:bg-ink-soft"
      >
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>
    </div>
  );
}
