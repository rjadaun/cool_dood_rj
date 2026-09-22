"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArrayInputProps {
  name: string;
  label?: string;
  defaultValue?: string[];
  placeholder?: string;
  hint?: string;
  /** "tags" renders inline chips; "list" renders stacked rows. */
  variant?: "tags" | "list";
}

/**
 * Editable list of strings. Serialises to a JSON array in a hidden input
 * so it round-trips through a server action / Zod array field.
 */
export function ArrayInput({
  name,
  label,
  defaultValue = [],
  placeholder = "Add item and press Enter",
  hint,
  variant = "list",
}: ArrayInputProps) {
  const [items, setItems] = React.useState<string[]>(defaultValue);
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    setItems((prev) => [...prev, value]);
    setDraft("");
  };
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[13px] font-medium text-ink">{label}</label>}
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {variant === "tags" ? (
        <div className="flex flex-wrap gap-2 rounded-md border border-ink/15 bg-white p-2">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-stone-100 px-2 py-1 text-xs text-ink">
              {item}
              <button type="button" onClick={() => remove(i)} className="text-stone-400 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={placeholder}
            className="min-w-[120px] flex-1 text-sm outline-none"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => setItems((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                className="h-10 flex-1 border border-ink/15 bg-white px-3 text-sm outline-none focus:border-ink"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex h-10 w-10 items-center justify-center border border-ink/15 text-stone-400 hover:border-red-300 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
              placeholder={placeholder}
              className={cn("h-10 flex-1 border border-dashed border-ink/20 bg-white px-3 text-sm outline-none focus:border-ink")}
            />
            <button
              type="button"
              onClick={add}
              className="flex h-10 items-center gap-1 border border-ink/15 px-3 text-sm text-ink hover:bg-stone-50"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      )}
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
