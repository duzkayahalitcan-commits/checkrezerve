export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-44 bg-gradient-to-br from-zinc-100 to-zinc-200" />
      <div className="p-5 space-y-3">
        {/* Icon + title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-3/4 bg-zinc-200 rounded-full" />
            <div className="h-3 w-1/2 bg-zinc-100 rounded-full" />
          </div>
        </div>
        {/* Description lines */}
        <div className="space-y-1.5">
          <div className="h-3 w-full  bg-zinc-100 rounded-full" />
          <div className="h-3 w-5/6  bg-zinc-100 rounded-full" />
        </div>
        {/* CTA */}
        <div className="h-9 w-full bg-zinc-100 rounded-xl mt-2" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
