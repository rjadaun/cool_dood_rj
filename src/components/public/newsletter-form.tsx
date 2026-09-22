"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { subscribeNewsletter, type ActionResult } from "@/lib/actions/public";
import { cn } from "@/lib/utils";

const initial: ActionResult = { ok: false };

function SubmitButton({ dark }: { dark?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Subscribe"
      className={cn(
        "inline-flex h-12 w-12 shrink-0 items-center justify-center transition-colors disabled:opacity-60",
        dark ? "bg-paper text-ink hover:bg-white" : "bg-ink text-paper hover:bg-ink-soft"
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, formAction] = useActionState(subscribeNewsletter, initial);

  useEffect(() => {
    if (state.message) {
      if (state.ok) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="flex w-full max-w-md items-stretch">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label htmlFor="nl-email" className="sr-only">
        Email address
      </label>
      <input
        id="nl-email"
        type="email"
        name="email"
        required
        placeholder="Your email address"
        className={cn(
          "h-12 w-full border px-4 text-sm outline-none transition-colors placeholder:text-current/50",
          dark
            ? "border-white/20 bg-transparent text-paper focus:border-white/60"
            : "border-ink/20 bg-transparent text-ink focus:border-ink"
        )}
      />
      <SubmitButton dark={dark} />
    </form>
  );
}
