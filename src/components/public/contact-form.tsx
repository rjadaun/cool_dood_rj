"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { submitInquiry, type ActionResult } from "@/lib/actions/public";
import { Field, Input, Textarea, Select } from "@/components/ui/field";

const initial: ActionResult = { ok: false };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex h-13 items-center gap-2 bg-ink px-8 py-4 text-[13px] font-medium uppercase tracking-wide text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Send Inquiry
      {!pending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
    </button>
  );
}

export function ContactForm({
  projectTypes,
  budgets,
}: {
  projectTypes: string[];
  budgets: string[];
}) {
  const [state, formAction] = useActionState(submitInquiry, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  const err = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {/* Honeypot */}
      <input type="text" name="company_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={err.name}>
          <Input id="name" name="name" placeholder="Your full name" autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="email" required error={err.email}>
          <Input id="email" name="email" type="email" placeholder="you@email.com" autoComplete="email" />
        </Field>
        <Field label="Phone" htmlFor="phone" error={err.phone}>
          <Input id="phone" name="phone" placeholder="Optional" autoComplete="tel" />
        </Field>
        <Field label="Company" htmlFor="company" error={err.company}>
          <Input id="company" name="company" placeholder="Optional" autoComplete="organization" />
        </Field>
        <Field label="Project type" htmlFor="projectType" error={err.projectType}>
          <Select id="projectType" name="projectType" defaultValue="">
            <option value="">Select a type</option>
            {projectTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="Other">Other</option>
          </Select>
        </Field>
        <Field label="Budget" htmlFor="budget" error={err.budget}>
          <Select id="budget" name="budget" defaultValue="">
            <option value="">Select a range</option>
            {budgets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Preferred date" htmlFor="preferredDate" error={err.preferredDate}>
          <Input id="preferredDate" name="preferredDate" type="date" />
        </Field>
        <Field label="Location" htmlFor="location" error={err.location}>
          <Input id="location" name="location" placeholder="City / studio" />
        </Field>
      </div>

      <Field label="Message" htmlFor="message" required error={err.message}>
        <Textarea id="message" name="message" rows={6} placeholder="Tell us about your project…" />
      </Field>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Instagram / website" htmlFor="website" error={err.website}>
          <Input id="website" name="website" placeholder="Optional" />
        </Field>
        <Field label="How did you hear about us?" htmlFor="referral" error={err.referral}>
          <Input id="referral" name="referral" placeholder="Optional" />
        </Field>
      </div>

      <Submit />
    </form>
  );
}
