"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { PageSection } from "@prisma/client";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Checkbox } from "@/components/ui/field";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { FormResult } from "@/lib/actions/helpers";
import { savePageSection, addPageSection, deletePageSection } from "@/lib/actions/pages";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-4 text-[13px] font-medium text-paper hover:bg-ink-soft disabled:opacity-60"
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      Save section
    </button>
  );
}

function SectionCard({ section }: { section: PageSection }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = React.useState(false);
  const [state, formAction] = useActionState<FormResult, FormData>(savePageSection, { ok: false });

  React.useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  async function onDelete() {
    const ok = await confirm({
      title: "Delete section",
      description: "This will permanently delete this section. This cannot be undone.",
      confirmText: "Delete",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    const res = await deletePageSection(section.id);
    setBusy(false);
    if (res.ok) {
      toast.success(res.message ?? "Deleted.");
      router.refresh();
    } else {
      toast.error(res.message ?? "Could not delete.");
    }
  }

  return (
    <AdminCard
      title={section.key}
      action={
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="flex h-8 w-8 items-center justify-center rounded-md text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          aria-label="Delete section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      }
    >
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={section.id} />
        <Field label="Heading" htmlFor={`heading-${section.id}`}>
          <Input id={`heading-${section.id}`} name="heading" defaultValue={section.heading ?? ""} placeholder="Section heading" />
        </Field>
        <Field label="Body" htmlFor={`body-${section.id}`} hint="Basic HTML supported (h2, h3, p, ul, strong, a)">
          <Textarea id={`body-${section.id}`} name="body" defaultValue={section.body ?? ""} rows={4} placeholder="Section body content" className="font-mono text-[13px]" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="CTA text" htmlFor={`ctaText-${section.id}`}>
            <Input id={`ctaText-${section.id}`} name="ctaText" defaultValue={section.ctaText ?? ""} placeholder="Get in touch" />
          </Field>
          <Field label="CTA URL" htmlFor={`ctaUrl-${section.id}`}>
            <Input id={`ctaUrl-${section.id}`} name="ctaUrl" defaultValue={section.ctaUrl ?? ""} placeholder="/contact" />
          </Field>
        </div>
        <div className="flex items-center justify-between">
          <Checkbox id={`visible-${section.id}`} name="visible" defaultChecked={section.visible} label="Visible" />
          <SaveButton />
        </div>
      </form>
    </AdminCard>
  );
}

export function PageSectionsEditor({ pageId, sections }: { pageId: string; sections: PageSection[] }) {
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);

  async function onAdd() {
    setAdding(true);
    const res = await addPageSection(pageId, "");
    setAdding(false);
    if (res.ok) {
      toast.success(res.message ?? "Section added.");
      router.refresh();
    } else {
      toast.error(res.message ?? "Could not add section.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Sections</h2>
          <p className="mt-0.5 text-xs text-stone-500">Editable blocks that make up this page.</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={adding}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-200 px-3 text-[13px] font-medium text-ink hover:bg-stone-50 disabled:opacity-60"
        >
          {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-500">
          No sections yet. Add one to start building this page.
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
