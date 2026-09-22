"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SortableList } from "@/components/admin/sortable-list";
import { Badge } from "@/components/ui/badge";
import { reorderHomeSections, toggleHomeSection } from "@/lib/actions/homepage";

export interface HomeSectionRow {
  id: string;
  key: string;
  label: string;
  visible: boolean;
}

function VisibilityToggle({ id, visible }: { id: string; visible: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [on, setOn] = React.useState(visible);

  React.useEffect(() => setOn(visible), [visible]);

  async function onToggle() {
    setBusy(true);
    setOn((v) => !v);
    const res = await toggleHomeSection(id);
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      setOn(visible);
      toast.error(res.message ?? "Could not update section.");
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      disabled={busy}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
        on ? "bg-ink" : "bg-stone-300"
      }`}
      aria-label={on ? "Hide section" : "Show section"}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function HomeSectionList({ sections }: { sections: HomeSectionRow[] }) {
  return (
    <SortableList
      items={sections}
      onReorder={reorderHomeSections}
      renderItem={(section) => (
        <div className="flex items-center gap-4 py-3 pr-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{section.label}</p>
          </div>
          <Badge tone="neutral" className="font-mono">
            {section.key}
          </Badge>
          <VisibilityToggle id={section.id} visible={section.visible} />
        </div>
      )}
    />
  );
}
