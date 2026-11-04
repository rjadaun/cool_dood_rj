import type { ReactNode } from "react";

/** Content remains visible during SSR, reduced motion and slow hydration. */
export function MaskReveal({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  return <Tag className={className}>{children}</Tag>;
}
