"use client";

import { Field, Textarea } from "@/components/ui/field";

interface RichTextProps {
  name: string;
  label?: string;
  defaultValue?: string | null;
  error?: string;
  rows?: number;
  placeholder?: string;
}

/**
 * Lightweight rich-text field: a plain textarea storing raw HTML.
 * The stored value is sanitised server-side via sanitizeHtml before saving.
 */
export function RichText({
  name,
  label = "Content",
  defaultValue,
  error,
  rows = 14,
  placeholder,
}: RichTextProps) {
  return (
    <Field
      label={label}
      htmlFor={name}
      error={error}
      hint="Basic HTML supported (h2, h3, p, ul, strong, a)"
    >
      <Textarea
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        placeholder={placeholder ?? "<p>Write your content using basic HTML…</p>"}
        className="font-mono text-[13px] leading-relaxed"
      />
    </Field>
  );
}
