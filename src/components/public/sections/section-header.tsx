import { cn } from "@/lib/utils";

export function SectionHeader({
  label,
  title,
  description,
  dark = false,
  className,
}: {
  label?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "section-heading",
        dark && "section-heading-dark",
        className,
      )}
    >
      {label && <p className="section-label">{label}</p>}
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}
