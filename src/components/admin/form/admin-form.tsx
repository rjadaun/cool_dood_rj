"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { FormResult } from "@/lib/actions/helpers";
import { cn } from "@/lib/utils";

type Errors = Record<string, string>;

interface AdminFormProps {
  action: (prev: FormResult, formData: FormData) => Promise<FormResult>;
  children: React.ReactNode | ((errors: Errors) => React.ReactNode);
  submitLabel?: string;
  cancelHref: string;
  hiddenId?: string;
  className?: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}

export function AdminForm({
  action,
  children,
  submitLabel = "Save changes",
  cancelHref,
  hiddenId,
  className,
}: AdminFormProps) {
  const [state, formAction] = useActionState<FormResult, FormData>(action, { ok: false });

  React.useEffect(() => {
    if (state.message && !state.ok) toast.error(state.message);
  }, [state]);

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className={cn("space-y-8", className)}>
      {hiddenId && <input type="hidden" name="id" value={hiddenId} />}
      {typeof children === "function" ? children(errors) : children}

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-stone-200 bg-white/90 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
        <Link
          href={cancelHref}
          className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-stone-600 hover:bg-stone-100"
        >
          Cancel
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
