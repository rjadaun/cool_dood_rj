import { Skeleton } from "@/components/ui/misc";
export default function PublicLoading() {
  return (
    <div
      className="container-editorial py-10"
      role="status"
      aria-label="Loading page"
    >
      <Skeleton className="h-12 w-2/3 max-w-lg" />
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    </div>
  );
}
