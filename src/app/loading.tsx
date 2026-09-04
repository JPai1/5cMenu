import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <Skeleton className="h-4 w-20 rounded-md bg-white/10" />
      <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
