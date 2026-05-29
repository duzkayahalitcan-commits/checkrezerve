export default function BusinessCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 flex items-start gap-4 animate-pulse">
      <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-100" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-zinc-100 rounded w-3/4" />
        <div className="h-5 bg-zinc-100 rounded-full w-24" />
        <div className="h-3 bg-zinc-100 rounded w-1/2" />
      </div>
    </div>
  )
}

export function BusinessCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BusinessCardSkeleton key={i} />
      ))}
    </div>
  )
}
