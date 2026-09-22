"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="label text-stone-400">Something went wrong</p>
      <h1 className="mt-6 font-serif text-5xl font-light text-ink md:text-6xl">
        An unexpected error occurred.
      </h1>
      <p className="mt-5 max-w-md text-ink/60">
        We've been notified. You can try again, or head back to the homepage.
      </p>
      <div className="mt-10 flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Back home
        </Button>
      </div>
    </div>
  );
}
