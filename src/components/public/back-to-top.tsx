"use client";

export function BackToTop({ children }: { children: React.ReactNode }) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-1.5 hover:text-paper"
    >
      {children}
    </button>
  );
}
