"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { submitInquiry, type ActionResult } from "@/lib/actions/public";
import { ENQUIRY_LABEL } from "@/lib/enquiry";
import { Field, Input, Textarea, Select } from "@/components/ui/field";

const initial: ActionResult = { ok: false };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex h-13 items-center gap-2 bg-ink px-8 py-4 text-[13px] font-medium tracking-normal text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Sending enquiry…" : ENQUIRY_LABEL}
      {!pending && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </button>
  );
}

export function ContactForm({
  projectTypes,
}: {
  projectTypes: string[];
}) {
  const [state, formAction] = useActionState(submitInquiry, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const allowReset = useRef(false);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      allowReset.current = true;
      formRef.current?.reset();
      allowReset.current = false;
    } else {
      toast.error(state.message);
    }
  }, [state]);

  const err = state.fieldErrors ?? {};

  return (
    <form
      ref={formRef}
      action={formAction}
      className="public-inquiry space-y-6"
      onReset={(event) => {
        if (!allowReset.current) event.preventDefault();
      }}
    >
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={
            state.ok ? "text-sm text-green-800" : "text-sm text-red-700"
          }
        >
          {state.message}
        </p>
      )}
      {/* Honeypot */}
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={err.name}>
          <Input
            id="name"
            name="name"
            required
            placeholder="Your full name"
            autoComplete="name"
          />
        </Field>
        <Field label="Email" htmlFor="email" required error={err.email}>
          <Input
            id="email"
            name="email"
            required
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
          />
        </Field>
      </div>
      <div>
        <Field
          label="Shoot type (optional)"
          htmlFor="projectType"
          error={err.projectType}
        >
          <Select id="projectType" name="projectType" defaultValue="">
            <option value="">Choose a shoot type</option>
            {projectTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="Other">Other</option>
          </Select>
        </Field>
      </div>

      <Field label="Message" htmlFor="message" required error={err.message}>
        <Textarea
          id="message"
          name="message"
          required
          rows={4}
          minLength={10}
          maxLength={4000}
          placeholder="What would you like to photograph? Share your idea, location and approximate date if you have one."
        />
      </Field>

      <p className="text-sm leading-relaxed text-ink/60">
        We&apos;ll reply by email. <a href="/privacy-policy" className="underline underline-offset-4">Read our privacy policy</a>
      </p>
      <Submit />
    </form>
  );
}
