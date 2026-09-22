"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, PhoneCall, Archive, Trash2, Loader2 } from "lucide-react";
import type { InquiryStatus } from "@prisma/client";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { setInquiryStatus, deleteInquiry } from "@/lib/actions/inquiries";

const OPTIONS: { status: InquiryStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: "READ", label: "Mark read", icon: BookOpen },
  { status: "CONTACTED", label: "Mark contacted", icon: PhoneCall },
  { status: "ARCHIVED", label: "Archive", icon: Archive },
];

export function InquiryDetailActions({ id, status }: { id: string; status: InquiryStatus }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = React.useState(false);
  const autoRan = React.useRef(false);

  // Optional: opening a NEW inquiry marks it READ automatically.
  React.useEffect(() => {
    if (status === "NEW" && !autoRan.current) {
      autoRan.current = true;
      setInquiryStatus(id, "READ").then((res) => {
        if (res.ok) router.refresh();
      });
    }
  }, [id, status, router]);

  async function apply(next: InquiryStatus) {
    setBusy(true);
    try {
      const res = await setInquiryStatus(id, next);
      if (res.ok) {
        toast.success(res.message ?? "Updated.");
        router.refresh();
      } else {
        toast.error(res.message ?? "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "Delete inquiry",
      description: "This will permanently delete this inquiry. This cannot be undone.",
      confirmText: "Delete",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await deleteInquiry(id);
      if (res.ok) {
        toast.success(res.message ?? "Deleted.");
        router.push("/admin/inquiries");
      } else {
        toast.error(res.message ?? "Something went wrong.");
        setBusy(false);
      }
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.status}
          onClick={() => apply(o.status)}
          disabled={busy || status === o.status}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-200 px-3 text-sm font-medium text-ink hover:bg-stone-50 disabled:opacity-40"
        >
          <o.icon className="h-3.5 w-3.5 text-stone-400" /> {o.label}
        </button>
      ))}
      <button
        onClick={remove}
        disabled={busy}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
      </button>
    </div>
  );
}
