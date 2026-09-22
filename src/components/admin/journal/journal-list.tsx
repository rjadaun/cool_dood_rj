"use client";

import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/ui/badge";
import { deleteBlogPost, toggleBlogStatus } from "@/lib/actions/blog";

export interface JournalRow {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  date: string | null;
  imageUrl: string | null;
}

export function JournalList({ posts }: { posts: JournalRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-left text-[11px] font-medium uppercase tracking-wide text-stone-400">
            <th className="px-4 py-3 font-medium">Post</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-stone-100">
                    {post.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span className="font-medium text-ink">{post.title}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-stone-500">{post.category ?? "-"}</td>
              <td className="px-4 py-3">
                <StatusBadge status={post.status} />
              </td>
              <td className="px-4 py-3 text-stone-500">{post.date ?? "-"}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <RowActions
                    editHref={`/admin/journal/${post.id}`}
                    previewHref={`/journal/${post.slug}`}
                    deleteLabel="this post"
                    onDelete={() => deleteBlogPost(post.id)}
                    onToggle={() => toggleBlogStatus(post.id)}
                    toggleLabel={post.status === "PUBLISHED" ? "Set to draft" : "Publish"}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
