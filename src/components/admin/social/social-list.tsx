"use client";

import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { Badge } from "@/components/ui/badge";
import { reorderSocial, deleteSocial, toggleSocialVisible } from "@/lib/actions/social";

export interface SocialRow {
  id: string;
  platform: string;
  username: string | null;
  visible: boolean;
}

export function SocialList({ links }: { links: SocialRow[] }) {
  return (
    <SortableList
      items={links}
      onReorder={reorderSocial}
      renderItem={(link) => (
        <div className="flex items-center gap-4 py-2.5 pr-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              {link.platform.charAt(0) + link.platform.slice(1).toLowerCase()}
            </p>
            {link.username && <p className="text-xs text-stone-500">@{link.username}</p>}
          </div>
          <Badge tone={link.visible ? "success" : "neutral"}>{link.visible ? "Visible" : "Hidden"}</Badge>
          <RowActions
            editHref={`/admin/social/${link.id}`}
            deleteLabel="this social link"
            onDelete={() => deleteSocial(link.id)}
            onToggle={() => toggleSocialVisible(link.id)}
            toggleLabel={link.visible ? "Hide" : "Show"}
          />
        </div>
      )}
    />
  );
}
