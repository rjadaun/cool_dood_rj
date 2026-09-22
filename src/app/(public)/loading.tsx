import { Skeleton } from "@/components/ui/misc";

export default function PublicLoading() {
  return (
    <div className="min-h-screen">
      <Skeleton className="h-[70vh] w-full" />
      <div className="container-editorial space-y-6 py-20">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-16 w-2/3" />
        <div className="grid grid-cols-2 gap-6 pt-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      </div>
    </div>
  );
}
